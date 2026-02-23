import { createClient } from "@/lib/supabase/server-component";
import { supabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMockTenantRentalDetail } from "@/lib/mock/gestion-mock-data";
import TenantRentalDetailView from "@/views/panel/TenantRentalDetailView";

interface Props {
  params: Promise<{ operacionId: string }>;
  searchParams: Promise<{ mock?: string }>;
}

export default async function TenantRentalDetailPage({
  params,
  searchParams,
}: Props) {
  const { operacionId } = await params;
  const { mock } = await searchParams;

  // ─── Mock mode ─────────────────────────────────────────────────────
  if (mock === "true") {
    const mockData = getMockTenantRentalDetail(operacionId);
    if (!mockData) redirect("/gestion");
    return (
      <TenantRentalDetailView
        operacion={mockData.operacion}
        property={mockData.property}
        photos={mockData.photos}
        mockMode
      />
    );
  }

  // ─── Real data ─────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  // Resolve auth UUID → public users.id
  const { data: publicUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  if (!publicUser) redirect("/gestion");

  // Fetch the operacion (only if tenant is the current user)
  const { data: operacion } = await supabaseAdmin
    .from("operaciones")
    .select("*")
    .eq("id", Number(operacionId))
    .eq("tenant_id", publicUser.id)
    .maybeSingle();

  if (!operacion) redirect("/gestion");

  // Fetch property info
  const { data: propertyRead } = await supabaseAdmin
    .from("properties_read")
    .select("*")
    .eq("property_id", operacion.property_id)
    .maybeSingle();

  // Fetch property photos
  const { data: photos } = await supabaseAdmin
    .from("tokko_property_photo")
    .select("id, url, thumb_url, description, is_front_cover")
    .eq("property_id", operacion.property_id)
    .order("is_front_cover", { ascending: false })
    .order("id", { ascending: true })
    .limit(10);

  return (
    <TenantRentalDetailView
      operacion={operacion}
      property={propertyRead}
      photos={photos || []}
    />
  );
}
