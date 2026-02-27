import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-component';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, telefono, telefono_area, telefono_country_code, dni } = body;

    // Update public.users row
    const updateData: Record<string, string | null> = {};
    if (name !== undefined) updateData.name = name || null;
    if (telefono !== undefined) updateData.telefono = telefono || null;
    if (telefono_area !== undefined) updateData.telefono_area = telefono_area || null;
    if (telefono_country_code !== undefined) updateData.telefono_country_code = telefono_country_code || null;
    if (dni !== undefined) updateData.dni = dni || null;

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('auth_id', authUser.id)
      .select('id, name, telefono, telefono_area, telefono_country_code, dni, email')
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

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[Profile] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
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
      .select('id, name, email, telefono, telefono_area, telefono_country_code, dni')
      .eq('auth_id', authUser.id)
      .single();

    if (error) {
      console.error('[Profile] Fetch error:', error);
      return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error('[Profile] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
