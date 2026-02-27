import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-component';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: publicUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (!publicUser) {
      return NextResponse.json({ claimed: 0 });
    }

    // Link any guest leads with this email to the authenticated user
    const { data, error } = await supabaseAdmin
      .from('leads')
      .update({ submitter_user_id: publicUser.id })
      .eq('email', user.email)
      .is('submitter_user_id', null)
      .select('id');

    if (error) {
      console.error('[Leads] Claim error:', error);
      return NextResponse.json({ error: 'Error al vincular consultas' }, { status: 500 });
    }

    return NextResponse.json({ claimed: data?.length ?? 0 });
  } catch (error) {
    console.error('[Leads] Claim unexpected error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
