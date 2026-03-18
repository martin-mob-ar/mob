import { getAuthUser } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { transformToOperationHistory } from "@/lib/transforms/property";
import { getMockPropertyDetail } from "@/lib/mock/gestion-mock-data";
import PropertyDetailView from "@/views/panel/PropertyDetailView";

interface Props {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ mock?: string }>;
}

export default async function GestionPropertyDetailPage({
  params,
  searchParams,
}: Props) {
  const { propertyId } = await params;
  const { mock } = await searchParams;

  // ─── Mock mode ─────────────────────────────────────────────────────
  if (mock === "true") {
    const authUser = await getAuthUser();
    const email = authUser
      ? (
          await supabaseAdmin
            .from("users")
            .select("email")
            .eq("auth_id", authUser.id)
            .maybeSingle()
        ).data?.email
      : undefined;

    const mockData = getMockPropertyDetail(propertyId);
    if (!mockData) redirect("/gestion");
    return (
      <PropertyDetailView
        property={mockData.property}
        operations={mockData.operations}
        currentTenant={mockData.currentTenant}
        currentOperation={mockData.currentOperation}
        mockMode
        tokko={mockData.tokko}
        tokkoId={mockData.tokkoId}
        userEmail={email}
      />
    );
  }

  // ─── Real data ─────────────────────────────────────────────────────
  const authUser = await getAuthUser();

  if (!authUser) redirect("/login");

  // Resolve auth UUID → public users.id
  const { data: publicUser } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  if (!publicUser) redirect("/gestion");

  // Fetch property (only if owned by this user)
  let property: any;
  let propertyStatus = 2;

  const { data: activeProperty } = await supabaseAdmin
    .from("properties_read")
    .select("*")
    .eq("property_id", Number(propertyId))
    .eq("user_id", publicUser.id)
    .maybeSingle();

  if (activeProperty) {
    property = activeProperty;
    propertyStatus = activeProperty.property_status ?? 2;
  } else {
    // Fallback: check for paused property (status=1) in properties table
    const { data: pausedProp } = await supabaseAdmin
      .from("properties")
      .select(`id, user_id, tokko, status, description, address, publication_title,
        geo_lat, geo_long, room_amount, bathroom_amount, suite_amount, total_surface,
        roofed_surface, parking_lot_amount, age, slug, contact_phone, company_id, created_at, updated_at,
        tokko_property_type!type_id(id, name),
        tokko_location!location_id(id, name, parent:tokko_location!parent_location_id(name)),
        tokko_company!company_id(name, logo)`)
      .eq("id", Number(propertyId))
      .eq("user_id", publicUser.id)
      .eq("status", 1)
      .maybeSingle();

    if (!pausedProp) redirect("/gestion");

    propertyStatus = 1;

    // Fetch latest operacion + cover photo for the paused property
    const [opResult, photoResult] = await Promise.all([
      supabaseAdmin
        .from("operaciones")
        .select("*")
        .eq("property_id", pausedProp.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("tokko_property_photo")
        .select("image, thumb")
        .eq("property_id", pausedProp.id)
        .order("is_front_cover", { ascending: false })
        .order("order", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    // Build a properties_read-like shape for PropertyDetailView
    property = {
      property_id: pausedProp.id,
      user_id: pausedProp.user_id,
      tokko: pausedProp.tokko,
      description: pausedProp.description,
      address: pausedProp.address,
      title: pausedProp.publication_title,
      geo_lat: pausedProp.geo_lat,
      geo_long: pausedProp.geo_long,
      property_type_id: (pausedProp as any).tokko_property_type?.id,
      property_type_name: (pausedProp as any).tokko_property_type?.name,
      location_name: (pausedProp as any).tokko_location?.name,
      parent_location_name: (pausedProp as any).tokko_location?.parent?.name,
      company_name: (pausedProp as any).tokko_company?.name,
      company_logo: (pausedProp as any).tokko_company?.logo,
      contact_phone: pausedProp.contact_phone,
      slug: pausedProp.slug,
      age: pausedProp.age,
      room_amount: pausedProp.room_amount,
      bathroom_amount: pausedProp.bathroom_amount,
      suite_amount: pausedProp.suite_amount,
      total_surface: pausedProp.total_surface,
      roofed_surface: pausedProp.roofed_surface,
      parking_lot_amount: pausedProp.parking_lot_amount,
      cover_photo_url: photoResult.data?.image || null,
      cover_photo_thumb: photoResult.data?.thumb || null,
      operacion_id: opResult.data?.id || null,
      operacion_status: opResult.data?.status || "available",
      currency: opResult.data?.currency || null,
      price: opResult.data?.price || null,
      expenses: opResult.data?.expenses || null,
      property_status: 1,
      property_created_at: pausedProp.created_at,
      property_updated_at: pausedProp.updated_at,
    };
  }

  // Fetch tokko source info (tokko_id not in properties_read)
  const { data: propertySource } = await supabaseAdmin
    .from("properties")
    .select("tokko, tokko_id")
    .eq("id", Number(propertyId))
    .eq("user_id", publicUser.id)
    .single();

  // Fetch ALL operations for this property (history)
  const { data: operations } = await supabaseAdmin
    .from("operaciones")
    .select("*")
    .eq("property_id", Number(propertyId))
    .order("start_date", { ascending: false, nullsFirst: false });

  // Fetch tenant info for operations that have a tenant
  const tenantIds = [
    ...new Set(
      (operations || [])
        .map((op: any) => op.tenant_id)
        .filter(Boolean)
    ),
  ];

  let tenantMap = new Map<string, any>();
  if (tenantIds.length > 0) {
    const { data: tenants } = await supabaseAdmin
      .from("users")
      .select("id, name, email")
      .in("id", tenantIds);

    tenantMap = new Map(
      (tenants || []).map((t: any) => [t.id, t])
    );
  }

  const operationHistory = (operations || []).map((op: any) =>
    transformToOperationHistory(op, tenantMap.get(op.tenant_id))
  );

  // Current tenant info (from the active rented operation)
  const currentOp = (operations || []).find(
    (op: any) => op.status === "rented"
  );
  const currentTenant = currentOp?.tenant_id
    ? tenantMap.get(currentOp.tenant_id)
    : null;

  return (
    <PropertyDetailView
      property={property}
      operations={operationHistory}
      currentTenant={currentTenant}
      currentOperation={currentOp}
      tokko={propertySource?.tokko ?? false}
      tokkoId={propertySource?.tokko_id ?? null}
      userEmail={publicUser.email}
      propertyStatus={propertyStatus}
    />
  );
}
