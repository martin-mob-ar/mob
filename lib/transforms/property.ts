import { Property } from "@/components/PropertyCard";

/**
 * Maps a properties_read row from Supabase to the frontend Property interface.
 */
export function transformPropertyRead(row: any): Property {
  return {
    id: String(row.property_id),
    slug: row.slug || undefined,
    image: row.cover_photo_url || "/assets/property-new-1.png",
    address: row.address || row.title || "",
    neighborhood: [row.location_name, row.parent_location_name].filter(Boolean).join(", ") || "",
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
    location: [row.location_name, row.parent_location_name].filter(Boolean).join(", ") || "",
    price: `$${Number(price).toLocaleString("es-AR")} ${currency}`,
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
    location: [row.location_name, row.parent_location_name].filter(Boolean).join(", ") || "",
    price: `$${Number(price).toLocaleString("es-AR")} ${currency}`,
    status: "activa" as const,
    image: row.cover_photo_url || "/assets/property-new-1.png",
    propietario: "",
    tokkoId: `TK-${String(row.property_id).padStart(6, "0")}`,
    interestedCount: 0,
    openTickets: 0,
  };
}

// --- Types for gestión dashboard ---

export type OperacionStatus = "available" | "rented" | "finished" | "cancelled";

export interface TenantRental {
  operacionId: number;
  propertyId: number;
  status: OperacionStatus;
  startDate: string | null;
  endDate: string | null;
  durationMonths: number | null;
  price: number | null;
  currency: string | null;
  expenses: number | null;
  secondaryPrice: number | null;
  secondaryCurrency: string | null;
  ipcAdjustment: string | null;
  title: string;
  address: string;
  location: string;
  image: string;
  propertyType: string | null;
  rooms: number | null;
  surface: number | null;
  bathrooms: number | null;
  slug: string | null;
}

export interface OwnerProperty {
  id: string;
  name: string;
  location: string;
  price: number | null;
  priceFormatted: string;
  currency: string;
  expenses: number | null;
  status: OperacionStatus;
  image: string;
  rooms: number | null;
  surface: number | null;
  bathrooms: number | null;
  tenantName: string | null;
  operacionId: number | null;
}

export interface OperationHistoryEntry {
  id: number;
  status: OperacionStatus;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  currency: string | null;
  expenses: number | null;
  tenantName: string | null;
  tenantEmail: string | null;
  isCurrent: boolean;
  createdAt: string;
}

/**
 * Merges an operacion row with its properties_read row into a TenantRental.
 */
export function transformToTenantRental(
  op: any,
  propertyRead: any
): TenantRental {
  return {
    operacionId: op.id,
    propertyId: op.property_id,
    status: op.status,
    startDate: op.start_date,
    endDate: op.end_date,
    durationMonths: op.duration_months,
    price: op.price ? Number(op.price) : null,
    currency: op.currency,
    expenses: op.expenses,
    secondaryPrice: op.secondary_price ? Number(op.secondary_price) : null,
    secondaryCurrency: op.secondary_currency,
    ipcAdjustment: op.ipc_adjustment,
    title: propertyRead?.title || propertyRead?.address || "Propiedad",
    address: propertyRead?.address || "",
    location:
      [propertyRead?.location_name, propertyRead?.parent_location_name]
        .filter(Boolean)
        .join(", ") || "",
    image: propertyRead?.cover_photo_url || "/assets/property-new-1.png",
    propertyType: propertyRead?.property_type_name || null,
    rooms: propertyRead?.room_amount || null,
    surface: propertyRead?.total_surface
      ? Number(propertyRead.total_surface)
      : null,
    bathrooms: propertyRead?.bathroom_amount || null,
    slug: propertyRead?.slug || null,
  };
}

/**
 * Maps a properties_read row to an OwnerProperty for the gestión owner section.
 * Includes the current operation status and tenant info.
 */
export function transformToOwnerProperty(
  row: any,
  tenantName?: string | null
): OwnerProperty {
  const price = row.price ? Number(row.price) : null;
  const currency = row.currency || "ARS";
  return {
    id: String(row.property_id),
    name: row.title || row.address || "Propiedad",
    location:
      [row.location_name, row.parent_location_name]
        .filter(Boolean)
        .join(", ") || "",
    price,
    priceFormatted: price
      ? `$${price.toLocaleString("es-AR")} ${currency}`
      : "Sin precio",
    currency,
    status: (row.operacion_status as OperacionStatus) || "available",
    image: row.cover_photo_url || "/assets/property-new-1.png",
    rooms: row.room_amount || null,
    surface: row.total_surface ? Number(row.total_surface) : null,
    bathrooms: row.bathroom_amount || null,
    expenses: row.expenses ? Number(row.expenses) : null,
    tenantName: tenantName || null,
    operacionId: row.operacion_id || null,
  };
}

/**
 * Maps an operacion row + optional tenant user into an OperationHistoryEntry.
 */
export function transformToOperationHistory(
  op: any,
  tenantUser?: any
): OperationHistoryEntry {
  return {
    id: op.id,
    status: op.status,
    startDate: op.start_date,
    endDate: op.end_date,
    price: op.price ? Number(op.price) : null,
    currency: op.currency,
    expenses: op.expenses,
    tenantName: tenantUser?.name || tenantUser?.email || null,
    tenantEmail: tenantUser?.email || null,
    isCurrent: op.status === "rented",
    createdAt: op.created_at,
  };
}
