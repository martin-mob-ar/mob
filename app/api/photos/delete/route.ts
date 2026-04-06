import { NextRequest, NextResponse } from 'next/server';
import { deletePhoto } from '@/lib/storage/gcs';
import { getAuthUser } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/photos/delete
 *
 * Delete a photo from GCS.
 * Body: { storagePath: string, propertyId: number }
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { storagePath, propertyId } = await request.json();

    if (!storagePath) {
      return NextResponse.json(
        { error: 'storagePath is required' },
        { status: 400 }
      );
    }

    // Verify ownership: the photo's property must belong to the authenticated user
    if (propertyId) {
      const { data: publicUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .maybeSingle();

      if (!publicUser) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }

      const { data: property } = await supabaseAdmin
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .eq('user_id', publicUser.id)
        .maybeSingle();

      if (!property) {
        return NextResponse.json({ error: 'Sin acceso a esta propiedad' }, { status: 403 });
      }
    }

    await deletePhoto(storagePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[photos/delete] Error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la foto' },
      { status: 500 }
    );
  }
}
