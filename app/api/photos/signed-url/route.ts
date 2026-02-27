import { NextRequest, NextResponse } from 'next/server';
import {
  generateSignedUploadUrl,
  buildStoragePath,
  getPublicUrl,
  ALLOWED_IMAGE_TYPES,
} from '@/lib/storage/gcs';

/**
 * POST /api/photos/signed-url
 *
 * Generate a signed URL for direct client-to-GCS upload.
 * The client uploads directly to GCS using the returned URL (PUT request).
 *
 * Body: { propertyId: number, order: number, contentType: string }
 * Returns: { signedUrl, storagePath, publicUrl }
 */
export async function POST(request: NextRequest) {
  try {
    const { propertyId, order, contentType } = await request.json();

    if (!propertyId || order == null || !contentType) {
      return NextResponse.json(
        { error: 'propertyId, order, and contentType are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido. Usá JPEG, PNG o WebP.` },
        { status: 400 }
      );
    }

    const ext = contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/png' ? 'png' : 'webp';
    const storagePath = buildStoragePath(parseInt(propertyId, 10), parseInt(order, 10), ext);
    const signedUrl = await generateSignedUploadUrl(storagePath, contentType);
    const publicUrl = getPublicUrl(storagePath);

    return NextResponse.json({ signedUrl, storagePath, publicUrl });
  } catch (error) {
    console.error('[photos/signed-url] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar URL de subida' },
      { status: 500 }
    );
  }
}
