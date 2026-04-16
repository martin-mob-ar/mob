import { TokkoClient, TokkoProperty, TokkoBranch } from '@/lib/tokko/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { encryptApiKey } from '@/lib/crypto';

/** Tokko operation type ID for Rent. Sale=1, Rent=2, Temporary Rent=3. */
const RENT_OPERATION_ID = 2;
/** Property type IDs to sync: Apartment=2, House=3, PH=13. */
const SYNC_PROPERTY_TYPES = [2, 3, 13];
/** Properties per batch for the batch_sync_properties RPC. */
const PROPERTY_BATCH_SIZE = 50;

export interface SyncResult {
  userId: string;
  propertiesSynced: number;
  companiesSynced: number;
  locationsSynced: number;
  errors: string[];
  /** When true, the caller must trigger a self-chain continuation via after() */
  needsChain?: boolean;
  /** Parameters needed for the chain call (only set when needsChain=true) */
  chainParams?: { apiKey: string; authId: string; authEmail: string };
}

/**
 * Fire-and-forget: kick off photo migration.
 * The endpoint self-chains internally (up to 10 times), so we just need to fire once.
 */
function triggerPhotoMigration(userId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${appUrl}/api/photos/migrate?userId=${userId}`;
  fetch(url, { method: 'POST' }).catch(() => {});
}

/**
 * Hash API key for identification (SHA-256)
 */
function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Find the primary branch: prefer is_default=true, then fall back to oldest by created_date.
 */
function findPrimaryBranch(branches: TokkoBranch[]): TokkoBranch | undefined {
  if (branches.length === 0) return undefined;

  const defaultBranch = branches.find(b => b.is_default === true);
  if (defaultBranch) return defaultBranch;

  return branches
    .filter(b => b.created_date)
    .sort((a, b) => new Date(a.created_date!).getTime() - new Date(b.created_date!).getTime())[0]
    || branches[0];
}

/**
 * Extract best contact fields from branches.
 * Priority: primary branch → oldest branch with a phone.
 * Each field falls back independently (e.g. email from primary, phone from another).
 */
function extractBranchContactInfo(branches: TokkoBranch[]): {
  email: string | null;
  phone: string | null;
  phone_country_code: string | null;
  address: string | null;
  logo: string | null;
} {
  const primary = findPrimaryBranch(branches);
  const info = {
    email: primary?.email || null,
    phone: (primary?.phone_area || '') + (primary?.phone || '') || null,
    phone_country_code: primary?.phone_country_code || null,
    address: primary?.address || null,
    logo: primary?.logo || null,
  };

  // If primary branch has no phone, find the oldest branch that does
  if (!info.phone && branches.length > 1) {
    const branchWithPhone = branches
      .filter(b => b.phone)
      .sort((a, b) => {
        if (a.created_date && b.created_date) {
          return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
        }
        return 0;
      })[0];

    if (branchWithPhone) {
      info.phone = (branchWithPhone.phone_area || '') + (branchWithPhone.phone || '') || null;
      info.phone_country_code = branchWithPhone.phone_country_code || null;
    }
  }

  return info;
}

/**
 * Find existing user by id, email, or tokko_api_hash.
 * The user MUST already exist (created by the DB trigger on auth signup).
 */
async function findUser(authId: string, authEmail: string, apiKeyHash: string): Promise<string> {
  // 1. By id (should always hit — trigger creates the row on signup;
  //    since public.users.id = auth.users.id, authId IS the public user id)
  const { data: byAuth } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', authId)
    .maybeSingle();
  if (byAuth) return byAuth.id;

  // 2. By email
  const { data: byEmail } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', authEmail)
    .maybeSingle();
  if (byEmail) return byEmail.id;

  // 3. By tokko_api_hash (re-sync scenario)
  const { data: byHash } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('tokko_api_hash', apiKeyHash)
    .maybeSingle();
  if (byHash) return byHash.id;

  throw new Error('User not found — user must register before syncing');
}

/**
 * Update an existing user row with Tokko data (name, phone, logo, etc.)
 * and link the tokko_api_hash if not already set.
 */
interface UserPhone {
  telefono?: string;
  telefono_country_code?: string;
  telefono_extension?: string;
}

interface TokkoUserData {
  name?: string;
  phone?: UserPhone;
  logo?: string;
  tokkoEmail?: string;
}

async function updateUserWithTokkoData(
  userId: string,
  authId: string,
  apiKeyHash: string,
  data: TokkoUserData,
  apiKeyEnc?: string
): Promise<void> {
  const updates: Record<string, string | null> = {
    tokko_api_hash: apiKeyHash,
    updated_at: new Date().toISOString(),
  };
  if (apiKeyEnc) updates.tokko_api_key_enc = apiKeyEnc;
  if (data.name) updates.name = data.name;
  if (data.phone?.telefono) updates.telefono = data.phone.telefono;
  if (data.phone?.telefono_country_code) updates.telefono_country_code = data.phone.telefono_country_code;
  if (data.phone?.telefono_extension) updates.telefono_extension = data.phone.telefono_extension;
  if (data.logo !== undefined) updates.logo = data.logo || null;
  if (data.tokkoEmail) updates.tokko_email = data.tokkoEmail;

  await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId);

  // Sync auth.users display_name to match users.name
  if (data.name) {
    await supabaseAdmin.auth.admin.updateUserById(authId, {
      user_metadata: { display_name: data.name },
    });
  }
}

/**
 * Upsert a tokko_company row. Returns the company's serial ID.
 */
async function upsertCompany(
  userId: string,
  company: {
    name: string;
    logo?: string | null;
    contact_info?: string | null;
    tokko_key_enc?: string | null;
    email?: string | null;
    phone?: string | null;
    phone_country_code?: string | null;
    address?: string | null;
  }
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('tokko_company')
    .upsert({
      user_id: userId,
      name: company.name,
      logo: company.logo || null,
      contact_info: company.contact_info || null,
      tokko_key_enc: company.tokko_key_enc || null,
      email: company.email || null,
      phone: company.phone || null,
      phone_country_code: company.phone_country_code || null,
      address: company.address || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'name,user_id',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to upsert company "${company.name}": ${error.message}`);
  }

  return data.id;
}

/**
 * Sync properties for a single company using the batch_sync_properties RPC.
 * Sends raw TokkoProperty objects as JSONB, letting PostgreSQL handle all
 * upserts (property types, tags, operations, photos) in a single round-trip per batch.
 */
async function syncCompanyProperties(
  userId: string,
  companyId: number,
  companyKey: string,
  companyName: string,
  options?: { maxProperties?: number; prefetchedProperties?: TokkoProperty[] },
  timeGuard?: { hasTime: () => boolean; elapsed: () => number },
): Promise<{ propertiesSynced: number; errors: string[] }> {
  const errors: string[] = [];

  let properties: TokkoProperty[];
  if (options?.prefetchedProperties) {
    // Re-validate prefetched properties: Tokko API can return inconsistent operations
    // across requests, so a property that had operations during discovery may now have none.
    properties = options.prefetchedProperties.filter(p => {
      const hasRentOp = p.operations?.some(op => op.operation_id === RENT_OPERATION_ID);
      if (!hasRentOp) {
        console.warn(`[Tokko Sync] Dropping property ${p.id} from "${companyName}": no rent operation found (ops: ${p.operations?.length ?? 0})`);
      }
      return hasRentOp;
    });
    console.log(`[Tokko Sync] Company "${companyName}": ${properties.length} pre-fetched properties (${options.prefetchedProperties.length - properties.length} dropped for missing operations)`);
  } else {
    const client = new TokkoClient(companyKey);
    console.log(`[Tokko Sync] Syncing properties for company "${companyName}"${options?.maxProperties ? ` (limit: ${options.maxProperties})` : ''}...`);
    properties = await client.searchProperties(options?.maxProperties, {
      operation_types: [RENT_OPERATION_ID],
      property_types: SYNC_PROPERTY_TYPES,
    });
    console.log(`[Tokko Sync] Company "${companyName}": ${properties.length} rent properties found`);
  }

  if (properties.length === 0) {
    return { propertiesSynced: 0, errors };
  }

  let totalSynced = 0;

  for (let i = 0; i < properties.length; i += PROPERTY_BATCH_SIZE) {
    // Check time before starting a batch (network syncs pass timeGuard)
    if (timeGuard && !timeGuard.hasTime()) {
      console.warn(`[Tokko Sync] Time expired during property sync for "${companyName}" at batch ${Math.floor(i / PROPERTY_BATCH_SIZE) + 1}, ${totalSynced} synced so far (${timeGuard.elapsed()}ms elapsed)`);
      break;
    }

    const batch = properties.slice(i, i + PROPERTY_BATCH_SIZE);
    const batchNumber = Math.floor(i / PROPERTY_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(properties.length / PROPERTY_BATCH_SIZE);

    try {
      // GCS photo cleanup for re-syncs: check if any properties in this batch
      // have photos stored in GCS that need to be deleted before overwriting.
      const batchTokkoIds = batch.map(p => p.id);
      const { data: gcsProperties } = await supabaseAdmin
        .from('properties')
        .select('id')
        .eq('user_id', userId)
        .in('tokko_id', batchTokkoIds)
        .not('id', 'is', null);

      if (gcsProperties && gcsProperties.length > 0) {
        const propertyIds = gcsProperties.map(p => p.id);
        const { data: gcsPhotos } = await supabaseAdmin
          .from('tokko_property_photo')
          .select('property_id')
          .in('property_id', propertyIds)
          .not('storage_path', 'is', null)
          .limit(1);

        if (gcsPhotos && gcsPhotos.length > 0) {
          try {
            const { deletePropertyPhotos } = await import('@/lib/storage/gcs');
            await Promise.all(propertyIds.map(pid => deletePropertyPhotos(pid).catch(() => {})));
          } catch (e) {
            console.warn(`[Tokko Sync] GCS cleanup failed for batch:`, e);
          }
        }
      }

      // Call the batch RPC — single DB round-trip for the entire batch
      const { data, error } = await supabaseAdmin.rpc('batch_sync_properties', {
        p_user_id: userId,
        p_company_id: companyId,
        p_properties: batch,
      });

      if (error) {
        errors.push(`Batch ${batchNumber} for "${companyName}": ${error.message}`);
        console.error(`[Tokko Sync] Batch ${batchNumber} RPC error:`, error.message);
        continue;
      }

      const result = data as { synced: number; skipped: number; errors: string[] };
      totalSynced += result.synced;

      if (result.skipped > 0) {
        console.warn(`[Tokko Sync] Batch ${batchNumber}: ${result.skipped} properties skipped (unknown locations)`);
      }
      if (result.errors && result.errors.length > 0) {
        errors.push(...result.errors.map((e: string) => `${companyName}: ${e}`));
        console.warn(`[Tokko Sync] Batch ${batchNumber} had ${result.errors.length} errors`);
      }

      console.log(`[Tokko Sync] Company "${companyName}" batch ${batchNumber}/${totalBatches}: ${result.synced} synced, ${result.skipped} skipped`);
    } catch (err) {
      const errMsg = `Batch ${batchNumber} for "${companyName}": ${err instanceof Error ? err.message : 'Unknown error'}`;
      errors.push(errMsg);
      console.error(`[Tokko Sync] ${errMsg}`);
    }
  }

  return { propertiesSynced: totalSynced, errors };
}

/**
 * Check if a user already has synced properties.
 * Returns the userId if data exists, null otherwise.
 */
export async function checkExistingUser(apiKey: string): Promise<string | null> {
  const apiKeyHash = hashApiKey(apiKey);

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('tokko_api_hash', apiKeyHash)
    .single();

  if (!user) return null;

  const { count } = await supabaseAdmin
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (count && count > 0) return user.id;

  return null;
}

/**
 * Update sync status in users table for progress tracking.
 * Sets sync_started_at when transitioning to 'syncing'.
 */
async function updateSyncStatus(
  apiKeyHash: string,
  status: 'syncing' | 'done' | 'error',
  message?: string | null,
  propertiesCount?: number | null
): Promise<void> {
  await supabaseAdmin
    .from('users')
    .update({
      sync_status: status,
      sync_message: message ?? null,
      ...(propertiesCount !== undefined ? { sync_properties_count: propertiesCount } : {}),
      ...(status === 'syncing' ? { sync_started_at: new Date().toISOString() } : {}),
      ...(status === 'done' || status === 'error' ? { sync_started_at: null } : {}),
      ...(status === 'done' ? { tokko_last_sync_at: new Date().toISOString() } : {}),
    })
    .eq('tokko_api_hash', apiKeyHash);
}

/**
 * Detect if an API key belongs to a network account by peeking at the first property.
 * Network accounts return a `company` object in property responses.
 */
async function isNetworkKey(apiKey: string): Promise<boolean> {
  const client = new TokkoClient(apiKey);
  try {
    const response = await client.getAllProperties(1);
    if (response.length === 0) return false;
    return !!response[0].company;
  } catch {
    return false;
  }
}

// ============================================================
// Resumable Self-Chaining Sync (for network accounts)
// ============================================================

interface SyncProgress {
  phase: 'discovery' | 'companies' | 'syncing' | 'finalizing';
  discovery: {
    offset: number;
    totalCount: number | null;
    scannedCount: number;
    companies: Array<{ name: string; key: string; logo: string | null; contact_info: string | null }>;
  };
  companies: {
    companyDbIds: Record<string, number>;
    companiesProcessed: boolean;
  };
  syncing: {
    companiesSynced: string[];
    triggersDisabled: boolean;
    propertiesSynced: number;
    errors: string[];
  };
  chainIndex: number;
}

function createTimeGuard(startTime: number, budgetMs = 250_000) {
  return {
    hasTime: () => Date.now() - startTime < budgetMs,
    elapsed: () => Date.now() - startTime,
  };
}

function createInitialProgress(): SyncProgress {
  return {
    phase: 'discovery',
    discovery: { offset: 0, totalCount: null, scannedCount: 0, companies: [] },
    companies: { companyDbIds: {}, companiesProcessed: false },
    syncing: { companiesSynced: [], triggersDisabled: false, propertiesSynced: 0, errors: [] },
    chainIndex: 0,
  };
}

async function loadSyncProgress(userId: string): Promise<SyncProgress | null> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('sync_progress')
    .eq('id', userId)
    .single();
  return (data?.sync_progress as unknown as SyncProgress) ?? null;
}

async function saveSyncProgress(userId: string, progress: SyncProgress): Promise<void> {
  await supabaseAdmin
    .from('users')
    .update({ sync_progress: progress as unknown as Record<string, unknown> })
    .eq('id', userId);
}

async function clearSyncProgress(userId: string): Promise<void> {
  await supabaseAdmin
    .from('users')
    .update({ sync_progress: null })
    .eq('id', userId);
}

/**
 * Self-chain: POST to /api/tokko/sync with resume=true.
 * Uses AbortSignal.timeout — we only need the request to reach Vercel's
 * infrastructure (a few seconds), not wait for the full 300s response.
 *
 * Called from route handler via after() for reliability.
 */
export async function triggerSyncContinuation(apiKey: string, authId: string, authEmail: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${appUrl}/api/tokko/sync`;

  console.log(`[Tokko Sync] Triggering self-chain continuation to ${url}`);

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, authId, authEmail, resume: true }),
      signal: AbortSignal.timeout(10_000),
    });
    console.log('[Tokko Sync] Self-chain request accepted');
  } catch (err) {
    // TimeoutError/AbortError is expected — request already reached Vercel
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      console.log('[Tokko Sync] Self-chain request sent (timed out waiting for response, which is expected)');
    } else {
      console.error('[Tokko Sync] Self-chain request failed, retrying once:', err);
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey, authId, authEmail, resume: true }),
          signal: AbortSignal.timeout(10_000),
        });
        console.log('[Tokko Sync] Self-chain retry succeeded');
      } catch (retryErr) {
        console.error('[Tokko Sync] Self-chain retry also failed:', retryErr);
      }
    }
  }
}

/**
 * Discovery phase: paginate through ALL Tokko properties to find unique companies.
 * Saves progress every 2 pages. Stops if time runs out.
 * Returns true if discovery is complete.
 */
async function discoverNetworkChunk(
  apiKey: string,
  apiKeyHash: string,
  userId: string,
  progress: SyncProgress,
  timeGuard: ReturnType<typeof createTimeGuard>,
): Promise<boolean> {
  const client = new TokkoClient(apiKey);
  const companiesByName = new Map<string, SyncProgress['discovery']['companies'][0]>();

  // Restore already-discovered companies
  for (const c of progress.discovery.companies) {
    companiesByName.set(c.name, c);
  }

  let offset = progress.discovery.offset;
  const limit = 500;
  let pagesSinceSave = 0;

  while (timeGuard.hasTime()) {
    const timeRemaining = Math.round((250_000 - timeGuard.elapsed()) / 1000);
    console.log(`[Tokko Sync] Discovery page (offset: ${offset}, limit: ${limit}, ~${timeRemaining}s remaining)`);
    const pageStart = Date.now();
    const response = await client.fetchPropertyPage(offset, limit);
    console.log(`[Tokko Sync] Discovery page fetched in ${Date.now() - pageStart}ms, ${response.objects.length} results`);

    // First page gives us the total count
    if (progress.discovery.totalCount === null) {
      progress.discovery.totalCount = response.meta.total_count;
    }

    if (response.objects.length === 0) {
      progress.discovery.companies = Array.from(companiesByName.values());
      await saveSyncProgress(userId, progress);
      return true;
    }

    // Extract unique companies from this page
    for (const property of response.objects) {
      if (property.company && !companiesByName.has(property.company.name)) {
        companiesByName.set(property.company.name, {
          name: property.company.name,
          key: property.company.key,
          logo: property.company.logo || null,
          contact_info: property.company.contact_info || null,
        });
        console.log(`[Tokko Sync] Discovered company: "${property.company.name}"`);
      }
    }

    const scanned = Math.min(offset + response.objects.length, progress.discovery.totalCount ?? Infinity);
    progress.discovery.scannedCount = scanned;
    pagesSinceSave++;

    // Update status message
    const total = progress.discovery.totalCount || 0;
    await updateSyncStatus(
      apiKeyHash,
      'syncing',
      `Descubriendo propiedades ${scanned.toLocaleString('es-AR')} de ${total.toLocaleString('es-AR')} (${companiesByName.size} inmobiliarias encontradas)...`
    );

    // Check if we've reached the end
    if (!response.meta.next || offset + limit >= (progress.discovery.totalCount || 0)) {
      offset += limit;
      progress.discovery.offset = offset;
      progress.discovery.companies = Array.from(companiesByName.values());
      await saveSyncProgress(userId, progress);
      return true;
    }

    offset += limit;
    progress.discovery.offset = offset;

    // Save progress every 2 pages
    if (pagesSinceSave >= 2) {
      progress.discovery.companies = Array.from(companiesByName.values());
      await saveSyncProgress(userId, progress);
      pagesSinceSave = 0;
    }
  }

  // Ran out of time — save progress for next chain link
  progress.discovery.companies = Array.from(companiesByName.values());
  await saveSyncProgress(userId, progress);
  return false;
}

/**
 * Companies phase: upsert all discovered companies and fetch branch contact info in parallel.
 * This is fast and should always fit in a single invocation.
 */
async function processCompaniesPhase(
  apiKeyHash: string,
  userId: string,
  progress: SyncProgress,
): Promise<void> {
  const companies = progress.discovery.companies;

  await updateSyncStatus(apiKeyHash, 'syncing', `Registrando ${companies.length} inmobiliarias...`);

  // Upsert all companies
  for (const company of companies) {
    let companyKeyEnc: string | null = null;
    try {
      companyKeyEnc = encryptApiKey(company.key);
    } catch {
      console.warn(`[Tokko Sync] Could not encrypt key for company "${company.name}"`);
    }

    const companyId = await upsertCompany(userId, {
      name: company.name,
      logo: company.logo,
      contact_info: company.contact_info,
      tokko_key_enc: companyKeyEnc,
    });

    progress.companies.companyDbIds[company.name] = companyId;
  }

  console.log(`[Tokko Sync] ${companies.length} companies upserted`);

  // Fetch branches in parallel for contact info
  await updateSyncStatus(apiKeyHash, 'syncing', `Obteniendo datos de contacto de ${companies.length} inmobiliarias...`);

  const branchResults = await Promise.all(
    companies.map(async (company) => {
      try {
        const companyClient = new TokkoClient(company.key);
        const branches = await companyClient.getAllBranches();
        const branchInfo = extractBranchContactInfo(branches);
        return {
          companyName: company.name,
          branchInfo,
          warning: branches.length === 0 ? `Company "${company.name}": Could not fetch branch data` : null,
        };
      } catch {
        return {
          companyName: company.name,
          branchInfo: null,
          warning: `Company "${company.name}": Branch fetch failed`,
        };
      }
    })
  );

  // Update company contact info and logo (prefer branch logo, fall back to company logo)
  for (const result of branchResults) {
    if (result.warning) {
      progress.syncing.errors.push(result.warning);
    }
    const companyId = progress.companies.companyDbIds[result.companyName];
    if (companyId && result.branchInfo) {
      const company = companies.find(c => c.name === result.companyName);
      await supabaseAdmin
        .from('tokko_company')
        .update({
          email: result.branchInfo.email,
          phone: result.branchInfo.phone,
          phone_country_code: result.branchInfo.phone_country_code,
          address: result.branchInfo.address,
          logo: result.branchInfo.logo || company?.logo || null,
        })
        .eq('id', companyId);
    }
  }

  progress.companies.companiesProcessed = true;
  await saveSyncProgress(userId, progress);
  console.log(`[Tokko Sync] Branch contact info updated for ${branchResults.filter(r => r.branchInfo).length} companies`);
}

/**
 * Syncing phase: for each unsynced company, fetch its properties fresh and sync via RPC.
 * Checks time budget before starting each company.
 * Returns true if all companies are synced.
 */
async function syncCompaniesChunk(
  apiKeyHash: string,
  userId: string,
  progress: SyncProgress,
  timeGuard: ReturnType<typeof createTimeGuard>,
): Promise<boolean> {
  const companies = progress.discovery.companies;
  const synced = new Set(progress.syncing.companiesSynced);

  // Disable triggers if not already disabled
  if (!progress.syncing.triggersDisabled) {
    console.log('[Tokko Sync] Disabling listing triggers for bulk sync...');
    await supabaseAdmin.rpc('disable_listing_triggers');
    progress.syncing.triggersDisabled = true;
    await saveSyncProgress(userId, progress);
  }

  for (const company of companies) {
    if (synced.has(company.name)) continue;

    // Check time budget before starting a company (each can take 10-30s)
    if (!timeGuard.hasTime()) {
      console.log(`[Tokko Sync] Time budget exhausted before company "${company.name}" (${timeGuard.elapsed()}ms elapsed, ${synced.size}/${companies.length} done)`);
      return false;
    }

    const companyId = progress.companies.companyDbIds[company.name];
    if (!companyId) {
      console.warn(`[Tokko Sync] No DB ID for company "${company.name}", skipping`);
      progress.syncing.companiesSynced.push(company.name);
      await saveSyncProgress(userId, progress);
      continue;
    }

    try {
      await updateSyncStatus(
        apiKeyHash,
        'syncing',
        `Sincronizando "${company.name}" (${synced.size + 1}/${companies.length}, ${progress.syncing.propertiesSynced} propiedades)...`
      );

      const result = await syncCompanyProperties(userId, companyId, company.key, company.name, undefined, timeGuard);
      progress.syncing.propertiesSynced += result.propertiesSynced;
      progress.syncing.errors.push(...result.errors);

      console.log(`[Tokko Sync] Company "${company.name}": ${result.propertiesSynced} properties synced`);
    } catch (error) {
      const errMsg = `Company "${company.name}": ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[Tokko Sync] Company sync failed:`, errMsg);
      progress.syncing.errors.push(errMsg);
    }

    progress.syncing.companiesSynced.push(company.name);
    synced.add(company.name);
    await saveSyncProgress(userId, progress);

    // Heartbeat: refresh sync_started_at so status endpoint doesn't false-recover
    await supabaseAdmin
      .from('users')
      .update({ sync_started_at: new Date().toISOString() })
      .eq('id', userId);
  }

  return true;
}

/**
 * Finalizing phase: re-enable triggers, rebuild listings, trigger photo migration, clear progress.
 */
async function finalizeSync(
  apiKeyHash: string,
  userId: string,
  progress: SyncProgress,
): Promise<void> {
  // Refresh sync_started_at so the status endpoint doesn't trigger recovery
  // while we're finalizing (rebuild can take several seconds for large accounts)
  await supabaseAdmin
    .from('users')
    .update({ sync_started_at: new Date().toISOString() })
    .eq('id', userId);

  // Re-enable triggers
  if (progress.syncing.triggersDisabled) {
    console.log('[Tokko Sync] Re-enabling listing triggers...');
    await supabaseAdmin.rpc('enable_listing_triggers');
    progress.syncing.triggersDisabled = false;
  }

  // Rebuild listings
  console.log('[Tokko Sync] Rebuilding property listings for user...');
  await updateSyncStatus(apiKeyHash, 'syncing', 'Reconstruyendo listados...');
  const { data: rebuildCount, error: rebuildErr } = await supabaseAdmin.rpc('rebuild_user_property_listings', { p_user_id: userId });
  if (rebuildErr) {
    console.error('[Tokko Sync] Rebuild failed, retrying:', rebuildErr.message);
    // Retry once — the first call may fail if triggers were being re-enabled concurrently
    const { data: retryCount } = await supabaseAdmin.rpc('rebuild_user_property_listings', { p_user_id: userId });
    console.log(`[Tokko Sync] Rebuild retry result: ${retryCount ?? 'unknown'} listings`);
  } else {
    console.log(`[Tokko Sync] Rebuilt ${rebuildCount ?? 'unknown'} listings`);
  }

  // Update final status
  await updateSyncStatus(apiKeyHash, 'done', null, progress.syncing.propertiesSynced);

  // Trigger photo migration
  triggerPhotoMigration(userId);

  // Clear progress
  await clearSyncProgress(userId);

  console.log('[Tokko Sync] Network sync finalized:', {
    propertiesSynced: progress.syncing.propertiesSynced,
    companiesSynced: progress.syncing.companiesSynced.length,
    errors: progress.syncing.errors.length,
  });
}

/**
 * Resumable network account sync. Handles unlimited volume by splitting work
 * across multiple 300s function invocations with self-chaining.
 *
 * Phases: discovery → companies → syncing → finalizing
 *
 * Progress is stored in the `sync_progress` JSONB column on `users`.
 * Each invocation processes as much as it can within ~250s, saves progress,
 * and fires a new call to continue.
 */
async function syncNetworkAccountResumable(
  apiKey: string,
  authId: string,
  authEmail: string,
  resume: boolean,
  startTime: number,
): Promise<SyncResult> {
  const apiKeyHash = hashApiKey(apiKey);
  const timeGuard = createTimeGuard(startTime);

  // Find user
  const userId = await findUser(authId, authEmail, apiKeyHash);

  // Load or create progress
  let progress: SyncProgress;
  if (resume) {
    const existing = await loadSyncProgress(userId);
    if (!existing) {
      console.log('[Tokko Sync] Resume requested but no progress found, nothing to do');
      return { userId, propertiesSynced: 0, companiesSynced: 0, locationsSynced: 0, errors: [] };
    }
    progress = existing;
    progress.chainIndex++;
    console.log(`[Tokko Sync] Resuming chain link #${progress.chainIndex}, phase: ${progress.phase}`);

    // Refresh sync_started_at so status endpoint doesn't auto-recover during chain
    await supabaseAdmin
      .from('users')
      .update({ sync_started_at: new Date().toISOString() })
      .eq('id', userId);
  } else {
    // Fresh start — clear any stale progress
    await clearSyncProgress(userId);
    progress = createInitialProgress();

    // Set up user record
    let apiKeyEnc: string | undefined;
    try {
      apiKeyEnc = encryptApiKey(apiKey);
    } catch {
      console.warn('[Tokko Sync] Could not encrypt API key');
    }

    await supabaseAdmin
      .from('users')
      .update({
        tokko_api_hash: apiKeyHash,
        tokko_api_key_enc: apiKeyEnc || null,
        account_type: 4, // Upgrade from inmobiliaria (3) to network (4)
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    await updateSyncStatus(apiKeyHash, 'syncing', 'Conectando con Tokko (red inmobiliaria)...');
    console.log('[Tokko Sync] Starting NETWORK account sync (resumable), user:', userId);
  }

  try {
    // Phase: Discovery
    if (progress.phase === 'discovery') {
      const discoveryComplete = await discoverNetworkChunk(apiKey, apiKeyHash, userId, progress, timeGuard);

      if (!discoveryComplete) {
        console.log(`[Tokko Sync] Discovery paused at offset ${progress.discovery.offset}/${progress.discovery.totalCount}. Chaining...`);
        return { userId, propertiesSynced: 0, companiesSynced: 0, locationsSynced: 0, errors: [], needsChain: true, chainParams: { apiKey, authId, authEmail } };
      }

      if (progress.discovery.companies.length === 0) {
        await updateSyncStatus(apiKeyHash, 'error', 'No se encontraron inmobiliarias en esta red');
        await clearSyncProgress(userId);
        throw new Error('No companies found in network');
      }

      console.log(`[Tokko Sync] Discovery complete: ${progress.discovery.companies.length} companies found`);
      progress.phase = 'companies';
      await saveSyncProgress(userId, progress);
    }

    // Phase: Companies
    if (progress.phase === 'companies') {
      if (!timeGuard.hasTime()) {
        console.log(`[Tokko Sync] No time for companies phase (${timeGuard.elapsed()}ms elapsed). Chaining...`);
        return { userId, propertiesSynced: 0, companiesSynced: 0, locationsSynced: 0, errors: [], needsChain: true, chainParams: { apiKey, authId, authEmail } };
      }

      await processCompaniesPhase(apiKeyHash, userId, progress);
      progress.phase = 'syncing';
      await saveSyncProgress(userId, progress);
    }

    // Phase: Syncing
    if (progress.phase === 'syncing') {
      const syncComplete = await syncCompaniesChunk(apiKeyHash, userId, progress, timeGuard);

      if (!syncComplete) {
        console.log(`[Tokko Sync] Syncing paused (${progress.syncing.companiesSynced.length}/${progress.discovery.companies.length} companies done, ${timeGuard.elapsed()}ms elapsed). Chaining...`);
        return {
          userId,
          propertiesSynced: progress.syncing.propertiesSynced,
          companiesSynced: progress.syncing.companiesSynced.length,
          locationsSynced: 0,
          errors: progress.syncing.errors,
          needsChain: true,
          chainParams: { apiKey, authId, authEmail },
        };
      }

      progress.phase = 'finalizing';
      await saveSyncProgress(userId, progress);
    }

    // Phase: Finalizing
    if (progress.phase === 'finalizing') {
      await finalizeSync(apiKeyHash, userId, progress);
    }

    return {
      userId,
      propertiesSynced: progress.syncing.propertiesSynced,
      companiesSynced: progress.discovery.companies.length,
      locationsSynced: 0,
      errors: progress.syncing.errors,
    };
  } catch (error) {
    // Ensure triggers are re-enabled on unexpected errors
    if (progress.syncing.triggersDisabled) {
      try { await supabaseAdmin.rpc('enable_listing_triggers'); } catch {}
    }
    await updateSyncStatus(apiKeyHash, 'error', error instanceof Error ? error.message : 'Error desconocido');
    await clearSyncProgress(userId);
    throw new Error(`Network sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main sync function.
 * Detects network vs regular account and dispatches accordingly.
 *
 * @param resume - true when called by self-chain (skips network detection, resumes from progress)
 * @param startTime - when the current invocation started (for time budget)
 */
export async function syncTokkoData(
  apiKey: string,
  propertyLimit: number = 5,
  authId: string,
  authEmail: string,
  resume: boolean = false,
  startTime: number = Date.now(),
): Promise<SyncResult> {
  // Self-chained calls go straight to resumable sync (we know it's network)
  if (resume) {
    console.log('[Tokko Sync] Resuming network sync (self-chained)');
    return syncNetworkAccountResumable(apiKey, authId, authEmail, true, startTime);
  }

  // Detect if this is a network key
  const network = await isNetworkKey(apiKey);

  if (network) {
    console.log('[Tokko Sync] Detected NETWORK account — starting resumable sync');
    return syncNetworkAccountResumable(apiKey, authId, authEmail, false, startTime);
  }

  // Regular single-inmobiliaria sync (unchanged — always fits in 300s)
  console.log('[Tokko Sync] Detected REGULAR account');
  const errors: string[] = [];
  const apiKeyHash = hashApiKey(apiKey);
  let apiKeyEnc: string | undefined;
  try {
    apiKeyEnc = encryptApiKey(apiKey);
  } catch {
    console.warn('[Tokko Sync] Could not encrypt API key (API_KEY_SECRET may not be set)');
  }
  const client = new TokkoClient(apiKey);
  const limit = Math.min(500, Math.max(1, Math.floor(propertyLimit)));

  try {
    await updateSyncStatus(apiKeyHash, 'syncing', 'Conectando con Tokko...');

    // Fetch branches to find primary branch and create company
    console.log('[Tokko Sync] Fetching branches...');
    const allBranches = await client.getAllBranches();
    console.log(`[Tokko Sync] Fetched ${allBranches.length} branches`);

    const primaryBranch = findPrimaryBranch(allBranches);
    const contactInfo = extractBranchContactInfo(allBranches);
    const userName = primaryBranch?.display_name || primaryBranch?.name || undefined;
    const userPhone: UserPhone = {
      telefono: contactInfo.phone || undefined,
      telefono_country_code: contactInfo.phone_country_code || undefined,
      telefono_extension: primaryBranch?.phone_extension || undefined,
    };
    const userLogo = primaryBranch?.logo || undefined;
    const tokkoEmail = contactInfo.email || undefined;

    // Find user and update with Tokko data
    const userId = await findUser(authId, authEmail, apiKeyHash);
    await updateUserWithTokkoData(userId, authId, apiKeyHash, {
      name: userName,
      phone: userPhone,
      logo: userLogo,
      tokkoEmail,
    }, apiKeyEnc);
    console.log('[Tokko Sync] User ID:', userId);

    // Create company from primary branch
    let companyKeyEnc: string | null = null;
    try {
      companyKeyEnc = encryptApiKey(apiKey);
    } catch {}

    const companyName = primaryBranch?.display_name || primaryBranch?.name || 'Mi Inmobiliaria';
    const companyId = await upsertCompany(userId, {
      name: companyName,
      logo: primaryBranch?.logo || null,
      tokko_key_enc: companyKeyEnc,
      email: contactInfo.email,
      phone: contactInfo.phone,
      phone_country_code: contactInfo.phone_country_code,
      address: contactInfo.address,
    });
    console.log(`[Tokko Sync] Company created: "${companyName}" (id: ${companyId})`);

    // Sync properties
    console.log(`[Tokko Sync] Searching up to ${limit} rent properties (Apartment/House/PH)...`);
    await updateSyncStatus(apiKeyHash, 'syncing', 'Buscando propiedades...');

    // Disable listing triggers during bulk sync
    console.log('[Tokko Sync] Disabling listing triggers for bulk sync...');
    await supabaseAdmin.rpc('disable_listing_triggers');

    let result: { propertiesSynced: number; errors: string[] };
    try {
      result = await syncCompanyProperties(userId, companyId, apiKey, companyName, { maxProperties: limit });
    } finally {
      console.log('[Tokko Sync] Re-enabling listing triggers...');
      await supabaseAdmin.rpc('enable_listing_triggers');
    }

    errors.push(...result.errors);

    if (result.propertiesSynced === 0) {
      await updateSyncStatus(apiKeyHash, 'error', 'No se encontraron propiedades para esta API key');
      throw new Error('No properties found for this API key');
    }

    // Rebuild listings only for this user
    console.log('[Tokko Sync] Rebuilding property listings for user...');
    await updateSyncStatus(apiKeyHash, 'syncing', 'Reconstruyendo listados...');
    await supabaseAdmin.rpc('rebuild_user_property_listings', { p_user_id: userId });

    console.log('[Tokko Sync] Regular sync finished:', {
      propertiesSynced: result.propertiesSynced,
      errors: errors.length,
    });

    await updateSyncStatus(apiKeyHash, 'done', null, result.propertiesSynced);

    // Trigger background photo migration
    triggerPhotoMigration(userId);

    return {
      userId,
      propertiesSynced: result.propertiesSynced,
      companiesSynced: 1,
      locationsSynced: 0,
      errors,
    };
  } catch (error) {
    // Ensure triggers are re-enabled even on unexpected errors
    try { await supabaseAdmin.rpc('enable_listing_triggers'); } catch {}
    await updateSyncStatus(apiKeyHash, 'error', error instanceof Error ? error.message : 'Error desconocido');
    throw new Error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
