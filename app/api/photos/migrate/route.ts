import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { uploadPhotoFromUrl, getPublicUrl } from '@/lib/storage/gcs';

export const maxDuration = 300; // 5 minutes

const BATCH_SIZE = 20;

/**
 * POST /api/photos/migrate
 *
 * Background migration of Tokko-URL photos to GCS.
 *
 * Query params:
 *   - userId: migrate photos for a specific user's properties
 *   - all=true: migrate ALL unmigrated photos
 *
 * Idempotent — safe to run multiple times.
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const all = searchParams.get('all') === 'true';

    if (!userId && !all) {
      return NextResponse.json(
        { error: 'Provide userId or all=true' },
        { status: 400 }
      );
    }

    let totalMigrated = 0;
    let totalFailed = 0;
    let hasMore = true;

    while (hasMore) {
      // Fetch a batch of unmigrated photos
      let query = supabaseAdmin
        .from('tokko_property_photo')
        .select('id, property_id, original, image, order')
        .is('storage_path', null)
        .limit(BATCH_SIZE);

      if (userId && !all) {
        // Get property IDs for this user
        const { data: properties } = await supabaseAdmin
          .from('properties')
          .select('id')
          .eq('user_id', userId);

        if (!properties || properties.length === 0) {
          break;
        }

        const propertyIds = properties.map((p) => p.id);
        query = query.in('property_id', propertyIds);
      }

      const { data: photos, error } = await query;

      if (error) {
        console.error('[photos/migrate] Query error:', error);
        break;
      }

      if (!photos || photos.length === 0) {
        hasMore = false;
        break;
      }

      // Process each photo in the batch
      for (const photo of photos) {
        const sourceUrl = photo.original || photo.image;
        if (!sourceUrl) {
          totalFailed++;
          continue;
        }

        try {
          const { storagePath, publicUrl } = await uploadPhotoFromUrl(
            photo.property_id,
            photo.order ?? 0,
            sourceUrl
          );

          // Update the DB row with GCS URL and storage path
          const { error: updateError } = await supabaseAdmin
            .from('tokko_property_photo')
            .update({
              storage_path: storagePath,
              image: publicUrl,
              original: publicUrl,
              thumb: publicUrl,
            })
            .eq('id', photo.id);

          if (updateError) {
            console.error(`[photos/migrate] Update error for photo ${photo.id}:`, updateError);
            totalFailed++;
          } else {
            totalMigrated++;
          }
        } catch (downloadError) {
          console.error(
            `[photos/migrate] Failed to migrate photo ${photo.id} from ${sourceUrl}:`,
            downloadError
          );
          totalFailed++;
        }
      }

      // If we got fewer than BATCH_SIZE, we're done
      if (photos.length < BATCH_SIZE) {
        hasMore = false;
      }
    }

    return NextResponse.json({
      success: true,
      migrated: totalMigrated,
      failed: totalFailed,
    });
  } catch (error) {
    console.error('[photos/migrate] Unhandled error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en migración' },
      { status: 500 }
    );
  }
}
