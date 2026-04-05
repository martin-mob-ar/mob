/** Property type slug → display name + DB name mapping */
export const PROPERTY_TYPES = {
  departamentos: { display: "Departamentos", dbName: "Departamento" },
  casas: { display: "Casas", dbName: "Casa" },
  ph: { display: "PH", dbName: "PH" },
} as const;

export type PropertyTypeSlug = keyof typeof PROPERTY_TYPES;

export const PROPERTY_TYPE_SLUGS = Object.keys(PROPERTY_TYPES) as PropertyTypeSlug[];

/** Room count slug → count + display labels */
export const ROOM_COUNTS = {
  monoambiente: { count: 1, label: "monoambiente", titleLabel: "Monoambientes" },
  "2-ambientes": { count: 2, label: "2 ambientes", titleLabel: "2 ambientes" },
  "3-ambientes": { count: 3, label: "3 ambientes", titleLabel: "3 ambientes" },
  "4-ambientes": { count: 4, label: "4 ambientes", titleLabel: "4 ambientes" },
  "5-ambientes": { count: 5, label: "5 ambientes", titleLabel: "5 ambientes" },
} as const;

export type RoomSlug = keyof typeof ROOM_COUNTS;

export const ROOM_SLUGS = Object.keys(ROOM_COUNTS) as RoomSlug[];
