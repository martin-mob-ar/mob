import { TokkoClient, TokkoProperty } from '@/lib/tokko/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { decryptApiKey } from '@/lib/crypto';
import { diffAndSyncPhotos } from './incremental-photos';

/** Tokko operation type ID for Rent. Sale=1, Rent=2, Temporary Rent=3. */
const RENT_OPERATION_ID = 2;
/** Property type IDs to sync: Apartment=2, House=3, PH=13. */
const SYNC_PROPERTY_TYPES = [2, 3, 13];

export interface IncrementalSyncTarget {
  userId: string;
  companyId: number | null;
  name: string;
  apiKeyEnc: string;
  /** Company-level sync timestamp (only for company targets). */
  companyLastSyncAt: string | null;
  /** User-level sync timestamp (tokko_last_sync_at). */
  userLastSyncAt: string | null;
}

export interface IncrementalSyncStats {
  propertiesUpdated: number;
  propertiesDeleted: number;
  photosAdded: number;
  photosRemoved: number;
  errors: string[];
  /** True when all pages were processed without timing out or catastrophic error. */
  completed: boolean;
}

/**
 * In-memory cache shared across all targets in a single cron run.
 * Avoids redundant Supabase calls for reference data and location lookups.
 */
export interface SyncCache {
  propertyTypes: Set<number>;
  tags: Set<number>;
  operationTypes: Set<number>;
  /** location_id → exists in DB (true/false) */
  locations: Map<number, boolean>;
}

export function createSyncCache(): SyncCache {
  return {
    propertyTypes: new Set(),
    tags: new Set(),
    operationTypes: new Set(),
    locations: new Map(),
  };
}

/**
 * Fire-and-forget: kick off photo migration for a user.
 * The endpoint self-chains internally, so we just need to fire once.
 */
function triggerPhotoMigration(userId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${appUrl}/api/photos/migrate?userId=${userId}`;
  fetch(url, { method: 'POST' }).catch(() => {});
}

/**
 * Parse a string field as a number if it matches a numeric pattern.
 * Matches the SQL regex check: `^\\d+\\.?\\d*$`
 */
function parseNumericField(val: string | undefined): number | null {
  if (!val) return null;
  if (/^\d+\.?\d*$/.test(val)) return parseFloat(val);
  return null;
}

/**
 * Extract contact phone from TokkoProperty, matching the batch RPC logic:
 * producer.cellphone -> producer.phone -> branch combined phone
 */
function getContactPhone(tkkProp: TokkoProperty): string | null {
  if (tkkProp.producer?.cellphone?.trim()) return tkkProp.producer.cellphone.trim();
  if (tkkProp.producer?.phone?.trim()) return tkkProp.producer.phone.trim();
  const branchPhone = [
    tkkProp.branch?.phone_country_code || '',
    tkkProp.branch?.phone_area || '',
    tkkProp.branch?.phone || '',
  ].join('').trim();
  return branchPhone || null;
}

// ============================================================
// Target Loading
// ============================================================

/**
 * Load all eligible incremental sync targets.
 * Returns companies with API keys + standalone users, ordered by oldest sync first.
 */
export async function getIncrementalSyncTargets(): Promise<IncrementalSyncTarget[]> {
  // Get all companies with encrypted API keys
  const { data: companies } = await supabaseAdmin
    .from('tokko_company')
    .select('id, name, tokko_key_enc, last_incremental_sync_at, user_id')
    .not('tokko_key_enc', 'is', null)
    .order('last_incremental_sync_at', { ascending: true, nullsFirst: true });

  // Get all eligible users (completed initial sync, not currently syncing)
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name, tokko_api_key_enc, tokko_last_sync_at, sync_status')
    .not('tokko_last_sync_at', 'is', null)
    .neq('sync_status', 'syncing');

  const userMap = new Map((users ?? []).map(u => [u.id, u]));
  const companyUserIds = new Set<string>();
  const targets: IncrementalSyncTarget[] = [];

  // 1. Company targets (network accounts + regular accounts with company rows)
  for (const company of companies ?? []) {
    const user = userMap.get(company.user_id);
    if (!user) continue; // User not eligible (no initial sync or currently syncing)
    companyUserIds.add(company.user_id);
    targets.push({
      userId: company.user_id,
      companyId: company.id,
      name: company.name,
      apiKeyEnc: company.tokko_key_enc!,
      companyLastSyncAt: company.last_incremental_sync_at,
      userLastSyncAt: user.tokko_last_sync_at,
    });
  }

  // 2. Standalone users (no company row — regular accounts)
  for (const user of users ?? []) {
    if (companyUserIds.has(user.id)) continue;
    if (!user.tokko_api_key_enc) continue;
    targets.push({
      userId: user.id,
      companyId: null,
      name: user.name || 'Unknown',
      apiKeyEnc: user.tokko_api_key_enc,
      companyLastSyncAt: null,
      userLastSyncAt: user.tokko_last_sync_at,
    });
  }

  return targets;
}

// ============================================================
// Per-Target Incremental Sync
// ============================================================

/**
 * Run incremental sync for a single target (company or standalone user).
 * Fetches changes from both Tokko endpoints and applies them.
 * Only updates last_incremental_sync_at if ALL pages were processed successfully.
 */
export async function syncTargetIncremental(
  target: IncrementalSyncTarget,
  timeGuard: { hasTime: () => boolean },
  cache?: SyncCache,
): Promise<IncrementalSyncStats> {
  const stats: IncrementalSyncStats = {
    propertiesUpdated: 0,
    propertiesDeleted: 0,
    photosAdded: 0,
    photosRemoved: 0,
    errors: [],
    completed: false,
  };

  // 1. Decrypt API key
  let apiKey: string;
  try {
    apiKey = decryptApiKey(target.apiKeyEnc);
    if (!apiKey) throw new Error('Empty key after decryption');
  } catch (error) {
    stats.errors.push(`${target.name}: Failed to decrypt API key`);
    console.error(`[Incremental Sync] ${target.name}: API key decryption failed:`, error);
    return stats;
  }

  // 2. Determine "since" timestamp (company-level if available, else user-level)
  const since = target.companyLastSyncAt || target.userLastSyncAt;
  if (!since) {
    stats.errors.push(`${target.name}: No previous sync timestamp`);
    return stats;
  }

  const client = new TokkoClient(apiKey);
  let needsPhotoMigration = false;
  let timedOut = false;

  try {
    // ── Step A: Fetch & process active property changes ──
    let offset = 0;
    const limit = 100;

    while (true) {
      if (!timeGuard.hasTime()) { timedOut = true; break; }

      console.log(`[Incremental Sync] ${target.name}: fetching active changes (offset: ${offset}, since: ${since})`);
      const response = await client.fetchChangedProperties(since, offset, limit);

      for (const tkkProp of response.objects) {
        if (!timeGuard.hasTime()) { timedOut = true; break; }

        try {
          const typeMatch = SYNC_PROPERTY_TYPES.includes(tkkProp.type?.id);

          if (typeMatch) {
            const result = await syncSingleProperty(target.userId, target.companyId, tkkProp, cache);
            if (result) {
              const photoDiff = await diffAndSyncPhotos(result.propertyId, tkkProp.photos);
              stats.photosAdded += photoDiff.added;
              stats.photosRemoved += photoDiff.removed;
              stats.propertiesUpdated++;
              if (photoDiff.added > 0) needsPhotoMigration = true;
            }
          } else {
            // Property type changed to excluded type -> soft-delete if it exists in our DB
            const { data: existing } = await supabaseAdmin
              .from('properties')
              .select('id, status')
              .eq('tokko_id', tkkProp.id)
              .eq('user_id', target.userId)
              .maybeSingle();

            if (existing && existing.status !== 0) {
              await supabaseAdmin
                .from('properties')
                .update({ status: 0, deleted_at: new Date().toISOString() })
                .eq('id', existing.id);
              stats.propertiesDeleted++;
            }
          }
        } catch (error) {
          const msg = `${target.name} property ${tkkProp.id}: ${error instanceof Error ? error.message : 'Unknown'}`;
          stats.errors.push(msg);
          console.error(`[Incremental Sync] ${msg}`);
        }
      }

      if (timedOut) break;
      if (!response.meta.next || offset + limit >= response.meta.total_count) break;
      offset += limit;
    }

    // ── Step B: Fetch & process deactivated properties ──
    if (!timedOut) {
      offset = 0;

      while (true) {
        if (!timeGuard.hasTime()) { timedOut = true; break; }

        console.log(`[Incremental Sync] ${target.name}: fetching inactive properties (offset: ${offset}, since: ${since})`);
        const response = await client.fetchInactiveProperties(since, offset, limit);

        for (const inactive of response.objects) {
          try {
            const { data: existing } = await supabaseAdmin
              .from('properties')
              .select('id, status')
              .eq('tokko_id', inactive.id)
              .eq('user_id', target.userId)
              .maybeSingle();

            if (existing && existing.status !== 0) {
              await supabaseAdmin
                .from('properties')
                .update({ status: 0, deleted_at: new Date().toISOString() })
                .eq('id', existing.id);
              stats.propertiesDeleted++;
            }
          } catch (error) {
            stats.errors.push(`${target.name} inactive ${inactive.id}: ${error instanceof Error ? error.message : 'Unknown'}`);
          }
        }

        if (!response.meta.next || offset + limit >= response.meta.total_count) break;
        offset += limit;
      }
    }

    // ── Step C: Trigger photo migration if new photos were added ──
    if (needsPhotoMigration) {
      triggerPhotoMigration(target.userId);
    }

    // Mark completed — timestamp updates are batched by the caller
    stats.completed = !timedOut;

    console.log(`[Incremental Sync] ${target.name}: ${stats.propertiesUpdated} updated, ${stats.propertiesDeleted} deleted, +${stats.photosAdded}/-${stats.photosRemoved} photos${timedOut ? ' (timed out)' : ''}`);
  } catch (error) {
    stats.errors.push(`${target.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(`[Incremental Sync] ${target.name} failed:`, error);
    // Don't update timestamp — retry next run
  }

  return stats;
}

// ============================================================
// Single Property Sync
// ============================================================

/**
 * Upsert a single property from Tokko data.
 * Handles: reference data, location resolution, property upsert, operations, tags.
 * Returns the property's DB ID, or null if skipped (unknown location).
 */
async function syncSingleProperty(
  userId: string,
  companyId: number | null,
  tkkProp: TokkoProperty,
  cache?: SyncCache,
): Promise<{ propertyId: number } | null> {

  // ── Step 0: Resolve location FIRST (skip early if unknown) ──
  let locationId: number | null = null;
  let parentDivisionLocationId: number | null = null;

  if (tkkProp.location?.id) {
    const locId = tkkProp.location.id;

    if (cache && cache.locations.has(locId)) {
      if (!cache.locations.get(locId)) return null; // Known missing location
      locationId = locId;
    } else {
      const { data: loc } = await supabaseAdmin
        .from('tokko_location')
        .select('id')
        .eq('id', locId)
        .maybeSingle();

      cache?.locations.set(locId, !!loc);
      if (!loc) return null;
      locationId = loc.id;
    }

    // Parse parent_division URL: "/location/12345/"
    if (tkkProp.location.parent_division) {
      const match = tkkProp.location.parent_division.match(/\/location\/(\d+)\//);
      if (match) {
        const parentId = parseInt(match[1], 10);

        if (cache && cache.locations.has(parentId)) {
          if (cache.locations.get(parentId)) parentDivisionLocationId = parentId;
        } else {
          const { data: parentLoc } = await supabaseAdmin
            .from('tokko_location')
            .select('id')
            .eq('id', parentId)
            .maybeSingle();
          cache?.locations.set(parentId, !!parentLoc);
          if (parentLoc) parentDivisionLocationId = parentLoc.id;
        }
      }
    }
  }

  // ── Step 1: Upsert reference data (cached — skip if already seen) ──
  if (tkkProp.type?.id && !cache?.propertyTypes.has(tkkProp.type.id)) {
    await supabaseAdmin
      .from('tokko_property_type')
      .upsert(
        { id: tkkProp.type.id, code: tkkProp.type.code, name: tkkProp.type.name },
        { onConflict: 'id', ignoreDuplicates: true },
      );
    cache?.propertyTypes.add(tkkProp.type.id);
  }

  if (tkkProp.tags?.length) {
    const newTags = cache
      ? tkkProp.tags.filter(t => !cache.tags.has(t.id))
      : tkkProp.tags;

    if (newTags.length > 0) {
      await supabaseAdmin
        .from('tokko_property_tag')
        .upsert(
          newTags.map(tag => ({ id: tag.id, name: tag.name, type: tag.type })),
          { onConflict: 'id' },
        );
      for (const tag of newTags) cache?.tags.add(tag.id);
    }
  }

  if (tkkProp.operations?.length) {
    const uniqueOpTypes = [
      ...new Map(
        tkkProp.operations.map(op => [op.operation_id, { id: op.operation_id, name: op.operation_type }])
      ).values(),
    ].filter(op => !cache?.operationTypes.has(op.id));

    if (uniqueOpTypes.length > 0) {
      await supabaseAdmin
        .from('tokko_operation_type')
        .upsert(uniqueOpTypes, { onConflict: 'id' });
      for (const op of uniqueOpTypes) cache?.operationTypes.add(op.id);
    }
  }

  // ── Step 2: Upsert property ──
  const propertyRow = {
    tokko_id: tkkProp.id,
    tokko: true,
    user_id: userId,
    company_id: companyId,
    location_id: locationId,
    parent_division_location_id: parentDivisionLocationId,
    type_id: tkkProp.type?.id ?? null,
    address: tkkProp.address ?? null,
    address_complement: tkkProp.address_complement ?? null,
    real_address: tkkProp.real_address ?? null,
    fake_address: tkkProp.fake_address ?? null,
    geo_lat: tkkProp.geo_lat ?? null,
    geo_long: tkkProp.geo_long ?? null,
    gm_location_type: tkkProp.gm_location_type ?? null,
    block_number: tkkProp.block_number ?? null,
    lot_number: tkkProp.lot_number ?? null,
    floor: tkkProp.floor ?? null,
    apartment_door: tkkProp.apartment_door ?? null,
    age: tkkProp.age ?? null,
    room_amount: tkkProp.room_amount ?? null,
    bathroom_amount: tkkProp.bathroom_amount ?? null,
    toilet_amount: tkkProp.toilet_amount ?? null,
    suite_amount: tkkProp.suite_amount ?? null,
    total_suites: tkkProp.total_suites ?? null,
    suites_with_closets: tkkProp.suites_with_closets ?? null,
    roofed_surface: tkkProp.roofed_surface ?? null,
    semiroofed_surface: tkkProp.semiroofed_surface ?? null,
    unroofed_surface: tkkProp.unroofed_surface ?? null,
    total_surface: tkkProp.total_surface ?? null,
    surface: tkkProp.surface ?? null,
    surface_measurement: tkkProp.surface_measurement ?? null,
    livable_area: tkkProp.livable_area ?? null,
    floors_amount: tkkProp.floors_amount ?? null,
    front_measure: tkkProp.front_measure ?? null,
    depth_measure: tkkProp.depth_measure ?? null,
    private_area: tkkProp.private_area ?? null,
    common_area: tkkProp.common_area ?? null,
    parking_lot_amount: tkkProp.parking_lot_amount ?? null,
    covered_parking_lot: tkkProp.covered_parking_lot ?? null,
    uncovered_parking_lot: tkkProp.uncovered_parking_lot ?? null,
    parking_lot_condition: tkkProp.parking_lot_condition != null ? String(tkkProp.parking_lot_condition) : null,
    parking_lot_type: tkkProp.parking_lot_type != null ? String(tkkProp.parking_lot_type) : null,
    status: tkkProp.status,
    situation: tkkProp.situation ?? null,
    is_denounced: tkkProp.is_denounced ?? false,
    is_starred_on_web: tkkProp.is_starred_on_web ?? false,
    quality_level: tkkProp.quality_level != null ? String(tkkProp.quality_level) : null,
    location_level: tkkProp.location_level != null ? String(tkkProp.location_level) : null,
    property_condition: tkkProp.property_condition ?? null,
    legally_checked: tkkProp.legally_checked ?? null,
    disposition: tkkProp.disposition ?? null,
    orientation: tkkProp.orientation ?? null,
    dining_room: tkkProp.dining_room ?? null,
    living_amount: tkkProp.living_amount ?? null,
    tv_rooms: tkkProp.tv_rooms ?? null,
    guests_amount: tkkProp.guests_amount ?? null,
    appartments_per_floor: tkkProp.appartments_per_floor ?? null,
    building: tkkProp.building ?? null,
    publication_title: tkkProp.publication_title ?? null,
    public_url: tkkProp.public_url ?? null,
    seo_description: tkkProp.seo_description ?? null,
    seo_keywords: tkkProp.seo_keywords ?? null,
    portal_footer: tkkProp.portal_footer ?? null,
    rich_description: tkkProp.rich_description ?? null,
    description: tkkProp.description ?? null,
    web_price: tkkProp.web_price ?? false,
    reference_code: tkkProp.reference_code ?? null,
    zonification: tkkProp.zonification ?? null,
    extra_attributes: Array.isArray(tkkProp.extra_attributes) ? tkkProp.extra_attributes : null,
    custom_tags: Array.isArray(tkkProp.custom_tags) ? tkkProp.custom_tags : null,
    internal_data: tkkProp.internal_data && typeof tkkProp.internal_data === 'object' ? tkkProp.internal_data : null,
    development: tkkProp.development != null ? tkkProp.development : null,
    occupation: Array.isArray(tkkProp.occupation) ? tkkProp.occupation : null,
    files: Array.isArray(tkkProp.files) ? tkkProp.files : null,
    videos: Array.isArray(tkkProp.videos) ? tkkProp.videos : null,
    contact_phone: getContactPhone(tkkProp),
    created_at: tkkProp.created_at || new Date().toISOString(),
    deleted_at: null, // Active property — always clear soft-delete marker
    updated_at: tkkProp.updated_at || null,
  };

  const { data: upserted, error: upsertError } = await supabaseAdmin
    .from('properties')
    .upsert(propertyRow, { onConflict: 'tokko_id,user_id' })
    .select('id')
    .single();

  if (upsertError) {
    throw new Error(`Property upsert failed: ${upsertError.message}`);
  }

  const propertyId = upserted.id;

  // ── Step 3: Sync operations ──
  await syncOperations(propertyId, tkkProp);

  // ── Step 4: Sync tags ──
  if (tkkProp.tags?.length) {
    const tagLinks = tkkProp.tags.map(tag => ({
      property_id: propertyId,
      tag_id: tag.id,
    }));
    await supabaseAdmin
      .from('tokko_property_property_tag')
      .upsert(tagLinks, { onConflict: 'property_id,tag_id', ignoreDuplicates: true });
  }

  return { propertyId };
}

/**
 * Sync operations for a property, matching the batch RPC behavior.
 * Preserves user-set fields (planMobElegido, ipc_adjustment, min_start_date).
 */
async function syncOperations(propertyId: number, tkkProp: TokkoProperty): Promise<void> {
  // Preserve user-set fields from existing available operation
  const { data: existingOp } = await supabaseAdmin
    .from('operaciones')
    .select('planMobElegido, ipc_adjustment, min_start_date')
    .eq('property_id', propertyId)
    .eq('status', 'available')
    .limit(1)
    .maybeSingle();

  const preservedPlan = existingOp?.planMobElegido ?? 'basico';
  const preservedIpc = existingOp?.ipc_adjustment ?? null;
  const preservedMinStartDate = existingOp?.min_start_date ?? null;

  // Delete existing available operations (preserves rented/finished ops)
  await supabaseAdmin
    .from('operaciones')
    .delete()
    .eq('property_id', propertyId)
    .eq('status', 'available');

  // Common property-level fields stored on operations
  const baseFields = {
    property_id: propertyId,
    status: 'available' as const,
    expenses: tkkProp.expenses ?? null,
    cleaning_tax: parseNumericField(tkkProp.cleaning_tax),
    fire_insurance_cost: parseNumericField(tkkProp.fire_insurance_cost),
    down_payment: parseNumericField(tkkProp.down_payment),
    custom1: tkkProp.custom1 ?? null,
    credit_eligible: tkkProp.credit_eligible ?? null,
    iptu: tkkProp.iptu ?? null,
    planMobElegido: preservedPlan,
    ipc_adjustment: preservedIpc,
    min_start_date: preservedMinStartDate,
  };

  // Filter to rent operations (operation_id = 2)
  const rentOps = (tkkProp.operations ?? []).filter(op => op.operation_id === RENT_OPERATION_ID);

  if (rentOps.length > 0) {
    for (const op of rentOps) {
      const primaryPrice = op.prices?.[0];
      const secondaryPrice = op.prices?.[1];

      await supabaseAdmin.from('operaciones').insert({
        ...baseFields,
        tokko_operation_id: op.operation_id,
        currency: primaryPrice?.currency ?? null,
        price: primaryPrice?.price ?? null,
        period: primaryPrice?.period != null ? String(primaryPrice.period) : '0',
        is_promotional: primaryPrice?.is_promotional ?? false,
        secondary_currency: secondaryPrice?.currency ?? null,
        secondary_price: secondaryPrice?.price ?? null,
      });
    }
  } else {
    // No rent operations — insert bare row (matches batch RPC behavior)
    await supabaseAdmin.from('operaciones').insert(baseFields);
  }
}
