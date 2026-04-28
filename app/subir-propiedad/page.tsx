import type { Metadata } from "next";
import { getAuthUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin, getOrCreateUserFromAuth } from "@/lib/supabase/server";
import SubirPropiedad from "@/views/SubirPropiedad";

export const metadata: Metadata = {
  title: "Publicar propiedad en alquiler",
  description:
    "Publica tu departamento, casa o PH en alquiler en Mob. Proceso simple, verificacion de inquilinos incluida y gestion 100% online.",
  alternates: { canonical: "/subir-propiedad" },
};

interface PageProps {
  searchParams: Promise<{
    draftId?: string;
    editId?: string;
    from?: string;
    resume?: string;
    auth_error?: string;
  }>;
}

export default async function SubirPropiedadPage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  const params = await searchParams;
  const fromPropietarios = params?.from === "propietarios";
  const resumeAfterAuth = params?.resume === "true";
  const authError = params?.auth_error || null;

  // Unregistered users see intro + step 1 only (auth gate enforced client-side)
  if (!user) {
    return (
      <SubirPropiedad
        key="guest"
        userId={null}
        fromPropietarios={fromPropietarios}
        resumeAfterAuth={false}
        googleAuthError={authError}
      />
    );
  }

  const draftId = params?.draftId ? parseInt(params.draftId) : null;
  const editId = params?.editId ? parseInt(params.editId) : null;

  const publicUserId = await getOrCreateUserFromAuth(user.id);

  // Inmobiliarias cannot upload properties manually — redirect to profile
  const { data: userRecord } = await supabaseAdmin
    .from("users")
    .select("account_type")
    .eq("id", publicUserId)
    .maybeSingle();

  if (userRecord?.account_type === 3 || userRecord?.account_type === 4) {
    redirect("/perfil");
  }

  // Always fetch existing drafts (lightweight query for draft prompt)
  const { data: existingDrafts } = await supabaseAdmin
    .from("properties")
    .select(
      "id, type_id, address, location_id, draft_step, updated_at, tokko_property_type(name), tokko_location!location_id(name)"
    )
    .eq("user_id", publicUserId)
    .not("draft_step", "is", null)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  let draftData = null;
  if (draftId) {
    const { data } = await supabaseAdmin
      .from("properties")
      .select("*, tokko_property_photo(*), tokko_property_property_tag(*), tokko_location!location_id(id, name, depth)")
      .eq("id", draftId)
      .eq("user_id", publicUserId)
      .not("draft_step", "is", null)
      .maybeSingle();
    draftData = data;
  }

  // Edit mode: load published property + operacion
  let editData = null;
  if (editId && !draftId) {
    const [{ data: property }, { data: operacion }] = await Promise.all([
      supabaseAdmin
        .from("properties")
        .select(
          "*, tokko_property_photo(*), tokko_property_property_tag(*), tokko_location!location_id(id, name, depth)"
        )
        .eq("id", editId)
        .eq("user_id", publicUserId)
        .eq("tokko", false)
        .is("deleted_at", null)
        .maybeSingle(),
      supabaseAdmin
        .from("operaciones")
        .select("*")
        .eq("property_id", editId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (property) {
      editData = { ...property, operacion };
    }
  }

  return (
    <SubirPropiedad
      key={draftData?.id ?? editData?.id ?? "new"}
      userId={user.id}
      draftData={draftData}
      editData={editData}
      existingDrafts={existingDrafts || []}
      fromPropietarios={fromPropietarios}
      resumeAfterAuth={resumeAfterAuth}
      googleAuthError={authError}
    />
  );
}
