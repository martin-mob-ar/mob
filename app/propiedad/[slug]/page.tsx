import { createClient } from "@/lib/supabase/server-component";
import { transformPropertyRead } from "@/lib/transforms/property";
import PropertyDetail from "@/views/PropertyDetail";
import { permanentRedirect, notFound } from "next/navigation";
import type { Metadata } from "next";

/** Extract the numeric property ID from a slug or raw number */
function extractPropertyId(slugOrId: string): number | null {
  // Pure numeric ID (legacy URL)
  if (/^\d+$/.test(slugOrId)) {
    return parseInt(slugOrId);
  }
  // Slug with ID suffix: "departamento-2-ambientes-centro-mar-del-plata-730"
  const match = slugOrId.match(/-(\d+)$/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: slugParam } = await params;
  const propertyId = extractPropertyId(slugParam);

  if (!propertyId) {
    return { title: "Propiedad no encontrada | mob" };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("properties_read")
    .select(
      "property_id, property_type_id, property_type_name, room_amount, location_name, parent_location_name, address, description, cover_photo_url, currency, price, expenses, total_surface, slug"
    )
    .eq("property_id", propertyId)
    .single();

  if (!data) {
    return { title: "Propiedad no encontrada | mob" };
  }

  // Get Spanish type name
  let typeNameEs = "Propiedad";
  if (data.property_type_id) {
    const { data: typeData } = await supabase
      .from("tokko_property_type")
      .select("name")
      .eq("id", data.property_type_id)
      .single();
    if (typeData?.name) typeNameEs = typeData.name;
  }

  // Build title: "Departamento 2 ambientes en Centro, Mar Del Plata | mob"
  const titleParts: string[] = [typeNameEs];
  if (data.room_amount && data.room_amount > 0) {
    titleParts.push(
      `${data.room_amount} ${data.room_amount === 1 ? "ambiente" : "ambientes"}`
    );
  }
  if (data.location_name) {
    const locationStr = data.parent_location_name
      ? `en ${data.location_name}, ${data.parent_location_name}`
      : `en ${data.location_name}`;
    titleParts.push(locationStr);
  }
  const title = titleParts.join(" ") + " | mob";

  // Build description
  const descParts: string[] = [];
  descParts.push(`${typeNameEs} en alquiler`);
  if (data.room_amount && data.room_amount > 0) {
    descParts.push(
      `${data.room_amount} ${data.room_amount === 1 ? "ambiente" : "ambientes"}`
    );
  }
  if (data.location_name) {
    descParts.push(`en ${data.location_name}`);
  }
  if (data.parent_location_name) {
    descParts.push(`- ${data.parent_location_name}`);
  }
  if (data.price && data.currency) {
    const totalPrice = Number(data.price) + (data.expenses || 0);
    descParts.push(
      `- ${data.currency === "USD" ? "USD " : "$"}${totalPrice.toLocaleString("es-AR")}`
    );
  }
  if (data.total_surface) {
    descParts.push(`- ${data.total_surface} m²`);
  }
  const description =
    descParts.join(" ") + ". Alquileres 100% online en mob.";

  const canonicalSlug = data.slug || slugParam;
  const canonicalUrl = `https://mob.com.ar/propiedad/${canonicalSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "mob",
      type: "website",
      ...(data.cover_photo_url && {
        images: [
          {
            url: data.cover_photo_url,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(data.cover_photo_url && {
        images: [data.cover_photo_url],
      }),
    },
  };
}

export default async function PropiedadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: slugParam } = await params;
  const propertyId = extractPropertyId(slugParam);

  if (!propertyId) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch property from properties_read
  const { data: propertyData } = await supabase
    .from("properties_read")
    .select("*")
    .eq("property_id", propertyId)
    .single();

  if (!propertyData) {
    notFound();
  }

  // 301 redirect if accessed via numeric ID or wrong slug
  if (propertyData.slug && slugParam !== propertyData.slug) {
    permanentRedirect(`/propiedad/${propertyData.slug}`);
  }

  let property;
  let photos: string[] = [];
  let tags: string[] = [];
  let description: string | null = null;
  let publisherName: string | null = null;
  let publisherLogo: string | null = null;
  const isTokko = propertyData.tokko === true;
  let locationFull: string | null = null;
  let geoLat: number | null = null;
  let geoLong: number | null = null;

  property = transformPropertyRead(propertyData);
  description = propertyData.description || null;

  // Build location string from real data
  const locationParts = [
    propertyData.location_name,
    propertyData.parent_location_name,
  ].filter(Boolean);
  locationFull = locationParts.join(", ") || null;

  // Extract geo coordinates
  geoLat = propertyData.geo_lat ? Number(propertyData.geo_lat) : null;
  geoLong = propertyData.geo_long ? Number(propertyData.geo_long) : null;

  // Collect tags from all types
  const allTags: string[] = [];
  if (propertyData.tag_names_type_1)
    allTags.push(...propertyData.tag_names_type_1);
  if (propertyData.tag_names_type_2)
    allTags.push(...propertyData.tag_names_type_2);
  if (propertyData.tag_names_type_3)
    allTags.push(...propertyData.tag_names_type_3);
  tags = allTags;

  // Fetch all photos for this property
  const { data: photoData } = await supabase
    .from("tokko_property_photo")
    .select("image, thumb, is_front_cover")
    .eq("property_id", propertyId)
    .order("is_front_cover", { ascending: false })
    .order("order", { ascending: true });

  if (photoData && photoData.length > 0) {
    photos = photoData.map((p: any) => p.image).filter(Boolean);
  }

  // Fetch publisher info from users table (works for both Tokko and non-Tokko properties)
  if (propertyData.user_id) {
    const { data: userData } = await supabase
      .from("users")
      .select("name, logo")
      .eq("id", propertyData.user_id)
      .single();

    if (userData) {
      publisherName = userData.name || null;
      publisherLogo = userData.logo || null;
    }
  }

  return (
    <PropertyDetail
      property={property}
      photos={photos}
      tags={tags}
      description={description}
      publisherName={publisherName}
      publisherLogo={publisherLogo}
      isTokko={isTokko}
      locationFull={locationFull}
      geoLat={geoLat}
      geoLong={geoLong}
    />
  );
}
