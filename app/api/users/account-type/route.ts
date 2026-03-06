import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-component';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { account_type } = await request.json();

    if (![1, 2, 3].includes(account_type)) {
      return NextResponse.json({ error: 'Tipo de cuenta inválido' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ account_type })
      .eq('auth_id', authUser.id);

    if (error) {
      console.error('[Account Type] Update error:', error);
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Account Type] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
