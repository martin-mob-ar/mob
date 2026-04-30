import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-component';
import { supabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { sendAlertDuenoTelefono } from '@/lib/kapso/client';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'users-profile', 15, 60_000);
    if (!rl.success) return rateLimitResponse(rl.resetIn);

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, telefono, telefono_country_code, dni, account_type, source } = body;

    // Normalize Argentine phone: strip leading '9' mobile prefix so we store consistently
    let normalizedPhone = telefono;
    if (telefono && (telefono_country_code || '+54') === '+54') {
      normalizedPhone = telefono.replace(/^9/, '');
    }

    // Check phone uniqueness before updating
    if (normalizedPhone) {
      const countryCode = telefono_country_code || '+54';
      const { data: currentUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single();

      // For +54 numbers, check both with and without leading '9' to prevent duplicates
      const phonesToCheck = countryCode === '+54'
        ? [normalizedPhone, '9' + normalizedPhone]
        : [normalizedPhone];

      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .in('telefono', phonesToCheck)
        .eq('telefono_country_code', countryCode)
        .neq('id', currentUser?.id ?? '');

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { error: 'Este teléfono ya está registrado por otro usuario' },
          { status: 409 }
        );
      }
    }

    // Fetch current user state before update (for account_type guard + alert logic)
    const { data: currentState } = await supabaseAdmin
      .from('users')
      .select('telefono, account_type')
      .eq('id', authUser.id)
      .single();

    // Update public.users row
    const updateData: Record<string, string | number | null> = {};
    if (name !== undefined) updateData.name = name || null;
    if (telefono !== undefined) updateData.telefono = normalizedPhone || null;
    if (telefono_country_code !== undefined) updateData.telefono_country_code = telefono_country_code || null;
    if (dni !== undefined) updateData.dni = dni || null;

    // account_type: only set if it's currently null (never overwrite an existing
    // dueño / inmobiliaria / red-inmobiliaria classification). Valid values 1..4.
    if (
      typeof account_type === 'number' &&
      account_type >= 1 &&
      account_type <= 4
    ) {
      if (currentState?.account_type == null) {
        updateData.account_type = account_type;
      }
    }

    // No-op guard: nothing to update.
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, noop: true });
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', authUser.id)
      .select('id, name, telefono, telefono_country_code, dni, email, account_type')
      .single();

    if (updateError) {
      console.error('[Profile] Update error:', updateError);
      return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
    }

    // Update auth.users display name
    if (name) {
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        user_metadata: { ...authUser.user_metadata, full_name: name },
      });
    }

    // Sync contact_phone to non-tokko properties when phone changes
    // This triggers rebuild_property_listing via the properties UPDATE trigger
    if (telefono !== undefined && updatedUser) {
      const fullPhone = normalizedPhone
        ? `${updateData.telefono_country_code || updatedUser.telefono_country_code || '+54'} ${normalizedPhone}`
        : null;

      await supabaseAdmin
        .from('properties')
        .update({ contact_phone: fullPhone })
        .eq('user_id', updatedUser.id)
        .eq('tokko', false)
        .is('deleted_at', null);
    }

    // Alert: dueño or subir-propiedad user set phone for the first time
    const effectiveAccountType = updateData.account_type ?? currentState?.account_type;
    const shouldAlert = source === 'subir-propiedad' || effectiveAccountType === 2;
    if (shouldAlert && !currentState?.telefono && normalizedPhone) {
      dispatchAlertDuenoTelefono(updatedUser);
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[Profile] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, telefono, telefono_country_code, dni')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.error('[Profile] Fetch error:', error);
      return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error('[Profile] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}

/** Fire-and-forget: send internal WhatsApp alert when dueño/property-uploader sets phone */
function dispatchAlertDuenoTelefono(user: {
  name: string | null;
  telefono: string | null;
  telefono_country_code: string | null;
  email: string | null;
}) {
  (async () => {
    await sendAlertDuenoTelefono({
      userName: user.name ?? 'Sin nombre',
      userEmail: user.email ?? null,
      userPhone: user.telefono!,
      userCountryCode: user.telefono_country_code ?? '+54',
    });
  })().catch((err) => console.error('[users/profile] Dueño phone alert failed:', err));
}
