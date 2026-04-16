import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { deletePhoto } from '@/lib/storage/gcs';

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
    .eq('id', authUser.id)
    .maybeSingle();

  if (!publicUser) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  // Clean up photos from GCS and DB before soft-deleting
  const { data: photos } = await supabaseAdmin
    .from('tokko_property_photo')
    .select('id, storage_path')
    .eq('property_id', id);

  if (photos && photos.length > 0) {
    // Delete files from GCS (non-blocking, best-effort)
    await Promise.all(
      photos
        .filter(p => p.storage_path)
        .map(p => deletePhoto(p.storage_path!).catch(err =>
          console.error('[property/delete] GCS delete failed:', p.storage_path, err)
        ))
    );

    // Hard-delete photo rows (property is being discarded)
    await supabaseAdmin
      .from('tokko_property_photo')
      .delete()
      .eq('property_id', id);
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
