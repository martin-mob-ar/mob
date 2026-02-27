import { NextRequest, NextResponse } from 'next/server';
import {
  uploadPhoto,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/storage/gcs';

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
      { error: error instanceof Error ? error.message : 'Error al subir la foto' },
      { status: 500 }
    );
  }
}
