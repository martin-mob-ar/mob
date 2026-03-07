import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-component';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: publicUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (!publicUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const propertyIds: number[] = body.propertyIds;

    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json({ error: 'propertyIds inválido' }, { status: 400 });
    }

    // Filter to valid numbers and cap at 100
    const validIds = propertyIds
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0)
      .slice(0, 100);

    if (validIds.length === 0) {
      return NextResponse.json({ migrated: 0 });
    }

    // Get existing favorites to avoid duplicates
    const { data: existing } = await supabaseAdmin
      .from('favoritos')
      .select('property_id')
      .eq('user_id', publicUser.id)
      .in('property_id', validIds);

    const existingSet = new Set((existing ?? []).map((f) => f.property_id));
    const toInsert = validIds
      .filter((id) => !existingSet.has(id))
      .map((id) => ({ user_id: publicUser.id, property_id: id }));

    if (toInsert.length > 0) {
      await supabaseAdmin.from('favoritos').insert(toInsert);
    }

    return NextResponse.json({ migrated: toInsert.length });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
