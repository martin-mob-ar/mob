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

  // Resolve auth_id → public users.id
  const { data: publicUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .maybeSingle();

  if (!publicUser) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  // Soft-delete: set deleted_at + status = 0 (ownership enforced via user_id filter).
  // Setting status != 2 automatically triggers rebuild_property_listing(), which
  // deletes the row from properties_read — so the property disappears from all listings.
  const { data, error } = await supabaseAdmin
    .from('properties')
    .update({
      deleted_at: new Date().toISOString(),
      status: 0,
    })
    .eq('id', id)
    .eq('user_id', publicUser.id)
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Propiedad no encontrada o sin acceso' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
