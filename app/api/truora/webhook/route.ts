import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { truoraWebhookSchema } from '@/lib/validations/truora-webhook';
import { qualify } from '@/lib/hoggax/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = truoraWebhookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    // --- Look up user by phone ---
    // Strip everything except digits from the incoming phone
    const cleanPhone = payload.phone.replace(/[^0-9]/g, '');

    // Fetch all users with a phone number and match in-memory
    // (handles multiple formats: digits-only, with country code, etc.)
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, telefono_country_code, telefono')
      .not('telefono', 'is', null);

    let userId: string | null = null;

    if (users) {
      const match = users.find((u) => {
        const codeDigits = (u.telefono_country_code || '').replace(/[^0-9]/g, '');
        const full = codeDigits + (u.telefono || '');
        // Match against full number (country code + phone) or just the phone digits
        return full === cleanPhone || u.telefono === cleanPhone;
      });
      userId = match?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no encontrado para el teléfono proporcionado' },
        { status: 404 }
      );
    }

    // --- Call Hoggax Calificación API ---
    let hoggaxApproved: boolean | null = null;
    let hoggaxMaxRent: number | null = null;
    let hoggaxRawResponse: Record<string, unknown> | null = null;

    try {
      const { response, rawResponse } = await qualify(payload);
      hoggaxRawResponse = rawResponse;
      hoggaxApproved = response.approved ?? null;
      hoggaxMaxRent = typeof response.max_rent_plus_expenses === 'number'
        ? response.max_rent_plus_expenses
        : null;
    } catch (hoggaxError) {
      console.error('[TruoraWebhook] Hoggax API call failed:', hoggaxError);
      // Store the error but don't fail the whole request
      hoggaxRawResponse = {
        error: hoggaxError instanceof Error ? hoggaxError.message : 'Unknown error',
      };
    }

    // --- Insert into verificaciones_hoggax ---
    const { error: insertError } = await supabaseAdmin
      .from('verificaciones_hoggax')
      .insert({
        user_id: userId,
        flow_name: 'verificacion_para_agendar_visita',
        hoggax_max_rent_plus_expenses: hoggaxMaxRent,
        hoggax_approved: hoggaxApproved,
        dni: payload.document_value,
        genero: payload.gender_id,
        situacion_laboral: payload.employment_situation_id,
        antiguedad: payload.antiquity_id ?? null,
        ingresos_mensuales: payload.monthly_income ?? null,
        hoggax_raw_response: hoggaxRawResponse,
      });

    if (insertError) {
      console.error('[TruoraWebhook] Insert verificacion error:', insertError);
    }

    // --- Update users table ---
    const userUpdate: Record<string, unknown> = {
      hoggax_max_rent_plus_expenses: hoggaxMaxRent,
      hoggax_approved: hoggaxApproved,
      dni: payload.document_value,
    };

    // Set last_verification_date only when approved
    if (hoggaxApproved === true) {
      userUpdate.last_verification_date = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(userUpdate)
      .eq('id', userId);

    if (updateError) {
      console.error('[TruoraWebhook] Update user error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      hoggax_approved: hoggaxApproved,
      hoggax_max_rent_plus_expenses: hoggaxMaxRent,
    });
  } catch (error) {
    console.error('[TruoraWebhook] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
