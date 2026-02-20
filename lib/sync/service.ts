import { TokkoClient, TokkoProperty, TokkoBranch, TokkoUser, TokkoOwner, TokkoLocation } from '@/lib/tokko/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import CryptoJS from 'crypto-js';

/** Tokko operation type ID for Rent. Sale=1, Rent=2, Temporary Rent=3. */
const RENT_OPERATION_ID = 2;
/** Property type IDs to sync: Apartment=2, House=3, PH=13. */
const SYNC_PROPERTY_TYPES = [2, 3, 13];

export interface SyncResult {
  userId: string;
  propertiesSynced: number;
  branchesSynced: number;
  usersSynced: number;
  ownersSynced: number;
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
async function getLocationIdById(locationId: number, cache: Map<number, number>): Promise<number> {
  // Check cache first
  if (cache.has(locationId)) {
    return cache.get(locationId)!;
  }

  const { data, error } = await supabaseAdmin
    .from('tokko_location')
    .select('id')
    .eq('id', locationId)
    .maybeSingle();

  if (error) {
    console.error(`[Tokko Sync] Location lookup error for ${locationId}:`, error.message);
    throw new Error(`Failed to lookup location ${locationId}: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      `Location ${locationId} does not exist in database. Ensure locations are seeded (run supabase/locations-seed.sql).`
    );
  }

  // Store in cache
  cache.set(locationId, data.id);
  return data.id;
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
 * Find or create user
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
async function updateUserWithTokkoData(
  userId: string,
  apiKeyHash: string,
  data: TokkoUserData
): Promise<void> {
  const updates: Record<string, string | null> = {
    tokko_api_hash: apiKeyHash,
    updated_at: new Date().toISOString(),
  };
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
}

/**
 * Sync reference data (property types, tags, operation types)
 */
async function syncReferenceData() {
  // These are typically stable and can be synced once
  // For now, we'll handle them as properties come in
  // You could also pre-populate these from Tokko endpoints
}

/**
 * Sync branch
 */
async function syncBranch(profileId: string, branch: TokkoBranch): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('tokko_branch')
    .upsert({
      id: branch.id,
      user_id: profileId,
      name: branch.name,
      display_name: branch.display_name,
      address: branch.address,
      email: branch.email,
      phone: branch.phone,
      phone_area: branch.phone_area,
      phone_country_code: branch.phone_country_code,
      alternative_phone: branch.alternative_phone,
      alternative_phone_area: branch.alternative_phone_area,
      alternative_phone_country_code: branch.alternative_phone_country_code,
      alternative_phone_extension: branch.alternative_phone_extension,
      phone_extension: branch.phone_extension,
      geo_lat: branch.geo_lat,
      geo_long: branch.geo_long,
      branch_type: branch.branch_type,
      contact_time: branch.contact_time,
      created_date: branch.created_date,
      logo: branch.logo,
      pdf_footer_text: branch.pdf_footer_text,
      use_pdf_footer: branch.use_pdf_footer || false,
      is_default: branch.is_default || false,
      gm_location_type: branch.gm_location_type,
      updated_at: branch.updated_at || null,
    }, {
      onConflict: 'id,user_id',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to sync branch ${branch.id}: ${error.message}`);
  }

  return data.id;
}

/**
 * Sync user
 */
async function syncUser(profileId: string, user: TokkoUser): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('tokko_user')
    .upsert({
      id: user.id,
      user_id: profileId,
      name: user.name,
      email: user.email,
      cellphone: user.cellphone,
      phone: user.phone,
      picture: user.picture,
      position: user.position,
      updated_at: user.updated_at || null,
    }, {
      onConflict: 'id,user_id',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to sync user ${user.id}: ${error.message}`);
  }

  return data.id;
}

/**
 * Sync owner
 */
async function syncOwner(profileId: string, owner: TokkoOwner): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('tokko_owner')
    .upsert({
      id: owner.id,
      user_id: profileId,
      name: owner.name,
      email: owner.email,
      work_email: owner.work_email,
      other_email: owner.other_email,
      phone: owner.phone,
      cellphone: owner.cellphone,
      document_number: owner.document_number,
      birthdate: owner.birthdate || null,
      created_at: owner.created_at,
      updated_at: owner.updated_at,
    }, {
      onConflict: 'id,user_id',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to sync owner ${owner.id}: ${error.message}`);
  }

  return data.id;
}

/**
 * Sync property type
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
 * Sync property with all related data (optimized version)
 */
async function syncProperty(
  profileId: string,
  property: TokkoProperty,
  branchMap: Map<number, number>,
  userMap: Map<number, number>,
  ownerMap: Map<number, number>,
  locationCache: Map<number, number>
): Promise<void> {
  // Sync property type
  if (property.type) {
    await syncPropertyType(property.type);
  }

  // Sync tags (collect unique tags for batch processing)
  const tagPromises = (property.tags || []).map(tag => syncPropertyTag(tag));
  await Promise.all(tagPromises);

  // Resolve location from pre-seeded reference data (no creation)
  let locationId: number | null = null;
  let parentDivisionLocationId: number | null = null;

  if (property.location) {
    if (property.location.parent_division) {
      const parentDivMatch = property.location.parent_division.match(/\/location\/(\d+)\//);
      if (parentDivMatch) {
        const parentDivId = parseInt(parentDivMatch[1], 10);
        parentDivisionLocationId = await getLocationIdById(parentDivId, locationCache);
      }
    }

    locationId = await getLocationIdById(property.location.id, locationCache);
  }

  // Sync property into properties table (tokko_id = Tokko id, tokko = true)
  const { data: syncedProperty, error: propError } = await supabaseAdmin
    .from('properties')
    .upsert({
      tokko_id: property.id,
      tokko: true,
      user_id: profileId,
      branch_id: branchMap.get(property.branch.id) || null,
      producer_id: userMap.get(property.producer.id) || null,
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

  // Sync property owners (parallel processing)
  if (property.internal_data?.property_owners) {
    const owners = property.internal_data.property_owners;

    // Sync all owners in parallel
    const ownerPromises = owners.map(async (owner) => {
      const ownerId = await syncOwner(profileId, owner);
      ownerMap.set(owner.id, ownerId);
      return { property_id: propertyId, owner_id: owner.id };
    });

    const ownerLinks = await Promise.all(ownerPromises);

    // Bulk insert property-owner links
    if (ownerLinks.length > 0) {
      await supabaseAdmin
        .from('tokko_property_owner')
        .upsert(ownerLinks, {
          onConflict: 'property_id,owner_id',
        });
    }
  }

  // Sync operations: keep operation types as reference, store pricing in operaciones
  // Delete existing available operaciones for this property (don't touch rented/finished)
  await supabaseAdmin
    .from('operaciones')
    .delete()
    .eq('property_id', propertyId)
    .eq('status', 'available');

  // Prepare operations for batch insert
  const operationsToInsert: any[] = [];

  if (property.operations && property.operations.length > 0) {
    // Sync operation types as reference data (all types, not just rent)
    await Promise.all(
      property.operations.map(op => syncOperationType(op.operation_id, op.operation_type))
    );

    // Only store Rent operations
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
    // If no operations from Tokko, create a blank operacion with just financial fields
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

  // Bulk insert operations
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
    // Delete existing photos
    await supabaseAdmin
      .from('tokko_property_photo')
      .delete()
      .eq('property_id', propertyId);

    // Prepare photos for bulk insert
    const photosToInsert = property.photos.map(photo => ({
      property_id: propertyId,
      image: photo.image,
      original: photo.original,
      thumb: photo.thumb,
      description: photo.description || null,
      is_blueprint: photo.is_blueprint,
      is_front_cover: photo.is_front_cover,
      order: photo.order,
    }));

    // Bulk insert photos
    await supabaseAdmin.from('tokko_property_photo').insert(photosToInsert);
  }
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
 * Main sync function
 * @param apiKey - Tokko API key
 * @param propertyLimit - Max number of properties to sync (default 5, clamped 1–500)
 */
export async function syncTokkoData(apiKey: string, propertyLimit: number = 5, authId: string, authEmail: string): Promise<SyncResult> {
  const errors: string[] = [];
  const apiKeyHash = hashApiKey(apiKey);
  const client = new TokkoClient(apiKey);
  const limit = Math.min(500, Math.max(1, Math.floor(propertyLimit)));

  console.log('[Tokko Sync] Starting sync (user will be created or updated by API key hash)');
  try {
    // Mark sync as started
    await updateSyncStatus(apiKeyHash, 'syncing', 'Conectando con Tokko...');

    // Fetch all branches from the /branch/ endpoint
    console.log('[Tokko Sync] Fetching all branches from Tokko API...');
    const allBranches = await client.getAllBranches();
    console.log(`[Tokko Sync] Fetched ${allBranches.length} branches`);

    // Determine user identity from the primary (default/oldest) branch
    const primaryBranch = findPrimaryBranch(allBranches);
    const userName = primaryBranch?.display_name || primaryBranch?.name || undefined;
    const userPhone: UserPhone = {
      telefono: primaryBranch?.phone || undefined,
      telefono_area: primaryBranch?.phone_area || undefined,
      telefono_country_code: primaryBranch?.phone_country_code || undefined,
      telefono_extension: primaryBranch?.phone_extension || undefined,
    };
    const userLogo = primaryBranch?.logo || undefined;
    const tokkoEmail = primaryBranch?.email || undefined;
    console.log('[Tokko Sync] Primary branch:', primaryBranch?.name || '(none)',
      '| is_default:', primaryBranch?.is_default, '| Name:', userName || '(none)');

    // Find existing user (created by DB trigger on auth signup) and link Tokko data
    console.log('[Tokko Sync] Finding user...');
    const userId = await findUser(authId, authEmail, apiKeyHash);
    await updateUserWithTokkoData(userId, apiKeyHash, {
      name: userName,
      phone: userPhone,
      logo: userLogo,
      tokkoEmail,
    });
    console.log('[Tokko Sync] User ID:', userId);

    console.log(`[Tokko Sync] Searching up to ${limit} rent properties (Apartment/House/PH) from Tokko API...`);
    const properties = await client.searchProperties(limit, {
      operation_types: [RENT_OPERATION_ID],
      property_types: SYNC_PROPERTY_TYPES,
    });
    console.log(`[Tokko Sync] Fetched ${properties.length} properties`);
    await updateSyncStatus(apiKeyHash, 'syncing', `Obtenidas ${properties.length} propiedades de Tokko...`);

    if (properties.length === 0) {
      await updateSyncStatus(apiKeyHash, 'error', 'No se encontraron propiedades para esta API key');
      throw new Error('No properties found for this API key');
    }

    // Fetch all users (producers) from the /user/ endpoint
    console.log('[Tokko Sync] Fetching all users from Tokko API...');
    const allUsers = await client.getAllUsers();
    console.log(`[Tokko Sync] Fetched ${allUsers.length} users`);

    // Collect owners from properties
    const owners = new Map<number, TokkoOwner>();
    for (const property of properties) {
      if (property.internal_data?.property_owners) {
        const propOwners = property.internal_data.property_owners;
        for (const owner of propOwners) {
          owners.set(owner.id, owner);
        }
      }
    }
    console.log('[Tokko Sync] Collected:', { branches: allBranches.length, users: allUsers.length, owners: owners.size });

    // Sync branches (from API endpoint), users, and owners in parallel
    console.log('[Tokko Sync] Syncing branches, users, and owners in parallel...');
    const branchMap = new Map<number, number>();
    const userMap = new Map<number, number>();
    const ownerMap = new Map<number, number>();

    await Promise.all([
      // Sync all branches from the /branch/ endpoint
      Promise.all(
        allBranches.map(async (branch) => {
          try {
            const branchId = await syncBranch(userId, branch);
            branchMap.set(branch.id, branchId);
            console.log(`[Tokko Sync]   Branch synced: ${branch.name} (id: ${branch.id})`);
          } catch (error) {
            errors.push(`Branch ${branch.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.warn(`[Tokko Sync]   Branch failed ${branch.id}:`, error);
          }
        })
      ),
      // Sync all users from /user/ endpoint in parallel
      Promise.all(
        allUsers.map(async (user) => {
          try {
            const syncedTokkoUserId = await syncUser(userId, user);
            userMap.set(user.id, syncedTokkoUserId);
            console.log(`[Tokko Sync]   User synced: ${user.name} (id: ${user.id})`);
          } catch (error) {
            errors.push(`User ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.warn(`[Tokko Sync]   User failed ${user.id}:`, error);
          }
        })
      ),
      // Sync all owners in parallel
      Promise.all(
        Array.from(owners.values()).map(async (owner) => {
          try {
            const ownerId = await syncOwner(userId, owner);
            ownerMap.set(owner.id, ownerId);
            console.log(`[Tokko Sync]   Owner synced: ${owner.name} (id: ${owner.id})`);
          } catch (error) {
            errors.push(`Owner ${owner.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.warn(`[Tokko Sync]   Owner failed ${owner.id}:`, error);
          }
        })
      ),
    ]);

    console.log('[Tokko Sync] Branches, users, and owners synced');

    // Sync properties in parallel batches (locations are looked up from pre-seeded reference data only)
    const locationCache = new Map<number, number>();
    let propertiesSynced = 0;
    const BATCH_SIZE = 20; // Process 20 properties at a time
    console.log(`[Tokko Sync] Syncing properties in batches of ${BATCH_SIZE} (locations must exist in DB)...`);

    // Process properties in batches
    for (let i = 0; i < properties.length; i += BATCH_SIZE) {
      const batch = properties.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(properties.length / BATCH_SIZE);

      console.log(`[Tokko Sync] Processing batch ${batchNumber}/${totalBatches} (${batch.length} properties)...`);

      await Promise.all(
        batch.map(async (property) => {
          try {
            await syncProperty(userId, property, branchMap, userMap, ownerMap, locationCache);
            propertiesSynced++;
            console.log(`[Tokko Sync]   ✓ Property ${property.id} - ${property.publication_title || property.address || 'Untitled'}`);
          } catch (error) {
            errors.push(`Property ${property.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.warn(`[Tokko Sync]   ✗ Property ${property.id} failed:`, error);
          }
        })
      );

      console.log(`[Tokko Sync] Batch ${batchNumber}/${totalBatches} complete (${propertiesSynced}/${properties.length} total)`);
      await updateSyncStatus(apiKeyHash, 'syncing', `Sincronizando ${propertiesSynced}/${properties.length} propiedades...`);
    }

    console.log('[Tokko Sync] Sync finished:', {
      propertiesSynced,
      branchesSynced: branchMap.size,
      usersSynced: userMap.size,
      ownersSynced: ownerMap.size,
      errors: errors.length,
    });

    // Mark sync as complete
    await updateSyncStatus(apiKeyHash, 'done', null, propertiesSynced);

    return {
      userId,
      propertiesSynced,
      branchesSynced: branchMap.size,
      usersSynced: userMap.size,
      ownersSynced: ownerMap.size,
      locationsSynced: 0, // Locations are reference data; no creation during sync
      errors,
    };
  } catch (error) {
    // Mark sync as failed
    await updateSyncStatus(apiKeyHash, 'error', error instanceof Error ? error.message : 'Error desconocido');
    throw new Error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
