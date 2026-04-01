import { getAuthUser } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  transformToTenantRental,
  transformToOwnerProperty,
  transformToOwnerPropertyFromRaw,
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
      .select("name, email, telefono, telefono_country_code, dni, account_type, tokko_api_hash, tokko_api_key_enc, sync_status, tokko_last_sync_at, hoggax_last_verification_date, truora_last_verification_date")
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
    const [tenantOpsResult, ownerPropsResult, draftPropsResult, pausedPropsResult] = await Promise.all([
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
        .select("id, type_id, address, location_id, draft_step, updated_at, tokko_property_type(name), tokko_location!location_id(name)")
        .eq("user_id", publicUserId)
        .not("draft_step", "is", null)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false }),
      // Paused properties (status=1) — not in properties_read, need direct query
      supabaseAdmin
        .from("properties")
        .select(`id, user_id, tokko, status, address, publication_title,
          room_amount, bathroom_amount, suite_amount, total_surface, parking_lot_amount, age,
          tokko_property_type!type_id(id, name),
          tokko_location!location_id(name, parent:tokko_location!parent_location_id(name))`)
        .eq("user_id", publicUserId)
        .eq("status", 1)
        .is("deleted_at", null)
        .is("draft_step", null)
        .order("updated_at", { ascending: false }),
    ]);

    const tenantOps = tenantOpsResult.data || [];
    const ownerProps = ownerPropsResult.data || [];
    draftProperties = draftPropsResult.data || [];
    const pausedProps = pausedPropsResult.data || [];

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

    // Owner properties: fetch plans for non-tokko ones
    const planMap = new Map<number, string | null>();
    const manualProps = ownerProps.filter((p: any) => p.tokko_id == null);
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

    // Paused properties: fetch operacion + cover photo for each, then merge
    if (pausedProps.length > 0) {
      const pausedIds = pausedProps.map((p: any) => p.id);
      const [pausedOpsResult, pausedPhotosResult] = await Promise.all([
        supabaseAdmin
          .from("operaciones")
          .select("id, property_id, status, price, currency, expenses, planMobElegido")
          .in("property_id", pausedIds)
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("tokko_property_photo")
          .select("property_id, image")
          .in("property_id", pausedIds)
          .order("is_front_cover", { ascending: false })
          .order("order", { ascending: true }),
      ]);

      const pausedOpsMap = new Map<number, any>();
      for (const op of pausedOpsResult.data || []) {
        if (!pausedOpsMap.has(op.property_id)) pausedOpsMap.set(op.property_id, op);
      }
      const pausedPhotoMap = new Map<number, string>();
      for (const photo of pausedPhotosResult.data || []) {
        if (!pausedPhotoMap.has(photo.property_id)) pausedPhotoMap.set(photo.property_id, photo.image);
      }

      const pausedOwnerProperties = pausedProps.map((row: any) => {
        const op = pausedOpsMap.get(row.id);
        return transformToOwnerPropertyFromRaw(
          row,
          op,
          pausedPhotoMap.get(row.id) ?? null,
          null,
          op?.planMobElegido ?? null
        );
      });

      ownerProperties = [...ownerProperties, ...pausedOwnerProperties];
    }
  }

  const roles = {
    isTenant: tenantRentals.length > 0,
    isOwner: ownerProperties.length > 0 || draftProperties.length > 0,
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
        lastVerificationDate={profile.truora_last_verification_date ?? null}
        authId={authUser.id}
        authEmail={authUser.email!}
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
            userEmail={profile.email}
          />
        </>
      )}
    </div>
  );
}
