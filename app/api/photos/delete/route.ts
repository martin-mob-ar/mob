import { NextRequest, NextResponse } from 'next/server';
import { deletePhoto } from '@/lib/storage/gcs';

/**
 * POST /api/photos/delete
 *
 * Delete a photo from GCS.
 * Body: { storagePath: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { storagePath } = await request.json();

    if (!storagePath) {
      return NextResponse.json(
        { error: 'storagePath is required' },
        { status: 400 }
      );
    }

    await deletePhoto(storagePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[photos/delete] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar la foto' },
      { status: 500 }
    );
  }
}
