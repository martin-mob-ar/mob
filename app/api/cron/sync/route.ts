import { NextRequest, NextResponse, after } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getIncrementalSyncTargets, syncTargetIncremental, createSyncCache } from '@/lib/sync/incremental';

export const maxDuration = 300;

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = request.headers.get('authorization') || '';
  const expected = `Bearer ${cronSecret}`;
  try {
    const a = Buffer.from(authHeader);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * GET /api/cron/sync
 *
 * Hourly incremental sync cron job. Fetches property changes from Tokko
 * for all registered inmobiliarias and applies them to our database.
 *
 * Self-chains via after() when processing exceeds the time budget.
 * Secured via CRON_SECRET (Vercel injects Authorization header for cron jobs).
 *
 * Query params (for self-chaining):
 *   - chain: chain link index
 *   - logId: cron_sync_log ID to continue
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // ── 1. Verify CRON_SECRET ──
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Parse chain params ──
  const { searchParams } = request.nextUrl;
  const chainIndex = parseInt(searchParams.get('chain') || '0', 10);
  const logId = searchParams.get('logId');

  // ── 3. Concurrency guard ──
  const { data: runningLogs } = await supabaseAdmin
    .from('cron_sync_log')
    .select('id, started_at')
    .eq('status', 'running')
    .order('started_at', { ascending: false })
    .limit(1);

  if (runningLogs && runningLogs.length > 0) {
    const runningLog = runningLogs[0];

    // Don't skip if this is a chain continuation of the same log
    if (!(logId && runningLog.id === parseInt(logId, 10))) {
      const elapsed = Date.now() - new Date(runningLog.started_at).getTime();
      if (elapsed < 10 * 60 * 1000) {
        return NextResponse.json({ skipped: true, reason: 'Another sync is still running' });
      }
      // Stale running log (> 10 min) — mark as failed
      await supabaseAdmin
        .from('cron_sync_log')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: 'Stale: exceeded 10 minute timeout',
        })
        .eq('id', runningLog.id);
    }
  }

  // ── 4. Create or resume log entry ──
  let currentLogId: number;

  if (logId && chainIndex > 0) {
    currentLogId = parseInt(logId, 10);
    // Refresh started_at so concurrency guard sees this as recent
    await supabaseAdmin
      .from('cron_sync_log')
      .update({
        chain_index: chainIndex,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', currentLogId);
  } else {
    const { data: newLog, error: logError } = await supabaseAdmin
      .from('cron_sync_log')
      .insert({ status: 'running', chain_index: 0 })
      .select('id')
      .single();
    if (logError || !newLog) {
      console.error('[Cron Sync] Failed to create log entry:', logError);
      return NextResponse.json({ error: 'Failed to create log entry', details: logError?.message }, { status: 500 });
    }
    currentLogId = newLog.id;
  }

  // ── 5. Load targets ──
  const targets = await getIncrementalSyncTargets();

  if (targets.length === 0) {
    await supabaseAdmin
      .from('cron_sync_log')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
      })
      .eq('id', currentLogId);

    return NextResponse.json({ status: 'completed', targets: 0 });
  }

  console.log(`[Cron Sync] Chain #${chainIndex}: ${targets.length} targets to process`);

  // ── 6. Process targets with time guard ──
  const syncTimestamp = new Date().toISOString(); // Captured before any API calls
  const timeGuard = {
    hasTime: () => Date.now() - startTime < 250_000,
  };

  const totals = {
    targetsProcessed: 0,
    propertiesUpdated: 0,
    propertiesDeleted: 0,
    photosAdded: 0,
    photosRemoved: 0,
    errors: [] as string[],
  };

  const completedCompanyIds: number[] = [];
  const completedUserIds = new Set<string>();
  const cache = createSyncCache();

  for (const target of targets) {
    if (!timeGuard.hasTime()) break;

    try {
      console.log(`[Cron Sync] Processing target: ${target.name} (company: ${target.companyId ?? 'standalone'})`);
      const stats = await syncTargetIncremental(target, timeGuard, cache);
      totals.propertiesUpdated += stats.propertiesUpdated;
      totals.propertiesDeleted += stats.propertiesDeleted;
      totals.photosAdded += stats.photosAdded;
      totals.photosRemoved += stats.photosRemoved;
      totals.errors.push(...stats.errors);

      if (stats.completed) {
        if (target.companyId) completedCompanyIds.push(target.companyId);
        completedUserIds.add(target.userId);
      }
    } catch (error) {
      const msg = `Target ${target.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      totals.errors.push(msg);
      console.error(`[Cron Sync] ${msg}`);
    }

    totals.targetsProcessed++;

    // Update log every 10 targets (and always on last) to reduce Supabase calls
    if (totals.targetsProcessed % 10 === 0 || totals.targetsProcessed >= targets.length || !timeGuard.hasTime()) {
      await supabaseAdmin
        .from('cron_sync_log')
        .update({
          companies_processed: totals.targetsProcessed,
          properties_updated: totals.propertiesUpdated,
          properties_deleted: totals.propertiesDeleted,
          photos_added: totals.photosAdded,
          photos_removed: totals.photosRemoved,
          errors: totals.errors.slice(0, 50),
        })
        .eq('id', currentLogId);
    }
  }

  // ── 6b. Batch-update sync timestamps for completed targets ──
  if (completedCompanyIds.length > 0) {
    await supabaseAdmin
      .from('tokko_company')
      .update({ last_incremental_sync_at: syncTimestamp })
      .in('id', completedCompanyIds);
  }
  if (completedUserIds.size > 0) {
    await supabaseAdmin
      .from('users')
      .update({ tokko_last_sync_at: syncTimestamp })
      .in('id', [...completedUserIds]);
  }

  // ── 7. Check if we need to chain ──
  const allProcessed = totals.targetsProcessed >= targets.length;

  if (!allProcessed) {
    // Update log counters (keep status as 'running' for next chain link)
    await supabaseAdmin
      .from('cron_sync_log')
      .update({
        companies_processed: totals.targetsProcessed,
        properties_updated: totals.propertiesUpdated,
        properties_deleted: totals.propertiesDeleted,
        photos_added: totals.photosAdded,
        photos_removed: totals.photosRemoved,
        errors: totals.errors.slice(0, 50),
      })
      .eq('id', currentLogId);

    // Self-chain via after() to ensure the request fires before Vercel kills the container
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const nextUrl = new URL(`${appUrl}/api/cron/sync`);
    nextUrl.searchParams.set('chain', String(chainIndex + 1));
    nextUrl.searchParams.set('logId', String(currentLogId));

    const chainUrl = nextUrl.toString();
    after(async () => {
      try {
        await fetch(chainUrl, {
          headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` },
          signal: AbortSignal.timeout(10_000),
        });
      } catch {
        // AbortError is expected (we abort after 10s), other errors are fine too
      }
    });

    console.log(`[Cron Sync] Chaining to link #${chainIndex + 1}, ${totals.targetsProcessed}/${targets.length} targets done`);

    return NextResponse.json({
      status: 'chained',
      chainIndex,
      targetsProcessed: totals.targetsProcessed,
      totalTargets: targets.length,
      propertiesUpdated: totals.propertiesUpdated,
      propertiesDeleted: totals.propertiesDeleted,
      elapsed_ms: Date.now() - startTime,
    });
  }

  // ── 8. Finalize ──
  await supabaseAdmin
    .from('cron_sync_log')
    .update({
      status: 'completed',
      finished_at: new Date().toISOString(),
      chain_index: chainIndex,
      companies_processed: totals.targetsProcessed,
      properties_updated: totals.propertiesUpdated,
      properties_deleted: totals.propertiesDeleted,
      photos_added: totals.photosAdded,
      photos_removed: totals.photosRemoved,
      errors: totals.errors.slice(0, 50),
    })
    .eq('id', currentLogId);

  console.log(`[Cron Sync] Completed: ${totals.targetsProcessed} targets, ${totals.propertiesUpdated} updated, ${totals.propertiesDeleted} deleted`);

  return NextResponse.json({
    status: 'completed',
    chainIndex,
    targetsProcessed: totals.targetsProcessed,
    propertiesUpdated: totals.propertiesUpdated,
    propertiesDeleted: totals.propertiesDeleted,
    photosAdded: totals.photosAdded,
    photosRemoved: totals.photosRemoved,
    errorsCount: totals.errors.length,
    elapsed_ms: Date.now() - startTime,
  });
}
