import { createClient } from "@/lib/supabase/server-component";
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
    const mockData = getMockPropertyDetail(propertyId);
    if (!mockData) redirect("/gestion");
    return (
      <PropertyDetailView
        property={mockData.property}
        operations={mockData.operations}
        currentTenant={mockData.currentTenant}
        currentOperation={mockData.currentOperation}
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

  // Fetch property (only if owned by this user)
  const { data: property } = await supabaseAdmin
    .from("properties_read")
    .select("*")
    .eq("property_id", Number(propertyId))
    .eq("user_id", publicUser.id)
    .maybeSingle();

  if (!property) redirect("/gestion");

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
    />
  );
}
