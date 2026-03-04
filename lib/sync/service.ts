import { TokkoClient, TokkoProperty, TokkoBranch } from '@/lib/tokko/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import CryptoJS from 'crypto-js';
import { encryptApiKey } from '@/lib/crypto';

/** Tokko operation type ID for Rent. Sale=1, Rent=2, Temporary Rent=3. */
const RENT_OPERATION_ID = 2;
/** Property type IDs to sync: Apartment=2, House=3, PH=13. */
const SYNC_PROPERTY_TYPES = [2, 3, 13];
/** Max concurrent company syncs for network accounts. */
const NETWORK_SYNC_BATCH_SIZE = 5;

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
 * Get location ID from database (reference data only, profile_id IS NULL).
 * Locations must be pre-seeded via locations-seed.sql; we do not create locations during sync.
 * Uses cache to avoid repeated queries.
 */
async function getLocationIdById(locationId: number, cache: Map<number, number>): Promise<number | null> {
  if (cache.has(locationId)) {
    return cache.get(locationId)!;
  }

  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const { data, error } = await supabaseAdmin
      .from('tokko_location')
      .select('id')
      .eq('id', locationId)
      .maybeSingle();

    if (error) {
      // Retry on transient errors (502, 503, timeout, etc.)
      if (attempt < MAX_RETRIES) {
        console.warn(`[Tokko Sync] Location lookup error for ${locationId} (attempt ${attempt}/${MAX_RETRIES}), retrying...`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      console.error(`[Tokko Sync] Location lookup failed for ${locationId} after ${MAX_RETRIES} attempts:`, error.message.slice(0, 200));
      return null;
    }

    if (!data) {
      // Location not in DB (likely non-Argentina) — skip silently
      return null;
    }

    cache.set(locationId, data.id);
    return data.id;
  }

  return null;
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
 * Sync property type — only insert if missing, never overwrite existing names.
 */
async function syncPropertyType(type: { id: number; code: string; name: string }): Promise<void> {
  await supabaseAdmin
    .from('tokko_property_type')
    .upsert({
      id: type.id,
      code: type.code,
      name: type.name,
    }, {
      onConflict: 'id',
      ignoreDuplicates: true,
    });
}

/**
 * Sync property tag
 */
async function syncPropertyTag(tag: { id: number; name: string; type: number }): Promise<void> {
  await supabaseAdmin
    .from('tokko_property_tag')
    .upsert({
      id: tag.id,
      name: tag.name,
      type: tag.type,
    }, {
      onConflict: 'id',
    });
}

/**
 * Sync operation type (reference data)
 */
async function syncOperationType(id: number, name: string): Promise<void> {
  await supabaseAdmin
    .from('tokko_operation_type')
    .upsert({
      id,
      name,
    }, {
      onConflict: 'id',
    });
}


/**
 * Parse a text field to numeric, returning null if not a valid number
 */
function parseNumericText(value: string | undefined | null): number | null {
  if (!value) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Sync property with all related data.
 * Now uses company_id instead of branch_id.
 */
async function syncProperty(
  profileId: string,
  property: TokkoProperty,
  companyId: number,
  locationCache: Map<number, number>
): Promise<boolean> {
  // Sync property type
  if (property.type) {
    await syncPropertyType(property.type);
  }

  // Sync tags
  const tagPromises = (property.tags || []).map(tag => syncPropertyTag(tag));
  await Promise.all(tagPromises);

  // Resolve location from pre-seeded reference data
  let locationId: number | null = null;
  let parentDivisionLocationId: number | null = null;

  if (property.location) {
    locationId = await getLocationIdById(property.location.id, locationCache);

    // Skip properties with unknown locations (e.g. outside Argentina)
    if (locationId === null) {
      console.warn(`[Tokko Sync] Skipping property ${property.id}: location ${property.location.id} not in database (likely non-Argentina)`);
      return false;
    }

    if (property.location.parent_division) {
      const parentDivMatch = property.location.parent_division.match(/\/location\/(\d+)\//);
      if (parentDivMatch) {
        const parentDivId = parseInt(parentDivMatch[1], 10);
        parentDivisionLocationId = await getLocationIdById(parentDivId, locationCache);
      }
    }
  }

  // Sync property — now with company_id instead of branch_id/producer_id
  const { data: syncedProperty, error: propError } = await supabaseAdmin
    .from('properties')
    .upsert({
      tokko_id: property.id,
      tokko: true,
      user_id: profileId,
      company_id: companyId,
      location_id: locationId,
      parent_division_location_id: parentDivisionLocationId,
      type_id: property.type?.id || null,
      address: property.address,
      address_complement: property.address_complement,
      real_address: property.real_address,
      fake_address: property.fake_address,
      geo_lat: property.geo_lat,
      geo_long: property.geo_long,
      gm_location_type: property.gm_location_type,
      block_number: property.block_number,
      lot_number: property.lot_number,
      floor: property.floor,
      apartment_door: property.apartment_door,
      age: property.age,
      room_amount: property.room_amount,
      bathroom_amount: property.bathroom_amount,
      toilet_amount: property.toilet_amount,
      suite_amount: property.suite_amount,
      total_suites: property.total_suites,
      suites_with_closets: property.suites_with_closets,
      roofed_surface: property.roofed_surface,
      semiroofed_surface: property.semiroofed_surface,
      unroofed_surface: property.unroofed_surface,
      total_surface: property.total_surface,
      surface: property.surface,
      surface_measurement: property.surface_measurement,
      livable_area: property.livable_area,
      floors_amount: property.floors_amount,
      front_measure: property.front_measure,
      depth_measure: property.depth_measure,
      private_area: property.private_area,
      common_area: property.common_area,
      parking_lot_amount: property.parking_lot_amount,
      covered_parking_lot: property.covered_parking_lot,
      uncovered_parking_lot: property.uncovered_parking_lot,
      parking_lot_condition: property.parking_lot_condition as string | null,
      parking_lot_type: property.parking_lot_type as string | null,
      status: property.status,
      situation: property.situation,
      is_denounced: property.is_denounced || false,
      is_starred_on_web: property.is_starred_on_web || false,
      quality_level: property.quality_level as string | null,
      location_level: property.location_level as string | null,
      property_condition: property.property_condition,
      legally_checked: property.legally_checked,
      disposition: property.disposition,
      orientation: property.orientation,
      dining_room: property.dining_room,
      living_amount: property.living_amount,
      tv_rooms: property.tv_rooms,
      guests_amount: property.guests_amount,
      appartments_per_floor: property.appartments_per_floor,
      building: property.building,
      publication_title: property.publication_title,
      public_url: property.public_url,
      seo_description: property.seo_description,
      seo_keywords: property.seo_keywords,
      portal_footer: property.portal_footer,
      rich_description: property.rich_description,
      description: property.description,
      web_price: property.web_price || false,
      reference_code: property.reference_code,
      zonification: property.zonification,
      extra_attributes: property.extra_attributes || null,
      custom_tags: property.custom_tags || null,
      internal_data: property.internal_data || null,
      development: property.development || null,
      occupation: property.occupation || null,
      files: property.files || null,
      videos: property.videos || null,
      created_at: property.created_at,
      deleted_at: property.deleted_at || null,
      updated_at: property.updated_at || null,
    }, {
      onConflict: 'tokko_id,user_id',
    })
    .select('id')
    .single();

  if (propError) {
    throw new Error(`Failed to sync property ${property.id}: ${propError.message}`);
  }

  const propertyId = syncedProperty?.id as number;

  // Sync operations
  await supabaseAdmin
    .from('operaciones')
    .delete()
    .eq('property_id', propertyId)
    .eq('status', 'available');

  const operationsToInsert: any[] = [];

  if (property.operations && property.operations.length > 0) {
    await Promise.all(
      property.operations.map(op => syncOperationType(op.operation_id, op.operation_type))
    );

    const rentOperations = property.operations.filter(op => op.operation_id === RENT_OPERATION_ID);

    for (const operation of rentOperations) {
      const prices = operation.prices || [];
      const primaryPrice = prices[0];
      const secondaryPrice = prices[1];

      if (prices.length > 2) {
        console.warn(`[Tokko Sync] Property ${property.id} operation has ${prices.length} prices, only storing first 2`);
      }

      operationsToInsert.push({
        property_id: propertyId,
        tokko_operation_id: operation.operation_id,
        status: 'available',
        currency: primaryPrice?.currency || null,
        price: primaryPrice?.price || null,
        period: primaryPrice?.period != null ? String(primaryPrice.period) : '0',
        is_promotional: primaryPrice?.is_promotional || false,
        secondary_currency: secondaryPrice?.currency || null,
        secondary_price: secondaryPrice?.price || null,
        expenses: property.expenses ?? null,
        cleaning_tax: parseNumericText(property.cleaning_tax),
        fire_insurance_cost: parseNumericText(property.fire_insurance_cost),
        down_payment: parseNumericText(property.down_payment),
        custom1: property.custom1 ?? null,
        credit_eligible: property.credit_eligible ?? null,
        iptu: property.iptu ?? null,
      });
    }
  } else {
    operationsToInsert.push({
      property_id: propertyId,
      status: 'available',
      expenses: property.expenses ?? null,
      cleaning_tax: parseNumericText(property.cleaning_tax),
      fire_insurance_cost: parseNumericText(property.fire_insurance_cost),
      down_payment: parseNumericText(property.down_payment),
      custom1: property.custom1 ?? null,
      credit_eligible: property.credit_eligible ?? null,
      iptu: property.iptu ?? null,
    });
  }

  if (operationsToInsert.length > 0) {
    const { error } = await supabaseAdmin.from('operaciones').insert(operationsToInsert);
    if (error) {
      throw new Error(`Failed to insert operaciones: ${error.message}`);
    }
  }

  // Sync tags (bulk upsert)
  if (property.tags && property.tags.length > 0) {
    const tagLinks = property.tags.map(tag => ({
      property_id: propertyId,
      tag_id: tag.id,
    }));

    await supabaseAdmin
      .from('tokko_property_property_tag')
      .upsert(tagLinks, {
        onConflict: 'property_id,tag_id',
      });
  }

  // Sync photos (bulk insert)
  if (property.photos && property.photos.length > 0) {
    const { data: existingPhotos } = await supabaseAdmin
      .from('tokko_property_photo')
      .select('storage_path')
      .eq('property_id', propertyId)
      .not('storage_path', 'is', null);

    if (existingPhotos && existingPhotos.length > 0) {
      try {
        const { deletePropertyPhotos } = await import('@/lib/storage/gcs');
        await deletePropertyPhotos(propertyId);
      } catch (e) {
        console.warn(`[sync] Failed to delete GCS photos for property ${propertyId}:`, e);
      }
    }

    await supabaseAdmin
      .from('tokko_property_photo')
      .delete()
      .eq('property_id', propertyId);

    const photosToInsert = property.photos.map(photo => ({
      property_id: propertyId,
      image: photo.image,
      original: photo.original,
      thumb: photo.thumb,
      description: photo.description || null,
      is_blueprint: photo.is_blueprint,
      is_front_cover: photo.order === 0,
      order: photo.order,
      storage_path: null,
    }));

    await supabaseAdmin.from('tokko_property_photo').insert(photosToInsert);
  }

  return true;
}

/**
 * Sync properties for a single company. Used by both network and regular account flows.
 * If `prefetchedProperties` is provided, uses those directly instead of calling Tokko API.
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

  const locationCache = new Map<number, number>();
  let propertiesSynced = 0;
  const BATCH_SIZE = 20;

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(properties.length / BATCH_SIZE);

    await Promise.all(
      batch.map(async (property) => {
        try {
          const synced = await syncProperty(userId, property, companyId, locationCache);
          if (synced) propertiesSynced++;
        } catch (error) {
          errors.push(`Property ${property.id} (${companyName}): ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.warn(`[Tokko Sync]   ✗ Property ${property.id} failed:`, error);
        }
      })
    );

    console.log(`[Tokko Sync] Company "${companyName}" batch ${batchNumber}/${totalBatches} complete (${propertiesSynced}/${properties.length})`);
  }

  return { propertiesSynced, errors };
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
 * Update sync status in users table for progress tracking
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
      console.log(`[Tokko Sync] Company upserted: "${company.name}" (id: ${companyId})`);
    }

    // Disable listing triggers during bulk sync to avoid per-row rebuilds
    console.log('[Tokko Sync] Disabling listing triggers for bulk sync...');
    await supabaseAdmin.rpc('disable_listing_triggers');

    // Phase 2: Sync properties (already fetched) + fetch branch contact info per company
    let totalPropertiesSynced = 0;
    const companyEntries = Array.from(companyMap.entries());

    try {
      for (let i = 0; i < companyEntries.length; i += NETWORK_SYNC_BATCH_SIZE) {
        const batch = companyEntries.slice(i, i + NETWORK_SYNC_BATCH_SIZE);
        const batchNum = Math.floor(i / NETWORK_SYNC_BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(companyEntries.length / NETWORK_SYNC_BATCH_SIZE);
        console.log(`[Tokko Sync] Company batch ${batchNum}/${totalBatches} (${batch.length} companies)`);

        const results = await Promise.all(
          batch.map(async ([companyName, { id: companyId, key: companyKey }]) => {
            try {
              // Fetch branches with company key to get contact info
              const companyClient = new TokkoClient(companyKey);
              const branches = await companyClient.getAllBranches();
              const warnings: string[] = [];

              if (branches.length === 0) {
                warnings.push(`Company "${companyName}": Could not fetch branch data (no contact info available)`);
              }

              const contactInfo = extractBranchContactInfo(branches);

              await supabaseAdmin
                .from('tokko_company')
                .update({
                  email: contactInfo.email,
                  phone: contactInfo.phone,
                  phone_area: contactInfo.phone_area,
                  phone_country_code: contactInfo.phone_country_code,
                  address: contactInfo.address,
                })
                .eq('id', companyId);

              // Sync pre-fetched properties for this company
              const companyProperties = propertiesByCompany.get(companyName) || [];
              const result = await syncCompanyProperties(userId, companyId, companyKey, companyName, { prefetchedProperties: companyProperties });
              result.errors.push(...warnings);
              return result;
            } catch (error) {
              const errMsg = `Company "${companyName}": ${error instanceof Error ? error.message : 'Unknown error'}`;
              console.error(`[Tokko Sync] Company sync failed:`, errMsg);
              return { propertiesSynced: 0, errors: [errMsg] };
            }
          })
        );

        for (const result of results) {
          totalPropertiesSynced += result.propertiesSynced;
          errors.push(...result.errors);
        }

        await updateSyncStatus(
          apiKeyHash,
          'syncing',
          `Sincronizando inmobiliarias ${Math.min(i + NETWORK_SYNC_BATCH_SIZE, companyEntries.length)}/${companyEntries.length} (${totalPropertiesSynced} propiedades)...`
        );
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
