import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-component';
import { supabaseAdmin } from '@/lib/supabase/server';
import { syncTargetIncremental, type IncrementalSyncTarget } from '@/lib/sync/incremental';

export const maxDuration = 300;

/**
 * POST /api/tokko/sync/incremental
 *
 * Triggers an incremental sync for the authenticated user.
 * Same logic the cron job runs, but scoped to a single user.
 */
export async function POST() {
  // 1. Authenticate
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // 2. Get public user + company info
  const { data: publicUser } = await supabaseAdmin
    .from('users')
    .select('id, name, tokko_api_key_enc, tokko_last_sync_at, sync_status')
    .eq('auth_id', authUser.id)
    .single();

  if (!publicUser) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  if (!publicUser.tokko_last_sync_at) {
    return NextResponse.json({ error: 'No se ha realizado una sincronización inicial' }, { status: 400 });
  }

  if (publicUser.sync_status === 'syncing') {
    return NextResponse.json({ error: 'Ya hay una sincronización en curso' }, { status: 409 });
  }

  // 3. Build target — check company first (same logic as cron)
  const { data: company } = await supabaseAdmin
    .from('tokko_company')
    .select('id, name, tokko_key_enc, last_incremental_sync_at')
    .eq('user_id', publicUser.id)
    .not('tokko_key_enc', 'is', null)
    .maybeSingle();

  let target: IncrementalSyncTarget;

  if (company) {
    target = {
      userId: publicUser.id,
      companyId: company.id,
      name: company.name,
      apiKeyEnc: company.tokko_key_enc!,
      companyLastSyncAt: company.last_incremental_sync_at,
      userLastSyncAt: publicUser.tokko_last_sync_at,
    };
  } else if (publicUser.tokko_api_key_enc) {
    target = {
      userId: publicUser.id,
      companyId: null,
      name: publicUser.name || 'Unknown',
      apiKeyEnc: publicUser.tokko_api_key_enc,
      companyLastSyncAt: null,
      userLastSyncAt: publicUser.tokko_last_sync_at,
    };
  } else {
    return NextResponse.json({ error: 'No hay API key configurada' }, { status: 400 });
  }

  // 4. Run incremental sync (generous time budget — no chaining needed for single user)
  const timeGuard = { hasTime: () => true };
  const stats = await syncTargetIncremental(target, timeGuard);

  return NextResponse.json({
    success: true,
    propertiesUpdated: stats.propertiesUpdated,
    propertiesDeleted: stats.propertiesDeleted,
    photosAdded: stats.photosAdded,
    photosRemoved: stats.photosRemoved,
    errors: stats.errors,
  });
}
