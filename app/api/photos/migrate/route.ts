import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { uploadPhotoFromUrl } from '@/lib/storage/gcs';

export const maxDuration = 300; // 5 minutes (Hobby + Fluid Compute)

const BATCH_SIZE = 50;
const CONCURRENCY = 20;
const TIME_LIMIT_MS = 270_000; // 270s — 30s buffer before 300s timeout

/**
 * Simple concurrency limiter (like p-limit). Runs async tasks
 * with at most `limit` executing at the same time.
 */
function pLimit(limit: number) {
  let active = 0;
  const queue: (() => void)[] = [];

  function next() {
    if (queue.length > 0 && active < limit) {
      active++;
      queue.shift()!();
    }
  }

  return <T>(fn: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      queue.push(() => {
        fn().then(resolve, reject).finally(() => {
          active--;
          next();
        });
      });
      next();
    });
}

/**
 * POST /api/photos/migrate
 *
 * Background migration of Tokko-URL photos to GCS.
 * Processes photos in parallel (20 concurrent) with a time-bounded loop.
 * Pre-fetches the next batch while the current one is processing.
 *
 * Query params:
 *   - userId: migrate photos for a specific user's properties
 *   - all=true: migrate ALL unmigrated photos
 *
 * Returns: { success, migrated, failed, remaining }
 * Idempotent — safe to run multiple times.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

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

    // If filtering by user, resolve property IDs once
    let propertyIds: number[] | null = null;
    if (userId && !all) {
      const { data: properties } = await supabaseAdmin
        .from('properties')
        .select('id')
        .eq('user_id', userId);

      if (!properties || properties.length === 0) {
        return NextResponse.json({ success: true, migrated: 0, failed: 0, remaining: 0 });
      }
      propertyIds = properties.map((p) => p.id);
    }

    let totalMigrated = 0;
    let totalFailed = 0;
    const limit = pLimit(CONCURRENCY);

    /** Fetch a batch of unmigrated photos */
    function fetchBatch() {
      let query = supabaseAdmin
        .from('tokko_property_photo')
        .select('id, property_id, original, image, order')
        .is('storage_path', null)
        .limit(BATCH_SIZE);

      if (propertyIds) {
        query = query.in('property_id', propertyIds);
      }
      return query;
    }

    // Kick off the first fetch
    let pendingFetch = fetchBatch();

    while (true) {
      // Time check — stop if we're near the timeout
      if (Date.now() - startTime > TIME_LIMIT_MS) break;

      const { data: photos, error } = await pendingFetch;

      if (error) {
        console.error('[photos/migrate] Query error:', error);
        break;
      }

      if (!photos || photos.length === 0) break;

      // Pre-fetch next batch while we process this one
      const moreExpected = photos.length >= BATCH_SIZE;
      if (moreExpected) {
        pendingFetch = fetchBatch();
      }

      // Process batch: upload in parallel, collect results for bulk DB update
      const uploadResults: { id: number; storagePath: string; publicUrl: string }[] = [];

      const results = await Promise.allSettled(
        photos.map((photo) =>
          limit(async () => {
            const sourceUrl = photo.original || photo.image;
            if (!sourceUrl) throw new Error('No source URL');

            const { storagePath, publicUrl } = await uploadPhotoFromUrl(
              photo.property_id,
              photo.order ?? 0,
              sourceUrl
            );

            return { id: photo.id as number, storagePath, publicUrl };
          })
        )
      );

      for (const r of results) {
        if (r.status === 'fulfilled') {
          uploadResults.push(r.value);
          totalMigrated++;
        } else {
          totalFailed++;
          console.error('[photos/migrate] Photo failed:', r.reason);
        }
      }

      // Bulk DB update — single query instead of N individual updates
      if (uploadResults.length > 0) {
        const { error: bulkError } = await supabaseAdmin.rpc('bulk_update_photo_urls', {
          p_updates: uploadResults.map((r) => ({
            id: r.id,
            storage_path: r.storagePath,
            url: r.publicUrl,
          })),
        });

        if (bulkError) {
          console.error('[photos/migrate] Bulk update failed, falling back:', bulkError);
          // Fallback: individual updates
          for (const r of uploadResults) {
            await supabaseAdmin
              .from('tokko_property_photo')
              .update({
                storage_path: r.storagePath,
                image: r.publicUrl,
                original: r.publicUrl,
                thumb: r.publicUrl,
              })
              .eq('id', r.id);
          }
        }
      }

      if (!moreExpected) break;
    }

    // Count how many are still unmigrated
    let remainingQuery = supabaseAdmin
      .from('tokko_property_photo')
      .select('id', { count: 'exact', head: true })
      .is('storage_path', null);

    if (propertyIds) {
      remainingQuery = remainingQuery.in('property_id', propertyIds);
    }

    const { count: remaining } = await remainingQuery;

    // Self-chain: if there are remaining photos, fire another call (up to maxChain times)
    const chainIndex = parseInt(searchParams.get('chain') || '0', 10);
    const maxChain = 10;
    if ((remaining ?? 0) > 0 && totalMigrated > 0 && chainIndex < maxChain) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const nextUrl = new URL(`${appUrl}/api/photos/migrate`);
      if (userId) nextUrl.searchParams.set('userId', userId);
      if (all) nextUrl.searchParams.set('all', 'true');
      nextUrl.searchParams.set('chain', String(chainIndex + 1));

      // Fire-and-forget — don't await
      fetch(nextUrl.toString(), { method: 'POST' }).catch(() => {});
      console.log(`[photos/migrate] Self-chaining (link #${chainIndex + 1}), ${remaining} photos remaining`);
    }

    return NextResponse.json({
      success: true,
      migrated: totalMigrated,
      failed: totalFailed,
      remaining: remaining ?? 0,
      elapsed_ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error('[photos/migrate] Unhandled error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en migración' },
      { status: 500 }
    );
  }
}
