/**
 * Match Google Maps place data to our geotree (tokko_location).
 * Run server-side only (uses Supabase).
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import type { PlaceAddressComponents, RawAddressComponent } from './places';

export interface MatchLocationInput {
  addressComponents: PlaceAddressComponents;
  lat: number;
  lng: number;
  rawAddressComponents?: RawAddressComponent[];
}

export type LevelMatchStatus = 'exact' | 'fuzzy' | 'none';

export interface LevelMatch {
  id: number;
  name: string;
  status: LevelMatchStatus;
}

export interface MatchResult {
  country: LevelMatch | null;
  state: LevelMatch | null;
  location: LevelMatch | null;
  /** Auto-matched depth 4 (from remaining Google data after depth 3 match) */
  locationDepth4: LevelMatch | null;
  /** Auto-matched depth 5 (from remaining Google data after depth 4 match) */
  locationDepth5: LevelMatch | null;
  /** Deepest auto-matched location id for setting location_id */
  deepestLocationId: number | null;
  /** Raw Google data passed through for debug display */
  googleData: PlaceAddressComponents;
  /** Full raw address_components from Google */
  rawAddressComponents: RawAddressComponent[] | null;
}

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

// --- Buenos Aires special-case resolution ---
// Google returns "Ciudad Autónoma de Buenos Aires" for CABA
// and "Provincia de Buenos Aires" (or "Buenos Aires") for the province.
// Our DB splits Buenos Aires province into zones: Norte, Oeste, Sur, Costa Atlantica, Interior.

const ARGENTINA_COUNTRY_ID = 1;
const CAPITAL_FEDERAL_STATE_ID = 146;
const INTERIOR_BUENOS_AIRES_STATE_ID = 151;

const BUENOS_AIRES_ZONES: { stateId: number; lonMin: number; lonMax: number; latMin: number; latMax: number }[] = [
  // G.B.A. Zona Norte
  { stateId: 147, lonMin: -58.95, lonMax: -58.35, latMin: -34.55, latMax: -34.25 },
  // G.B.A. Zona Oeste
  { stateId: 148, lonMin: -58.95, lonMax: -58.53, latMin: -34.80, latMax: -34.55 },
  // G.B.A. Zona Sur
  { stateId: 149, lonMin: -58.53, lonMax: -58.10, latMin: -34.90, latMax: -34.60 },
  // Costa Atlantica
  { stateId: 150, lonMin: -58.00, lonMax: -56.50, latMin: -38.50, latMax: -36.50 },
];

function isCabaFromGoogle(stateName: string): boolean {
  const n = normalizeName(stateName);
  return n.includes('ciudad autonoma') || n === 'caba';
}

function isBuenosAiresProvinceFromGoogle(stateName: string): boolean {
  const n = normalizeName(stateName);
  // "Provincia de Buenos Aires" or just "Buenos Aires" but NOT "Ciudad Autónoma de Buenos Aires"
  return (n.includes('buenos aires') && !n.includes('ciudad autonoma') && !n.includes('caba'));
}

function resolveBonaerenseZone(lat: number, lng: number): number {
  for (const zone of BUENOS_AIRES_ZONES) {
    if (lng >= zone.lonMin && lng <= zone.lonMax && lat >= zone.latMin && lat <= zone.latMax) {
      return zone.stateId;
    }
  }
  return INTERIOR_BUENOS_AIRES_STATE_ID;
}

export async function matchLocation(input: MatchLocationInput): Promise<MatchResult> {
  const { addressComponents, lat, lng, rawAddressComponents } = input;

  const result: MatchResult = {
    country: null,
    state: null,
    location: null,
    locationDepth4: null,
    locationDepth5: null,
    deepestLocationId: null,
    googleData: addressComponents,
    rawAddressComponents: rawAddressComponents ?? null,
  };

  const countryName = addressComponents.country;
  if (!countryName) return result;

  // --- Country ---
  if (addressComponents.countryCode) {
    const { data } = await supabaseAdmin
      .from('tokko_country')
      .select('id, name')
      .eq('iso_code', addressComponents.countryCode.toUpperCase())
      .limit(1)
      .maybeSingle();

    if (data) {
      result.country = { id: data.id, name: data.name, status: 'exact' };
    }
  }

  if (!result.country) {
    const normalized = normalizeName(countryName);
    const { data: countries } = await supabaseAdmin
      .from('tokko_country')
      .select('id, name');

    if (countries) {
      const exact = countries.find((c) => normalizeName(c.name) === normalized);
      if (exact) {
        result.country = { id: exact.id, name: exact.name, status: 'exact' };
      } else {
        const fuzzy = countries.find((c) => {
          const n = normalizeName(c.name);
          return n.includes(normalized) || normalized.includes(n);
        });
        if (fuzzy) {
          result.country = { id: fuzzy.id, name: fuzzy.name, status: 'fuzzy' };
        }
      }
    }
  }

  if (!result.country) return result;

  // --- State ---
  const stateName = addressComponents.administrativeAreaLevel1;
  if (!stateName) return result;

  // Special case: Argentina + Buenos Aires
  if (result.country.id === ARGENTINA_COUNTRY_ID) {
    if (isCabaFromGoogle(stateName)) {
      // "Ciudad Autónoma de Buenos Aires" → Capital Federal
      const { data: capitalFederal } = await supabaseAdmin
        .from('tokko_state')
        .select('id, name')
        .eq('id', CAPITAL_FEDERAL_STATE_ID)
        .maybeSingle();

      if (capitalFederal) {
        result.state = { id: capitalFederal.id, name: capitalFederal.name, status: 'exact' };
      }
    } else if (isBuenosAiresProvinceFromGoogle(stateName)) {
      // "Provincia de Buenos Aires" → resolve by coordinates
      const zoneStateId = resolveBonaerenseZone(lat, lng);
      const { data: zone } = await supabaseAdmin
        .from('tokko_state')
        .select('id, name')
        .eq('id', zoneStateId)
        .maybeSingle();

      if (zone) {
        result.state = { id: zone.id, name: zone.name, status: 'exact' };
      }
    }
  }

  // Generic state matching (for non-Buenos-Aires or non-Argentina)
  if (!result.state) {
    const normalized = normalizeName(stateName);
    const { data: states } = await supabaseAdmin
      .from('tokko_state')
      .select('id, name')
      .eq('country_id', result.country.id);

    if (states) {
      const exact = states.find((s) => normalizeName(s.name) === normalized);
      if (exact) {
        result.state = { id: exact.id, name: exact.name, status: 'exact' };
      } else {
        const fuzzy = states.find((s) => {
          const n = normalizeName(s.name);
          return n.includes(normalized) || normalized.includes(n);
        });
        if (fuzzy) {
          result.state = { id: fuzzy.id, name: fuzzy.name, status: 'fuzzy' };
        }
      }
    }
  }

  if (!result.state) return result;

  // --- Location (depth 3) ---
  // Top-down: administrativeAreaLevel2 (partido) is HIGHER than locality (city)
  // in Google's hierarchy. For CABA, sublocality_level_1 is the barrio = depth 3.
  // Order: highest geographic level first.
  const allCandidates = [
    addressComponents.administrativeAreaLevel2,
    addressComponents.locality,
    addressComponents.sublocalityLevel1,
    addressComponents.sublocality,
    addressComponents.neighborhood,
  ];

  const validCandidates = allCandidates
    .map((value, index) => ({ value, index }))
    .filter((c): c is { value: string; index: number } => !!c.value);

  if (validCandidates.length === 0) return result;

  // Search within state first
  const { data: locations } = await supabaseAdmin
    .from('tokko_location')
    .select('id, name')
    .eq('state_id', result.state.id)
    .eq('depth', 3);

  let matchedCandidateIndex = -1;

  if (locations && locations.length > 0) {
    // Exact pass — try each candidate in priority order
    for (const { value, index } of validCandidates) {
      const normalized = normalizeName(value);
      const exact = locations.find((l) => normalizeName(l.name) === normalized);
      if (exact) {
        result.location = { id: exact.id, name: exact.name, status: 'exact' };
        matchedCandidateIndex = index;
        break;
      }
    }

    // Fuzzy pass if no exact match
    if (!result.location) {
      for (const { value, index } of validCandidates) {
        const normalized = normalizeName(value);
        const fuzzy = locations.find((l) => {
          const n = normalizeName(l.name);
          return n.length >= 2 && (n.includes(normalized) || normalized.includes(n));
        });
        if (fuzzy) {
          result.location = { id: fuzzy.id, name: fuzzy.name, status: 'fuzzy' };
          matchedCandidateIndex = index;
          break;
        }
      }
    }
  }

  // Fallback: search entire country if no state-level match
  if (!result.location) {
    const { data: countryLocations } = await supabaseAdmin
      .from('tokko_location')
      .select('id, name')
      .eq('country_id', result.country.id)
      .eq('depth', 3);

    if (countryLocations && countryLocations.length > 0) {
      for (const { value, index } of validCandidates) {
        const normalized = normalizeName(value);
        const exact = countryLocations.find((l) => normalizeName(l.name) === normalized);
        if (exact) {
          result.location = { id: exact.id, name: exact.name, status: 'exact' };
          matchedCandidateIndex = index;
          break;
        }
      }

      if (!result.location) {
        for (const { value, index } of validCandidates) {
          const normalized = normalizeName(value);
          const fuzzy = countryLocations.find((l) => {
            const n = normalizeName(l.name);
            return n.length >= 2 && (n.includes(normalized) || normalized.includes(n));
          });
          if (fuzzy) {
            result.location = { id: fuzzy.id, name: fuzzy.name, status: 'fuzzy' };
            matchedCandidateIndex = index;
            break;
          }
        }
      }
    }
  }

  // --- Depth 4: auto-match using REMAINING candidates (lower in hierarchy than depth 3) ---
  if (result.location) {
    const remainingForDepth4 = validCandidates
      .filter((c) => c.index > matchedCandidateIndex)
      .map((c) => c.value);

    if (remainingForDepth4.length > 0) {
      const { data: children4 } = await supabaseAdmin
        .from('tokko_location')
        .select('id, name')
        .eq('parent_location_id', result.location.id);

      if (children4 && children4.length > 0) {
        let depth4MatchedIndex = -1;

        // Exact pass
        for (let i = 0; i < remainingForDepth4.length; i++) {
          const normalized = normalizeName(remainingForDepth4[i]);
          const exact = children4.find((l) => normalizeName(l.name) === normalized);
          if (exact) {
            result.locationDepth4 = { id: exact.id, name: exact.name, status: 'exact' };
            depth4MatchedIndex = i;
            break;
          }
        }

        // Fuzzy pass
        if (!result.locationDepth4) {
          for (let i = 0; i < remainingForDepth4.length; i++) {
            const normalized = normalizeName(remainingForDepth4[i]);
            const fuzzy = children4.find((l) => {
              const n = normalizeName(l.name);
              return n.length >= 2 && (n.includes(normalized) || normalized.includes(n));
            });
            if (fuzzy) {
              result.locationDepth4 = { id: fuzzy.id, name: fuzzy.name, status: 'fuzzy' };
              depth4MatchedIndex = i;
              break;
            }
          }
        }

        // --- Depth 5: auto-match using candidates remaining after depth 4 ---
        if (result.locationDepth4) {
          const remainingForDepth5 = remainingForDepth4.slice(depth4MatchedIndex + 1);

          if (remainingForDepth5.length > 0) {
            const { data: children5 } = await supabaseAdmin
              .from('tokko_location')
              .select('id, name')
              .eq('parent_location_id', result.locationDepth4.id);

            if (children5 && children5.length > 0) {
              for (const candidate of remainingForDepth5) {
                const normalized = normalizeName(candidate);
                const exact = children5.find((l) => normalizeName(l.name) === normalized);
                if (exact) {
                  result.locationDepth5 = { id: exact.id, name: exact.name, status: 'exact' };
                  break;
                }
              }

              if (!result.locationDepth5) {
                for (const candidate of remainingForDepth5) {
                  const normalized = normalizeName(candidate);
                  const fuzzy = children5.find((l) => {
                    const n = normalizeName(l.name);
                    return n.length >= 2 && (n.includes(normalized) || normalized.includes(n));
                  });
                  if (fuzzy) {
                    result.locationDepth5 = { id: fuzzy.id, name: fuzzy.name, status: 'fuzzy' };
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  result.deepestLocationId =
    result.locationDepth5?.id ??
    result.locationDepth4?.id ??
    result.location?.id ??
    null;

  return result;
}
