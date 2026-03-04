import { TokkoClient, TokkoProperty, TokkoBranch } from '@/lib/tokko/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import CryptoJS from 'crypto-js';
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
}

/**
 * Hash API key for identification (SHA-256)
 */
function hashApiKey(apiKey: string): string {
  return CryptoJS.SHA256(apiKey).toString();
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
  phone_area: string | null;
  phone_country_code: string | null;
  address: string | null;
} {
  const primary = findPrimaryBranch(branches);
  const info = {
    email: primary?.email || null,
    phone: primary?.phone || null,
    phone_area: primary?.phone_area || null,
    phone_country_code: primary?.phone_country_code || null,
    address: primary?.address || null,
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
      info.phone = branchWithPhone.phone || null;
      info.phone_area = branchWithPhone.phone_area || null;
      info.phone_country_code = branchWithPhone.phone_country_code || null;
    }
  }

  return info;
}

/**
 * Find existing user by auth_id, email, or tokko_api_hash.
 * The user MUST already exist (created by the DB trigger on auth signup).
 */
async function findUser(authId: string, authEmail: string, apiKeyHash: string): Promise<string> {
  // 1. By auth_id (should always hit — trigger creates the row on signup)
  const { data: byAuth } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', authId)
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
  telefono_area?: string;
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
  if (data.phone?.telefono_area) updates.telefono_area = data.phone.telefono_area;
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
    phone_area?: string | null;
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
      phone_area: company.phone_area || null,
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

/**
 * Sync a network account: discover companies, then sync each company individually.
 * Branch fetches are parallelized upfront, and properties are synced via batch RPC.
 */
async function syncNetworkAccount(
  apiKey: string,
  authId: string,
  authEmail: string
): Promise<SyncResult> {
  const errors: string[] = [];
  const apiKeyHash = hashApiKey(apiKey);
  let apiKeyEnc: string | undefined;
  try {
    apiKeyEnc = encryptApiKey(apiKey);
  } catch {
    console.warn('[Tokko Sync] Could not encrypt API key (API_KEY_SECRET may not be set)');
  }

  console.log('[Tokko Sync] Starting NETWORK account sync');

  try {
    await updateSyncStatus(apiKeyHash, 'syncing', 'Conectando con Tokko (red inmobiliaria)...');

    // Find user
    const userId = await findUser(authId, authEmail, apiKeyHash);

    // Update user with network key hash and encrypted key (but no name/logo — that's per-company)
    await supabaseAdmin
      .from('users')
      .update({
        tokko_api_hash: apiKeyHash,
        tokko_api_key_enc: apiKeyEnc || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    console.log('[Tokko Sync] User ID:', userId);

    // Phase 1: Discover companies AND collect matching properties in one pass
    await updateSyncStatus(apiKeyHash, 'syncing', 'Descubriendo inmobiliarias en la red...');
    const networkClient = new TokkoClient(apiKey);
    const { companies, propertiesByCompany } = await networkClient.discoverNetwork(
      { operationTypes: [RENT_OPERATION_ID], propertyTypes: SYNC_PROPERTY_TYPES },
      (scanned, total, found) => {
        updateSyncStatus(apiKeyHash, 'syncing', `Descubriendo propiedades ${scanned.toLocaleString('es-AR')} de ${total.toLocaleString('es-AR')} (${found} inmobiliarias encontradas)...`);
      }
    );

    const totalMatchingProperties = Array.from(propertiesByCompany.values()).reduce((sum, props) => sum + props.length, 0);
    console.log(`[Tokko Sync] Discovered ${companies.length} companies, ${totalMatchingProperties} matching properties`);

    if (companies.length === 0) {
      await updateSyncStatus(apiKeyHash, 'error', 'No se encontraron inmobiliarias en esta red');
      throw new Error('No companies found in network');
    }

    await updateSyncStatus(apiKeyHash, 'syncing', `Encontradas ${companies.length} inmobiliarias (${totalMatchingProperties} propiedades). Sincronizando...`);

    // Upsert all companies
    const companyMap = new Map<string, { id: number; key: string }>();
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

      companyMap.set(company.name, { id: companyId, key: company.key });
    }
    console.log(`[Tokko Sync] ${companyMap.size} companies upserted`);

    // Phase 1.5: Fetch ALL branch contact info in parallel (before property sync)
    await updateSyncStatus(apiKeyHash, 'syncing', `Obteniendo datos de contacto de ${companyMap.size} inmobiliarias...`);
    const companyEntries = Array.from(companyMap.entries());

    console.log(`[Tokko Sync] Fetching branches for all ${companyEntries.length} companies in parallel...`);
    const branchResults = await Promise.all(
      companyEntries.map(async ([companyName, { id: companyId, key: companyKey }]) => {
        try {
          const companyClient = new TokkoClient(companyKey);
          const branches = await companyClient.getAllBranches();
          const contactInfo = extractBranchContactInfo(branches);
          return { companyName, companyId, contactInfo, warning: branches.length === 0 ? `Company "${companyName}": Could not fetch branch data` : null };
        } catch {
          return { companyName, companyId, contactInfo: null, warning: `Company "${companyName}": Branch fetch failed` };
        }
      })
    );

    // Batch update company contact info
    for (const result of branchResults) {
      if (result.warning) errors.push(result.warning);
      if (result.contactInfo) {
        await supabaseAdmin
          .from('tokko_company')
          .update({
            email: result.contactInfo.email,
            phone: result.contactInfo.phone,
            phone_area: result.contactInfo.phone_area,
            phone_country_code: result.contactInfo.phone_country_code,
            address: result.contactInfo.address,
          })
          .eq('id', result.companyId);
      }
    }
    console.log(`[Tokko Sync] Branch contact info updated for ${branchResults.filter(r => r.contactInfo).length} companies`);

    // Disable listing triggers during bulk sync to avoid per-row rebuilds
    console.log('[Tokko Sync] Disabling listing triggers for bulk sync...');
    await supabaseAdmin.rpc('disable_listing_triggers');

    // Phase 2: Sync properties via batch RPC
    let totalPropertiesSynced = 0;

    try {
      for (let i = 0; i < companyEntries.length; i++) {
        const [companyName, { id: companyId, key: companyKey }] = companyEntries[i];

        try {
          const companyProperties = propertiesByCompany.get(companyName) || [];
          const result = await syncCompanyProperties(userId, companyId, companyKey, companyName, { prefetchedProperties: companyProperties });

          totalPropertiesSynced += result.propertiesSynced;
          errors.push(...result.errors);
        } catch (error) {
          const errMsg = `Company "${companyName}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`[Tokko Sync] Company sync failed:`, errMsg);
          errors.push(errMsg);
        }

        // Update progress every 5 companies
        if ((i + 1) % 5 === 0 || i === companyEntries.length - 1) {
          await updateSyncStatus(
            apiKeyHash,
            'syncing',
            `Sincronizando inmobiliarias ${i + 1}/${companyEntries.length} (${totalPropertiesSynced} propiedades)...`
          );
        }
      }
    } finally {
      // Always re-enable triggers, even if sync fails
      console.log('[Tokko Sync] Re-enabling listing triggers...');
      await supabaseAdmin.rpc('enable_listing_triggers');
    }

    // Rebuild listings only for this user (not the entire table)
    console.log('[Tokko Sync] Rebuilding property listings for user...');
    await updateSyncStatus(apiKeyHash, 'syncing', 'Reconstruyendo listados...');
    await supabaseAdmin.rpc('rebuild_user_property_listings', { p_user_id: userId });

    console.log('[Tokko Sync] Network sync finished:', {
      companiesSynced: companyMap.size,
      propertiesSynced: totalPropertiesSynced,
      errors: errors.length,
    });

    await updateSyncStatus(apiKeyHash, 'done', null, totalPropertiesSynced);

    // Trigger background photo migration
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${appUrl}/api/photos/migrate?userId=${userId}`, {
        method: 'POST',
      }).catch(() => {});
    } catch {}

    return {
      userId,
      propertiesSynced: totalPropertiesSynced,
      companiesSynced: companyMap.size,
      locationsSynced: 0,
      errors,
    };
  } catch (error) {
    // Ensure triggers are re-enabled even on unexpected errors
    try { await supabaseAdmin.rpc('enable_listing_triggers'); } catch {}
    await updateSyncStatus(apiKeyHash, 'error', error instanceof Error ? error.message : 'Error desconocido');
    throw new Error(`Network sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main sync function.
 * Detects network vs regular account and dispatches accordingly.
 */
export async function syncTokkoData(
  apiKey: string,
  propertyLimit: number = 5,
  authId: string,
  authEmail: string
): Promise<SyncResult> {
  // Detect if this is a network key
  const network = await isNetworkKey(apiKey);

  if (network) {
    console.log('[Tokko Sync] Detected NETWORK account — delegating to network sync');
    return syncNetworkAccount(apiKey, authId, authEmail);
  }

  // Regular single-inmobiliaria sync
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
      telefono_area: contactInfo.phone_area || undefined,
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
      phone_area: contactInfo.phone_area,
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
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${appUrl}/api/photos/migrate?userId=${userId}`, {
        method: 'POST',
      }).catch(() => {});
    } catch {}

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
