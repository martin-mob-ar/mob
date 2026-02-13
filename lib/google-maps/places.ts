/**
 * Google Maps Places utilities.
 * Use with the Google Maps JS API loaded on the client (Places library).
 */

export interface PlaceAddressComponents {
  locality?: string;
  administrativeAreaLevel1?: string;
  administrativeAreaLevel2?: string;
  sublocality?: string;
  sublocalityLevel1?: string;
  sublocalityLevel2?: string;
  neighborhood?: string;
  country?: string;
  countryCode?: string;
  formattedAddress?: string;
}

export interface RawAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface PlaceGeometry {
  lat: number;
  lng: number;
}

export interface NormalizedPlaceResult {
  addressComponents: PlaceAddressComponents;
  geometry: PlaceGeometry;
  formattedAddress: string;
  placeId?: string;
  rawAddressComponents: RawAddressComponent[];
}

/**
 * Extract address components from Google Places Autocomplete or Place Details result.
 * Call from client after user selects a place.
 */
export function getAddressComponentsFromPlace(
  place: google.maps.places.PlaceResult
): PlaceAddressComponents {
  const components: PlaceAddressComponents = {};
  if (!place.address_components) return components;

  for (const c of place.address_components) {
    if (c.types.includes('locality')) components.locality = c.long_name;
    if (c.types.includes('administrative_area_level_1')) components.administrativeAreaLevel1 = c.long_name;
    if (c.types.includes('administrative_area_level_2')) components.administrativeAreaLevel2 = c.long_name;
    if (c.types.includes('sublocality')) components.sublocality = c.long_name;
    if (c.types.includes('sublocality_level_1')) components.sublocalityLevel1 = c.long_name;
    if (c.types.includes('sublocality_level_2')) components.sublocalityLevel2 = c.long_name;
    if (c.types.includes('neighborhood')) components.neighborhood = c.long_name;
    if (c.types.includes('country')) {
      components.country = c.long_name;
      components.countryCode = c.short_name;
    }
  }
  return components;
}

/**
 * Extract lat/lng from a Place result (from geometry.location).
 */
export function getGeometryFromPlace(place: google.maps.places.PlaceResult): PlaceGeometry | null {
  const loc = place.geometry?.location as google.maps.LatLng | undefined;
  if (!loc) return null;
  return {
    lat: typeof loc.lat === 'function' ? loc.lat() : (loc as unknown as { lat: number }).lat,
    lng: typeof loc.lng === 'function' ? loc.lng() : (loc as unknown as { lng: number }).lng,
  };
}

/**
 * Extract the raw address_components array from a Place result.
 */
export function getRawAddressComponents(
  place: google.maps.places.PlaceResult
): RawAddressComponent[] {
  return (place.address_components ?? []).map((c) => ({
    long_name: c.long_name,
    short_name: c.short_name,
    types: [...c.types],
  }));
}

/**
 * Reverse-geocode a lat/lng to get the richest possible address_components.
 * Google's reverse geocoder usually returns sublocality/neighborhood even when
 * the Autocomplete result doesn't.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ addressComponents: PlaceAddressComponents; rawAddressComponents: RawAddressComponent[] } | null> {
  if (typeof google === 'undefined') return null;
  const geocoder = new google.maps.Geocoder();
  try {
    const response = await geocoder.geocode({ location: { lat, lng } });
    // The first result is the most specific (street-level) and typically the richest
    const best = response.results[0];
    if (!best) return null;
    return {
      addressComponents: getAddressComponentsFromPlace(best as unknown as google.maps.places.PlaceResult),
      rawAddressComponents: (best.address_components ?? []).map((c) => ({
        long_name: c.long_name,
        short_name: c.short_name,
        types: [...c.types],
      })),
    };
  } catch (e) {
    console.warn('[reverseGeocode] failed:', e);
    return null;
  }
}

/**
 * Build a normalized result from a Place (for sending to location matcher API).
 */
export function normalizePlaceResult(place: google.maps.places.PlaceResult): NormalizedPlaceResult | null {
  const geometry = getGeometryFromPlace(place);
  if (!geometry) return null;
  const addressComponents = getAddressComponentsFromPlace(place);
  return {
    addressComponents,
    geometry,
    formattedAddress: place.formatted_address ?? place.vicinity ?? '',
    placeId: place.place_id,
    rawAddressComponents: getRawAddressComponents(place),
  };
}
