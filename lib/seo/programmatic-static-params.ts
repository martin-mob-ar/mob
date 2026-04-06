import { supabaseAdmin } from "@/lib/supabase/server";
import { PROPERTY_TYPES, type PropertyTypeSlug } from "./programmatic-constants";

/**
 * Generate { state, location } tuples for a given property type and/or room count.
 * Only returns combos with 2+ verified properties to avoid thin pages.
 */
export async function buildStaticParamsForFilter(options: {
  propertyTypeSlug?: PropertyTypeSlug;
  roomCount?: number;
}): Promise<{ state: string; location: string }[]> {
  const { propertyTypeSlug, roomCount } = options;

  // Build base query for properties matching the filter
  let query = supabaseAdmin
    .from("properties_read")
    .select("location_id, property_type_id")
    .eq("owner_verified", true);

  if (propertyTypeSlug) {
    const typeName = PROPERTY_TYPES[propertyTypeSlug].dbName;
    // Get the property type ID
    const { data: typeData } = await supabaseAdmin
      .from("tokko_property_type")
      .select("id")
      .eq("slug", propertyTypeSlug)
      .single();
    if (typeData) {
      query = query.eq("property_type_id", typeData.id);
    }
  }

  if (roomCount !== undefined) {
    query = query.eq("room_amount", roomCount);
  }

  const { data: props } = await query;
  if (!props || props.length === 0) return [];

  // Count per location — only include locations with 2+ properties
  const locationCounts = new Map<number, number>();
  for (const p of props) {
    if (p.location_id) {
      locationCounts.set(p.location_id, (locationCounts.get(p.location_id) || 0) + 1);
    }
  }
  const qualifyingLocationIds = [...locationCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([id]) => id);

  if (qualifyingLocationIds.length === 0) return [];

  const { data: locations } = await supabaseAdmin
    .from("tokko_location")
    .select("slug, tokko_state!state_id(slug)")
    .in("id", qualifyingLocationIds);

  if (!locations) return [];

  return locations
    .filter((l: any) => l.slug && l.tokko_state?.slug)
    .map((l: any) => ({
      state: l.tokko_state.slug as string,
      location: l.slug as string,
    }));
}

/**
 * Generate { state } params for a given property type and/or room count.
 */
export async function buildStateParamsForFilter(options: {
  propertyTypeSlug?: PropertyTypeSlug;
  roomCount?: number;
}): Promise<{ state: string }[]> {
  const locationParams = await buildStaticParamsForFilter(options);
  const uniqueStates = [...new Set(locationParams.map((p) => p.state))];
  return uniqueStates.map((state) => ({ state }));
}
