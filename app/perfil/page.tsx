import { getAuthUser } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  transformToTenantRental,
  transformToOwnerProperty,
} from "@/lib/transforms/property";
import GestionView from "@/views/panel/GestionView";
import ProfileSection from "@/components/profile/ProfileSection";
import { decryptApiKey } from "@/lib/crypto";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi perfil | Mob",
};

export default async function PerfilPage() {
  const authUser = await getAuthUser();

  // Auth is guaranteed by layout, but guard for TS
  if (!authUser) return null;

  // ─── Parallel: profile + public user ID ─────────────────────────────
  const [profileResult, publicUserResult] = await Promise.all([
    supabaseAdmin
      .from("users")
      .select("name, email, telefono, telefono_country_code, dni, account_type, tokko_api_hash, tokko_api_key_enc, sync_status, tokko_last_sync_at, last_verification_date")
      .eq("auth_id", authUser.id)
      .single(),
    supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_id", authUser.id)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  const publicUserId = publicUserResult.data?.id;

  if (!profile) return null;

  // ─── Gestion data ────────────────────────────────────────────────────
  let tenantRentals: ReturnType<typeof transformToTenantRental>[] = [];
  let ownerProperties: ReturnType<typeof transformToOwnerProperty>[] = [];

  let draftProperties: any[] = [];

  if (publicUserId) {
    const [tenantOpsResult, ownerPropsResult, draftPropsResult] = await Promise.all([
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
      supabaseAdmin
        .from("properties")
        .select("id, type_id, address, location_id, draft_step, updated_at, tokko_property_type(name), tokko_location(name)")
        .eq("user_id", publicUserId)
        .not("draft_step", "is", null)
        .order("updated_at", { ascending: false }),
    ]);

    const tenantOps = tenantOpsResult.data || [];
    const ownerProps = ownerPropsResult.data || [];
    draftProperties = draftPropsResult.data || [];

    // Tenant rentals
    if (tenantOps.length > 0) {
      const propertyIds = [
        ...new Set(tenantOps.map((op: any) => op.property_id)),
      ];
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

    // Owner properties: fetch plans for tokko=false ones
    const planMap = new Map<number, string | null>();
    const manualProps = ownerProps.filter((p: any) => !p.tokko);
    if (manualProps.length > 0) {
      const manualIds = manualProps.map((p: any) => p.property_id);
      const { data: planOps } = await supabaseAdmin
        .from("operaciones")
        .select("property_id, planMobElegido")
        .in("property_id", manualIds);

      for (const op of planOps || []) {
        if (op.planMobElegido && !planMap.has(op.property_id)) {
          planMap.set(op.property_id, op.planMobElegido);
        }
      }
    }

    // Fetch tenant names for rented properties
    const rentedProps = ownerProps.filter(
      (p: any) => p.operacion_status === "rented"
    );
    let tenantNames = new Map<number, string>();
    if (rentedProps.length > 0) {
      const opPropertyIds = rentedProps.map((p: any) => p.property_id);
      const { data: rentedOps } = await supabaseAdmin
        .from("operaciones")
        .select("property_id, tenant_id")
        .in("property_id", opPropertyIds)
        .eq("status", "rented");

      if (rentedOps && rentedOps.length > 0) {
        const tenantIds = [
          ...new Set(
            rentedOps.map((o: any) => o.tenant_id).filter(Boolean)
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
              tenantNames.set(
                op.property_id,
                tenantMap.get(op.tenant_id) || ""
              );
            }
          }
        }
      }
    }

    ownerProperties = ownerProps.map((row: any) =>
      transformToOwnerProperty(
        row,
        tenantNames.get(row.property_id),
        planMap.get(row.property_id) ?? null
      )
    );
  }

  const roles = {
    isTenant: tenantRentals.length > 0,
    isOwner: ownerProperties.length > 0,
  };

  // Decrypt the first 8 chars of the API key server-side (never send full key to client)
  let tokkoKeyPreview: string | null = null;
  if (profile.tokko_api_key_enc) {
    try {
      tokkoKeyPreview = decryptApiKey(profile.tokko_api_key_enc).substring(0, 8);
    } catch {
      // Decryption failed (e.g. secret not configured) — omit preview
    }
  }

  const profileData = {
    name: profile.name,
    email: profile.email,
    telefono: profile.telefono,
    telefono_country_code: profile.telefono_country_code,
    dni: profile.dni,
  };

  return (
    <div className="space-y-10">
      {/* Profile section — handles account type gate + inmobiliaria flow */}
      <ProfileSection
        profile={profileData}
        accountType={profile.account_type ?? null}
        hasTokkoHash={!!profile.tokko_api_hash}
        syncStatus={profile.sync_status ?? "idle"}
        tokkoLastSyncAt={profile.tokko_last_sync_at ?? null}
        tokkoKeyPreview={tokkoKeyPreview}
        tokkoApiHash={profile.tokko_api_hash ?? null}
        lastVerificationDate={profile.last_verification_date ?? null}
      />

      {/* Gestion section — only show when user has selected a role */}
      {profile.account_type && (
        <>
          <div className="border-t border-border" />
          <GestionView
            tenantRentals={tenantRentals}
            ownerProperties={ownerProperties}
            draftProperties={draftProperties}
            roles={roles}
            accountType={profile.account_type}
          />
        </>
      )}
    </div>
  );
}
