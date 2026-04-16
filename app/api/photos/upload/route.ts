import { NextRequest, NextResponse } from 'next/server';
import {
  uploadPhoto,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/storage/gcs';
import { getAuthUser } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

/**
 * POST /api/photos/upload
 *
 * Upload a photo to GCS via server.
 * Accepts multipart/form-data with:
 *   - file: the image file
 *   - propertyId: the property ID
 *   - order: the display order (0-based)
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'photos-upload', 30, 60_000);
    if (!rl.success) return rateLimitResponse(rl.resetIn);

    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const propertyId = formData.get('propertyId') as string | null;
    const order = formData.get('order') as string | null;

    if (!file || !propertyId) {
      return NextResponse.json(
        { error: 'file and propertyId are required' },
        { status: 400 }
      );
    }

    // Verify ownership: property must belong to authenticated user
    const { data: publicUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!publicUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('id')
      .eq('id', parseInt(propertyId, 10))
      .eq('user_id', publicUser.id)
      .maybeSingle();

    if (!property) {
      return NextResponse.json({ error: 'Sin acceso a esta propiedad' }, { status: 403 });
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido. Usá JPEG, PNG o WebP.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo excede el tamaño máximo de 15MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const photoOrder = parseInt(order || '0', 10);

    const result = await uploadPhoto(
      parseInt(propertyId, 10),
      photoOrder,
      buffer,
      file.type
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[photos/upload] Error:', error);
    return NextResponse.json(
      { error: 'Error al subir la foto' },
      { status: 500 }
    );
  }
}
