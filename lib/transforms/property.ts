import { Property } from "@/components/PropertyCard";

/**
 * Maps a properties_read row from Supabase to the frontend Property interface.
 */
export function transformPropertyRead(row: any): Property {
  return {
    id: String(row.property_id),
    image: row.cover_photo_url || "/assets/property-new-1.png",
    address: row.address || row.title || "",
    neighborhood: row.location_name || "",
    description: row.title || row.description || "",
    price: row.valor_total_primary || row.price || 0,
    rentPrice: row.price || 0,
    expensas: row.expenses || 0,
    currency: row.currency || "ARS",
    type: row.tokko ? "inmobiliaria" : "dueno",
    rooms: row.room_amount || undefined,
    surface: row.total_surface ? Number(row.total_surface) : undefined,
    bathrooms: row.bathroom_amount || undefined,
    parking: row.parking_lot_amount || undefined,
    verified: true, // Placeholder - always true for now
  };
}

/**
 * Maps multiple properties_read rows.
 */
export function transformPropertyReadList(rows: any[]): Property[] {
  return rows.map(transformPropertyRead);
}

/**
 * Maps a properties_read row to the panel Property interface
 * used by ResumenView and PropiedadesView (owner panel).
 */
export function transformToOwnerPanelProperty(row: any) {
  const price = row.price || row.valor_total_primary || 0;
  const currency = row.currency || "ARS";
  return {
    id: String(row.property_id),
    name: row.title || row.address || "Propiedad",
    location: [row.location_name, row.state_name].filter(Boolean).join(", ") || "",
    price: `$${Number(price).toLocaleString()} ${currency}`,
    status: "activa" as const,
    image: row.cover_photo_url || "/assets/property-new-1.png",
    openTickets: 0,
    interestedCount: 0,
  };
}

/**
 * Maps a properties_read row to the inmobiliaria panel Property interface
 * used by InmobiliariaPropiedadesView.
 */
export function transformToInmobiliariaPanelProperty(row: any) {
  const price = row.price || row.valor_total_primary || 0;
  const currency = row.currency || "ARS";
  return {
    id: String(row.property_id),
    name: row.title || row.address || "Propiedad",
    location: [row.location_name, row.state_name].filter(Boolean).join(", ") || "",
    price: `$${Number(price).toLocaleString()} ${currency}`,
    status: "activa" as const,
    image: row.cover_photo_url || "/assets/property-new-1.png",
    propietario: "",
    tokkoId: `TK-${String(row.property_id).padStart(6, "0")}`,
    interestedCount: 0,
    openTickets: 0,
  };
}
