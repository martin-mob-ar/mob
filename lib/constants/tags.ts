/**
 * Shared tag constants mapped to `tokko_property_tag` IDs in the database.
 * Used by both MoreFiltersPanel (search) and SubirPropiedad (creation).
 *
 * These are hardcoded — no DB read needed to render the UI.
 * Only tags that exist (or have a close match) in tokko_property_tag are included.
 */

export interface TagOption {
  id: number;
  label: string;
}

export interface TagSection {
  title: string;
  tags: TagOption[];
}

export const TAG_SECTIONS: TagSection[] = [
  {
    title: "Amenities del edificio",
    tags: [
      { id: 33, label: "Gimnasio" },
      { id: 1594, label: "Zonas Verdes" },
      { id: 1509, label: "Juegos para niños" },
      { id: 35, label: "Parrilla" },
      { id: 1547, label: "Ascensor" },
      { id: 20, label: "Lavadero" },
      { id: 51, label: "Pileta" },
      { id: 1524, label: "Seguridad 24hs" },
      { id: 41, label: "SUM" },
      { id: 39, label: "Sauna" },
      { id: 1800, label: "Cowork" },
    ],
  },
  {
    title: "Ambientes especiales",
    tags: [
      { id: 20, label: "Lavadero" },
      { id: 15, label: "Dependencia" },
      { id: 163, label: "Escritorio" },
      { id: 23, label: "Patio" },
      { id: 10, label: "Balcón" },
      { id: 25, label: "Terraza" },
    ],
  },
];

/** Flat list of all unique tags (deduplicated by id) */
export const ALL_TAGS: TagOption[] = (() => {
  const seen = new Set<number>();
  const result: TagOption[] = [];
  for (const section of TAG_SECTIONS) {
    for (const tag of section.tags) {
      if (!seen.has(tag.id)) {
        seen.add(tag.id);
        result.push(tag);
      }
    }
  }
  return result;
})();

/** Get a tag label by its DB id */
export function getTagLabel(id: number): string | undefined {
  return ALL_TAGS.find((t) => t.id === id)?.label;
}
