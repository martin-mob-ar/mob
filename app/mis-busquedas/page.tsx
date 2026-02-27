import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import MisBusquedasView from "@/views/MisBusquedasView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis búsquedas | mob",
  description: "Tus propiedades guardadas y consultas enviadas",
};

export default async function MisBusquedasPage() {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/?login=1");
  }

  const { data: publicUser } = await supabaseAdmin
    .from("users")
    .select("id, name")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  if (!publicUser) {
    redirect("/");
  }

  const publicUserId = publicUser.id;

  // Parallel fetch: favoritos + consultas
  const [favoritosResult, consultasResult] = await Promise.all([
    supabaseAdmin
      .from("favoritos")
      .select("property_id, created_at")
      .eq("user_id", publicUserId)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("leads")
      .select("id, property_id, type, created_at")
      .eq("submitter_user_id", publicUserId)
      .order("created_at", { ascending: false }),
  ]);

  const favoritoRows = favoritosResult.data || [];
  const consultaRows = consultasResult.data || [];

  // Collect unique property IDs
  const favPropertyIds = favoritoRows.map((f) => f.property_id);
  const leadPropertyIds = [...new Set(consultaRows.map((c) => c.property_id))];
  const allPropertyIds = [...new Set([...favPropertyIds, ...leadPropertyIds])];

  // Fetch property data for all referenced properties
  let propertiesMap: Record<number, {
    property_id: number;
    slug: string | null;
    address: string | null;
    location_name: string | null;
    price: number | null;
    secondary_price: number | null;
    expenses: number | null;
    currency: string | null;
    cover_photo_url: string | null;
    room_amount: number | null;
    suite_amount: number | null;
    bathroom_amount: number | null;
  }> = {};

  if (allPropertyIds.length > 0) {
    const { data: properties } = await supabaseAdmin
      .from("properties_read")
      .select(
        "property_id, slug, address, location_name, price, secondary_price, expenses, currency, cover_photo_url, room_amount, suite_amount, bathroom_amount"
      )
      .in("property_id", allPropertyIds);

    if (properties) {
      for (const p of properties) {
        propertiesMap[p.property_id] = p;
      }
    }
  }

  // Build favoritos list
  const favoritos = favoritoRows
    .filter((f) => propertiesMap[f.property_id])
    .map((f) => ({
      propertyId: f.property_id,
      savedAt: f.created_at,
      property: propertiesMap[f.property_id],
    }));

  // Build consultas list (one entry per lead, sorted by date)
  const consultas = consultaRows
    .filter((c) => propertiesMap[c.property_id])
    .map((c) => ({
      leadId: c.id,
      propertyId: c.property_id,
      type: c.type as "visita" | "reserva",
      sentAt: c.created_at,
      property: propertiesMap[c.property_id],
    }));

  return (
    <MisBusquedasView
      userName={publicUser.name || authUser.email?.split("@")[0] || ""}
      favoritos={favoritos}
      consultas={consultas}
    />
  );
}
