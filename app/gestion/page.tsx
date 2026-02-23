import { createClient } from "@/lib/supabase/server-component";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  transformToTenantRental,
  transformToOwnerProperty,
} from "@/lib/transforms/property";
import GestionView from "@/views/panel/GestionView";

export default async function GestionPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return <GestionView tenantRentals={[]} ownerProperties={[]} roles={{ isTenant: false, isOwner: false }} />;
  }

  // Resolve auth UUID → public users.id
  const { data: publicUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  const publicUserId = publicUser?.id;

  if (!publicUserId) {
    return <GestionView tenantRentals={[]} ownerProperties={[]} roles={{ isTenant: false, isOwner: false }} />;
  }

  // Parallel queries: tenant operations + owner properties
  const [tenantOpsResult, ownerPropsResult] = await Promise.all([
    supabaseAdmin
      .from("operaciones")
      .select("*")
      .eq("tenant_id", publicUserId)
      .order("start_date", { ascending: false, nullsFirst: false }),
    supabaseAdmin
      .from("properties_read")
      .select("*")
      .eq("user_id", publicUserId)
      .order("property_created_at", { ascending: false }),
  ]);

  const tenantOps = tenantOpsResult.data || [];
  const ownerProps = ownerPropsResult.data || [];

  // For tenant ops, fetch property info from properties_read
  let tenantRentals: ReturnType<typeof transformToTenantRental>[] = [];
  if (tenantOps.length > 0) {
    const propertyIds = [...new Set(tenantOps.map((op: any) => op.property_id))];
    const { data: propertyInfos } = await supabaseAdmin
      .from("properties_read")
      .select("*")
      .in("property_id", propertyIds);

    const propertyMap = new Map(
      (propertyInfos || []).map((p: any) => [p.property_id, p])
    );

    tenantRentals = tenantOps.map((op: any) =>
      transformToTenantRental(op, propertyMap.get(op.property_id))
    );
  }

  // For owner properties with rented status, fetch tenant names
  const rentedProps = ownerProps.filter(
    (p: any) => p.operacion_status === "rented"
  );
  let tenantNames = new Map<number, string>();
  if (rentedProps.length > 0) {
    // Get operaciones to find tenant_ids
    const opPropertyIds = rentedProps.map((p: any) => p.property_id);
    const { data: rentedOps } = await supabaseAdmin
      .from("operaciones")
      .select("property_id, tenant_id")
      .in("property_id", opPropertyIds)
      .eq("status", "rented");

    if (rentedOps && rentedOps.length > 0) {
      const tenantIds = [
        ...new Set(
          rentedOps
            .map((o: any) => o.tenant_id)
            .filter(Boolean)
        ),
      ];
      if (tenantIds.length > 0) {
        const { data: tenants } = await supabaseAdmin
          .from("users")
          .select("id, name, email")
          .in("id", tenantIds);

        const tenantMap = new Map(
          (tenants || []).map((t: any) => [t.id, t.name || t.email || ""])
        );
        for (const op of rentedOps) {
          if (op.tenant_id) {
            tenantNames.set(op.property_id, tenantMap.get(op.tenant_id) || "");
          }
        }
      }
    }
  }

  const ownerProperties = ownerProps.map((row: any) =>
    transformToOwnerProperty(row, tenantNames.get(row.property_id))
  );

  return (
    <GestionView
      tenantRentals={tenantRentals}
      ownerProperties={ownerProperties}
      roles={{
        isTenant: tenantRentals.length > 0,
        isOwner: ownerProperties.length > 0,
      }}
    />
  );
}
