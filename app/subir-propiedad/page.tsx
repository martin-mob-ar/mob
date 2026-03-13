import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuthUser } from "@/lib/supabase/auth";
import { supabaseAdmin, getOrCreateUserFromAuth } from "@/lib/supabase/server";
import SubirPropiedad from "@/views/SubirPropiedad";

interface PageProps {
  searchParams: Promise<{ draftId?: string }>;
}

export default async function SubirPropiedadPage({ searchParams }: PageProps) {
  const user = await getAuthUser();

  if (!user) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/subir-propiedad";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  const params = await searchParams;
  const draftId = params?.draftId ? parseInt(params.draftId) : null;

  let draftData = null;
  if (draftId) {
    const publicUserId = await getOrCreateUserFromAuth(user.id);
    const { data } = await supabaseAdmin
      .from("properties")
      .select("*, tokko_property_photo(*), tokko_property_property_tag(*), tokko_location!location_id(id, name, depth)")
      .eq("id", draftId)
      .eq("user_id", publicUserId)
      .not("draft_step", "is", null)
      .maybeSingle();
    draftData = data;
  }

  return <SubirPropiedad userId={user.id} draftData={draftData} />;
}
