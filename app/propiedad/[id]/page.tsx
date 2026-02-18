import { createClient } from "@/lib/supabase/server-component";
import { transformPropertyRead } from "@/lib/transforms/property";
import PropertyDetail from "@/views/PropertyDetail";

export default async function PropiedadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let property;
  let photos: string[] = [];
  let tags: string[] = [];
  let description: string | null = null;
  let branchName: string | null = null;
  let locationFull: string | null = null;

  try {
    const supabase = await createClient();

    // Fetch property from properties_read
    const { data: propertyData } = await supabase
      .from("properties_read")
      .select("*")
      .eq("property_id", parseInt(id))
      .single();

    if (propertyData) {
      property = transformPropertyRead(propertyData);
      description = propertyData.description || null;

      // Build location string from real data
      const locationParts = [propertyData.location_name, propertyData.state_name].filter(Boolean);
      locationFull = locationParts.join(", ") || null;

      // Collect tags from all types
      const allTags: string[] = [];
      if (propertyData.tag_names_type_1) allTags.push(...propertyData.tag_names_type_1);
      if (propertyData.tag_names_type_2) allTags.push(...propertyData.tag_names_type_2);
      if (propertyData.tag_names_type_3) allTags.push(...propertyData.tag_names_type_3);
      tags = allTags;

      // Fetch all photos for this property
      const { data: photoData } = await supabase
        .from("tokko_property_photo")
        .select("image, thumb, is_front_cover")
        .eq("property_id", parseInt(id))
        .order("is_front_cover", { ascending: false })
        .order("order", { ascending: true });

      if (photoData && photoData.length > 0) {
        photos = photoData.map((p: any) => p.image).filter(Boolean);
      }

      // Fetch branch name if property has a branch_id
      const { data: propRow } = await supabase
        .from("properties")
        .select("branch_id")
        .eq("id", parseInt(id))
        .single();

      if (propRow?.branch_id) {
        const { data: branchData } = await supabase
          .from("tokko_branch")
          .select("name, display_name")
          .eq("id", propRow.branch_id)
          .single();

        if (branchData) {
          branchName = branchData.display_name || branchData.name || null;
        }
      }
    }
  } catch {
    // Fall back to mock data
  }

  return (
    <PropertyDetail
      property={property}
      photos={photos}
      tags={tags}
      description={description}
      branchName={branchName}
      locationFull={locationFull}
    />
  );
}
