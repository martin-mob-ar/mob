import { getAuthUser } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PropertyEditForm from "@/views/panel/PropertyEditForm";

interface Props {
  params: Promise<{ propertyId: string }>;
}

export default async function EditPropertyPage({ params }: Props) {
  const { propertyId } = await params;
  const numericId = Number(propertyId);

  // Auth check
  const authUser = await getAuthUser();

  if (!authUser) redirect("/login");

  // Resolve auth UUID → public users.id
  const { data: publicUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  if (!publicUser) redirect("/gestion");

  // Fetch full property row (ownership check)
  const { data: property } = await supabaseAdmin
    .from("properties")
    .select("*")
    .eq("id", numericId)
    .eq("user_id", publicUser.id)
    .maybeSingle();

  if (!property) redirect("/gestion");
  if (property.tokko) redirect(`/gestion/propiedad/${propertyId}`);

  // Parallel fetches for related data + reference data
  const [
    { data: operacion },
    { data: photos },
    { data: videos },
    { data: tagLinks },
    { data: propertyTypes },
    { data: tags },
  ] = await Promise.all([
    supabaseAdmin
      .from("operaciones")
      .select("*")
      .eq("property_id", numericId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from("tokko_property_photo")
      .select("id, image, original, thumb, order, is_front_cover")
      .eq("property_id", numericId)
      .order("order"),
    supabaseAdmin
      .from("tokko_property_video")
      .select("id, url, order")
      .eq("property_id", numericId)
      .order("order"),
    supabaseAdmin
      .from("tokko_property_property_tag")
      .select("tag_id")
      .eq("property_id", numericId),
    supabaseAdmin
      .from("tokko_property_type")
      .select("id, name")
      .order("name"),
    supabaseAdmin
      .from("tokko_property_tag")
      .select("id, name, type")
      .order("name"),
  ]);

  // Fetch current location info for display in the form
  let currentLocation: {
    id: number;
    name: string;
    parentName: string;
  } | null = null;

  if (property.location_id) {
    const { data: loc } = await supabaseAdmin
      .from("tokko_location")
      .select("id, name, parent_location_id")
      .eq("id", property.location_id)
      .single();

    if (loc) {
      let parentName = "";
      if (loc.parent_location_id) {
        const { data: parent } = await supabaseAdmin
          .from("tokko_location")
          .select("name")
          .eq("id", loc.parent_location_id)
          .single();
        parentName = parent?.name || "";
      }
      currentLocation = {
        id: loc.id,
        name: loc.name,
        parentName,
      };
    }
  }

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <PropertyEditForm
      propertyId={numericId}
      property={property}
      operacion={operacion}
      photos={photos || []}
      videos={videos || []}
      tagIds={(tagLinks || []).map((t: any) => t.tag_id)}
      propertyTypes={propertyTypes || []}
      tags={tags || []}
      currentLocation={currentLocation}
      googleMapsApiKey={googleMapsApiKey}
    />
  );
}
