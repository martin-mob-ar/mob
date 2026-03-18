import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;
  const id = Number(propertyId);

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data: publicUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .maybeSingle();

  if (!publicUser) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  // Pause: set status=1 (only for non-tokko active properties owned by this user)
  // Setting status != 2 triggers rebuild_property_listing() which removes from properties_read.
  const { data, error } = await supabaseAdmin
    .from('properties')
    .update({ status: 1 })
    .eq('id', id)
    .eq('user_id', publicUser.id)
    .eq('tokko', false)
    .eq('status', 2)
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Propiedad no encontrada o no se puede pausar' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
