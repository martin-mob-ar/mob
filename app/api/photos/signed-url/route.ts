import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  generateSignedUploadUrl,
  buildStoragePath,
  getPublicUrl,
  ALLOWED_IMAGE_TYPES,
} from '@/lib/storage/gcs';
import { createClient } from '@/lib/supabase/server-component';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

/**
 * POST /api/photos/signed-url
 *
 * Generate a signed URL for direct client-to-GCS upload.
 * Requires authentication.
 *
 * For new properties (wizard): pass { tempFolder: string, order, contentType }
 *   → uploads to {tempFolder}/{order}-{uuid}.{ext}
 *
 * For existing properties (edit): pass { propertyId: number, order, contentType }
 *   → uploads to {propertyId}/{order}-{uuid}.{ext}
 *
 * Returns: { signedUrl, storagePath, publicUrl }
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'photos-signed-url', 30, 60_000);
    if (!rl.success) return rateLimitResponse(rl.resetIn);

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const { propertyId, tempFolder, order, contentType } = await request.json();

    if (order == null || !contentType) {
      return NextResponse.json(
        { error: 'order and contentType are required' },
        { status: 400 }
      );
    }

    if (propertyId == null && !tempFolder) {
      return NextResponse.json(
        { error: 'Either propertyId or tempFolder is required' },
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
    const uuid = randomUUID().slice(0, 8);

    let storagePath: string;
    if (propertyId != null) {
      // Editing existing property — upload directly into property folder
      storagePath = buildStoragePath(parseInt(propertyId, 10), parseInt(order, 10), ext);
    } else {
      // New property wizard — upload into temp folder, moved to {propertyId}/ after creation
      // Validate tempFolder format: only allow alphanumeric, hyphens, underscores, and slashes
      if (!/^[a-zA-Z0-9_-]+$/.test(tempFolder)) {
        return NextResponse.json({ error: 'Invalid tempFolder' }, { status: 400 });
      }
      storagePath = `${tempFolder}/${order}-${uuid}.${ext}`;
    }

    const signedUrl = await generateSignedUploadUrl(storagePath, contentType);
    const publicUrl = getPublicUrl(storagePath);

    return NextResponse.json({ signedUrl, storagePath, publicUrl });
  } catch (error) {
    console.error('[photos/signed-url] Error:', error);
    return NextResponse.json(
      { error: 'Error al generar URL de subida' },
      { status: 500 }
    );
  }
}
