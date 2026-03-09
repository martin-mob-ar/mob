import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * If a sync has been running longer than this WITHOUT a chain link refreshing
 * sync_started_at, the sync is dead. Each chain link refreshes sync_started_at,
 * so this timeout is relative to the LAST chain link, not the original start.
 */
const SYNC_TIMEOUT_MS = 6 * 60 * 1000;

export async function GET(request: NextRequest) {
  const apiKeyHash = request.nextUrl.searchParams.get('apiKeyHash');

  if (!apiKeyHash || apiKeyHash.length < 10) {
    return NextResponse.json({ error: 'apiKeyHash is required' }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, sync_status, sync_message, sync_properties_count, sync_started_at, sync_progress')
    .eq('tokko_api_hash', apiKeyHash)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ status: 'idle', message: null, propertiesCount: null });
  }

  // Auto-recovery: if sync has been running past the timeout (no chain link
  // refreshed sync_started_at), the Vercel function is dead.
  // Recover by re-enabling triggers, rebuilding listings, clearing progress.
  if (
    user.sync_status === 'syncing' &&
    user.sync_started_at &&
    Date.now() - new Date(user.sync_started_at).getTime() > SYNC_TIMEOUT_MS
  ) {
    console.warn(`[Sync Recovery] Detected stale sync for user ${user.id}, started at ${user.sync_started_at}. Recovering...`);

    // Re-enable triggers (idempotent — safe even if already enabled)
    try { await supabaseAdmin.rpc('enable_listing_triggers'); } catch {}

    // Rebuild whatever was partially synced
    try { await supabaseAdmin.rpc('rebuild_user_property_listings', { p_user_id: user.id }); } catch {}

    // Count how many properties actually made it
    const { count } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const recoveredCount = count || 0;
    const recoveredStatus = recoveredCount > 0 ? 'done' : 'error';
    const recoveredMessage = recoveredCount > 0
      ? null
      : 'La sincronización expiró. Intente nuevamente.';

    await supabaseAdmin
      .from('users')
      .update({
        sync_status: recoveredStatus,
        sync_message: recoveredMessage,
        sync_properties_count: recoveredCount,
        sync_started_at: null,
        sync_progress: null, // Clear stale progress on recovery
      })
      .eq('id', user.id);

    console.log(`[Sync Recovery] Recovered: ${recoveredCount} properties, status=${recoveredStatus}`);

    return NextResponse.json({
      status: recoveredStatus,
      message: recoveredMessage,
      propertiesCount: recoveredCount,
    });
  }

  return NextResponse.json({
    status: user.sync_status,
    message: user.sync_message,
    propertiesCount: user.sync_properties_count,
  });
}
