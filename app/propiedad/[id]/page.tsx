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
    }
  } catch {
    // Fall back to mock data
  }

  return <PropertyDetail property={property} photos={photos} />;
}
