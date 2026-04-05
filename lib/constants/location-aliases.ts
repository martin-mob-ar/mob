/**
 * Search aliases for location search.
 * Maps common abbreviations and informal names to pre-built search results.
 *
 * Keys are normalized: lowercase, accent-stripped, dots removed, whitespace collapsed.
 * Lookup uses exact match on the full normalized query.
 */

export interface AliasResult {
  id: number;
  name: string;
  depth: number;
  display: string;
  type: "location" | "state";
  slug: string | null;
  stateSlug: string | null;
}

export interface AliasEntry {
  results: AliasResult[];
}

export const LOCATION_ALIASES: Record<string, AliasEntry> = {
  // --- City abbreviations → Capital Federal (state 146) ---
  caba: {
    results: [{ id: 146, name: "Capital Federal", depth: 0, display: "Argentina", type: "state", slug: "capital-federal", stateSlug: "capital-federal" }],
  },

  "buenos aires": {
    results: [
      { id: 146, name: "Capital Federal", depth: 0, display: "Argentina", type: "state", slug: "capital-federal", stateSlug: "capital-federal" },
      { id: 147, name: "G.B.A. Zona Norte", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-norte", stateSlug: "g-b-a-zona-norte" },
      { id: 148, name: "G.B.A. Zona Oeste", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-oeste", stateSlug: "g-b-a-zona-oeste" },
      { id: 149, name: "G.B.A. Zona Sur", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-sur", stateSlug: "g-b-a-zona-sur" },
      { id: 151, name: "Interior Buenos Aires", depth: 0, display: "Argentina", type: "state", slug: "interior-buenos-aires", stateSlug: "interior-buenos-aires" },
    ],
  },
  "bs as": {
    results: [
      { id: 146, name: "Capital Federal", depth: 0, display: "Argentina", type: "state", slug: "capital-federal", stateSlug: "capital-federal" },
      { id: 147, name: "G.B.A. Zona Norte", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-norte", stateSlug: "g-b-a-zona-norte" },
      { id: 148, name: "G.B.A. Zona Oeste", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-oeste", stateSlug: "g-b-a-zona-oeste" },
      { id: 149, name: "G.B.A. Zona Sur", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-sur", stateSlug: "g-b-a-zona-sur" },
      { id: 151, name: "Interior Buenos Aires", depth: 0, display: "Argentina", type: "state", slug: "interior-buenos-aires", stateSlug: "interior-buenos-aires" },
    ],
  },
  bsas: {
    results: [
      { id: 146, name: "Capital Federal", depth: 0, display: "Argentina", type: "state", slug: "capital-federal", stateSlug: "capital-federal" },
      { id: 147, name: "G.B.A. Zona Norte", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-norte", stateSlug: "g-b-a-zona-norte" },
      { id: 148, name: "G.B.A. Zona Oeste", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-oeste", stateSlug: "g-b-a-zona-oeste" },
      { id: 149, name: "G.B.A. Zona Sur", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-sur", stateSlug: "g-b-a-zona-sur" },
      { id: 151, name: "Interior Buenos Aires", depth: 0, display: "Argentina", type: "state", slug: "interior-buenos-aires", stateSlug: "interior-buenos-aires" },
    ],
  },

  // --- GBA zone abbreviations ---
  gba: {
    results: [
      { id: 147, name: "G.B.A. Zona Norte", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-norte", stateSlug: "g-b-a-zona-norte" },
      { id: 148, name: "G.B.A. Zona Oeste", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-oeste", stateSlug: "g-b-a-zona-oeste" },
      { id: 149, name: "G.B.A. Zona Sur", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-sur", stateSlug: "g-b-a-zona-sur" },
    ],
  },
  "gran buenos aires": {
    results: [
      { id: 147, name: "G.B.A. Zona Norte", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-norte", stateSlug: "g-b-a-zona-norte" },
      { id: 148, name: "G.B.A. Zona Oeste", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-oeste", stateSlug: "g-b-a-zona-oeste" },
      { id: 149, name: "G.B.A. Zona Sur", depth: 0, display: "Argentina", type: "state", slug: "g-b-a-zona-sur", stateSlug: "g-b-a-zona-sur" },
    ],
  },

  // --- Common city abbreviations ---
  mdp: {
    results: [{ id: 26624, name: "Mar Del Plata", depth: 3, display: "Costa Atlantica, Argentina", type: "location", slug: "mar-del-plata", stateSlug: "costa-atlantica" }],
  },
  mdq: {
    results: [{ id: 26624, name: "Mar Del Plata", depth: 3, display: "Costa Atlantica, Argentina", type: "location", slug: "mar-del-plata", stateSlug: "costa-atlantica" }],
  },
  cba: {
    results: [{ id: 30864, name: "Cordoba Capital", depth: 3, display: "Cordoba, Argentina", type: "location", slug: "cordoba-capital", stateSlug: "cordoba" }],
  },
  lp: {
    results: [{ id: 26499, name: "La Plata", depth: 3, display: "G.B.A. Zona Sur, Argentina", type: "location", slug: "la-plata", stateSlug: "g-b-a-zona-sur" }],
  },

  // --- Informal names (DB name is different) ---
  "la boca": {
    results: [{ id: 24688, name: "Boca", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "boca", stateSlug: "capital-federal" }],
  },
  "pto madero": {
    results: [{ id: 24701, name: "Puerto Madero", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "puerto-madero", stateSlug: "capital-federal" }],
  },
  lomas: {
    results: [{ id: 26553, name: "Lomas De Zamora (Partido)", depth: 3, display: "G.B.A. Zona Sur, Argentina", type: "location", slug: "lomas-de-zamora-partido", stateSlug: "g-b-a-zona-sur" }],
  },

  // --- Villa abbreviations (dots break token matching) ---
  "v crespo": {
    results: [{ id: 24740, name: "Villa Crespo", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "villa-crespo", stateSlug: "capital-federal" }],
  },
  "v urquiza": {
    results: [{ id: 24753, name: "Villa Urquiza", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "villa-urquiza", stateSlug: "capital-federal" }],
  },
  "v devoto": {
    results: [{ id: 24741, name: "Villa Devoto", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "villa-devoto", stateSlug: "capital-federal" }],
  },
  "v del parque": {
    results: [{ id: 24747, name: "Villa del Parque", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "villa-del-parque", stateSlug: "capital-federal" }],
  },
  "v luro": {
    results: [{ id: 24745, name: "Villa Luro", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "villa-luro", stateSlug: "capital-federal" }],
  },
  "v lugano": {
    results: [{ id: 24744, name: "Villa Lugano", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "villa-lugano", stateSlug: "capital-federal" }],
  },
  "v pueyrredon": {
    results: [{ id: 24749, name: "Villa Pueyrredon", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "villa-pueyrredon", stateSlug: "capital-federal" }],
  },
  "v ortuzar": {
    results: [{ id: 24746, name: "Villa Ortuzar", depth: 3, display: "Capital Federal, Argentina", type: "location", slug: "villa-ortuzar", stateSlug: "capital-federal" }],
  },
};

/**
 * Normalize a query for alias lookup.
 * Strips accents, dots, collapses whitespace, lowercases.
 */
export function normalizeForAlias(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}
