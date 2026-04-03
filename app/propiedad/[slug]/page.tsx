import { createClient } from "@/lib/supabase/server-component";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/auth";
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

/**
 * Fetch unavailable property from the raw `properties` table.
 * Used as fallback when properties_read has no row (paused or deleted).
 */
async function fetchUnavailableProperty(propertyId: number) {
  const { data } = await supabaseAdmin
    .from("properties")
    .select(`id, user_id, tokko, tokko_id, status, description, address, publication_title,
      geo_lat, geo_long, room_amount, bathroom_amount, suite_amount,
      parking_lot_amount, total_surface, roofed_surface, age, slug, company_id, contact_phone,
      type_id, location_id,
      tokko_property_type!type_id(id, name),
      tokko_location!location_id(id, name, parent_location_id,
        parent:tokko_location!parent_location_id(name)),
      tokko_company!company_id(name, logo)`)
    .eq("id", propertyId)
    .in("status", [0, 1])
    .maybeSingle();

  return data;
}

/** Map a raw properties row to a properties_read-like shape */
function mapRawToPropertyData(raw: any) {
  return {
    property_id: raw.id,
    user_id: raw.user_id,
    tokko_id: raw.tokko_id,
    description: raw.description,
    address: raw.address,
    title: raw.publication_title,
    geo_lat: raw.geo_lat,
    geo_long: raw.geo_long,
    property_type_id: raw.tokko_property_type?.id ?? null,
    property_type_name: raw.tokko_property_type?.name ?? null,
    location_id: raw.tokko_location?.id ?? null,
    location_name: raw.tokko_location?.name ?? null,
    parent_location_name: raw.tokko_location?.parent?.name ?? null,
    company_name: raw.tokko_company?.name ?? null,
    company_logo: raw.tokko_company?.logo ?? null,
    contact_phone: raw.contact_phone,
    slug: raw.slug,
    age: raw.age,
    room_amount: raw.room_amount,
    bathroom_amount: raw.bathroom_amount,
    suite_amount: raw.suite_amount,
    total_surface: raw.total_surface,
    roofed_surface: raw.roofed_surface,
    parking_lot_amount: raw.parking_lot_amount,
    // Price fields null for unavailable properties
    currency: null,
    price: null,
    expenses: null,
    valor_total_primary: null,
    cover_photo_url: null,
    cover_photo_thumb: null,
    tag_names_type_1: null,
    tag_names_type_2: null,
    tag_names_type_3: null,
    mob_plan: "basico",
    operacion_status: null,
    property_status: raw.status,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: slugParam } = await params;
  const propertyId = extractPropertyId(slugParam);

  if (!propertyId) {
    return { title: "Propiedad no encontrada | Mob.ar" };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("properties_read")
    .select(
      "property_id, property_type_id, property_type_name, room_amount, location_name, parent_location_name, address, description, cover_photo_url, currency, price, expenses, valor_total_primary, total_surface, slug"
    )
    .eq("property_id", propertyId)
    .single();

  // Fallback for unavailable properties
  if (!data) {
    const rawProperty = await fetchUnavailableProperty(propertyId);
    if (!rawProperty) {
      return { title: "Propiedad no encontrada | Mob.ar" };
    }

    const raw = rawProperty as any;
    const typeNameEs = raw.tokko_property_type?.name || "Propiedad";
    const locationName = raw.tokko_location?.name;
    const parentLocationName = raw.tokko_location?.parent?.name;

    const titleParts: string[] = [typeNameEs];
    if (rawProperty.room_amount && rawProperty.room_amount > 0) {
      titleParts.push(
        `${rawProperty.room_amount} ${rawProperty.room_amount === 1 ? "ambiente" : "ambientes"}`
      );
    }
    if (locationName) {
      titleParts.push(parentLocationName ? `en ${locationName}, ${parentLocationName}` : `en ${locationName}`);
    }
    const title = titleParts.join(" ") + " - No disponible | Mob.ar";
    const description = `${typeNameEs} ya no disponible para alquiler. Alquileres 100% online en mob.`;
    const canonicalSlug = rawProperty.slug || slugParam;
    const canonicalUrl = `https://www.mob.ar/propiedad/${canonicalSlug}`;

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: { title, description, url: canonicalUrl, siteName: "mob", type: "website" },
      twitter: { card: "summary_large_image", title, description },
    };
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

  // Build title: "Departamento 2 ambientes en Centro, Mar Del Plata | Mob.ar"
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
  const title = titleParts.join(" ") + " | Mob.ar";

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
  if ((data.valor_total_primary || data.price) && data.currency) {
    const totalPrice = Number(data.valor_total_primary || data.price);
    descParts.push(
      `- $${totalPrice.toLocaleString("es-AR")}`
    );
  }
  if (data.total_surface) {
    descParts.push(`- ${data.total_surface} m²`);
  }
  const description =
    descParts.join(" ") + ". Alquileres 100% online en mob.";

  const canonicalSlug = data.slug || slugParam;
  const canonicalUrl = `https://www.mob.ar/propiedad/${canonicalSlug}`;

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ verification?: string }>;
}) {
  const { slug: slugParam } = await params;
  const resolvedSearchParams = await searchParams;
  const showVerificationModal = resolvedSearchParams?.verification === "true";
  const propertyId = extractPropertyId(slugParam);

  if (!propertyId) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch property from properties_read
  const { data: activePropertyData } = await supabase
    .from("properties_read")
    .select("*")
    .eq("property_id", propertyId)
    .single();

  let propertyData: any;
  let isUnavailable = false;
  let isPendingVerification = false;

  if (activePropertyData) {
    // Check if property is from an unverified owner
    if (activePropertyData.owner_verified === false) {
      // Determine if the current viewer is the owner
      const authUser = await getAuthUser();
      let isOwner = false;
      if (authUser) {
        const { data: publicUser } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("auth_id", authUser.id)
          .single();
        isOwner = publicUser?.id === activePropertyData.user_id;
      }

      if (isOwner) {
        // Owner sees full property + verification prompt
        propertyData = activePropertyData;
        isPendingVerification = true;
      } else {
        // Non-owner sees "no disponible" (same as paused properties)
        propertyData = {
          ...activePropertyData,
          currency: null,
          price: null,
          expenses: null,
          valor_total_primary: null,
          cover_photo_url: null,
          cover_photo_thumb: null,
          tag_names_type_1: null,
          tag_names_type_2: null,
          tag_names_type_3: null,
          mob_plan: "basico",
          operacion_status: null,
        };
        isUnavailable = true;
      }
    } else {
      propertyData = activePropertyData;
    }
  } else {
    // Fallback: check if property exists but is paused/deleted
    const rawProperty = await fetchUnavailableProperty(propertyId);
    if (!rawProperty) {
      notFound();
    }
    propertyData = mapRawToPropertyData(rawProperty);
    isUnavailable = true;
  }

  // 301 redirect if accessed via numeric ID or wrong slug (only for active properties)
  if (!isUnavailable && propertyData.slug && slugParam !== propertyData.slug) {
    const qs = resolvedSearchParams?.verification === "true" ? "?verification=true" : "";
    permanentRedirect(`/propiedad/${propertyData.slug}${qs}`);
  }

  let property;
  let photos: string[] = [];
  let tags: string[] = [];
  let description: string | null = null;
  let publisherName: string | null = null;
  let publisherLogo: string | null = null;
  // isTokko = true only when synced from Tokko AND has a company (not a dueño directo)
  const isTokko = propertyData.tokko_id != null && !!propertyData.company_name;
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

  // For unavailable properties, fetch tags from normalized tables
  if (isUnavailable && tags.length === 0) {
    const { data: tagData } = await supabaseAdmin
      .from("tokko_property_property_tag")
      .select("tokko_property_tag(name)")
      .eq("property_id", propertyId);

    if (tagData) {
      tags = tagData.map((t: any) => t.tokko_property_tag?.name).filter(Boolean);
    }
  }

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

  // Publisher info: companies (Tokko-synced) get name + logo; dueño directo gets name only (person icon shown)
  publisherName = propertyData.company_name || null;
  publisherLogo = propertyData.company_logo || null;

  if (!publisherName && propertyData.user_id) {
    // Dueño directo: fetch name from users table; logo is intentionally not used (person icon shown instead)
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("name")
      .eq("id", propertyData.user_id)
      .single();

    // Fall back to "Propietario" so the publisher section always renders for dueño directo
    publisherName = userData?.name || "Propietario";
  }

  // Contact phone: stored directly on the property (producer.cellphone → producer.phone → branch phone)
  const contactPhone: string | null = propertyData.contact_phone ?? null;

  // mob_plan is denormalized into properties_read from operaciones.planMobElegido
  const propertyPlan = ((propertyData as any).mob_plan as "basico" | "acompanado" | "experiencia") ?? "basico";

  // Determine publisher type: company → inmobiliaria, else propietario
  const isInmobiliaria = !!propertyData.company_name;

  // Fetch extra property fields not in properties_read (suite_amount, roofed_surface, visit data)
  let suiteAmount: number | null = null;
  let roofedSurface: number | null = null;
  let visitDays: string[] | null = null;
  let visitHours: string[] | null = null;
  let orientation: string | null = null;

  if (!isUnavailable) {
    const { data: extraFields } = await supabaseAdmin
      .from("properties")
      .select("suite_amount, roofed_surface, visit_days, visit_hours, orientation")
      .eq("id", propertyId)
      .single();

    if (extraFields) {
      suiteAmount = extraFields.suite_amount ?? null;
      roofedSurface = extraFields.roofed_surface ? Number(extraFields.roofed_surface) : null;
      visitDays = extraFields.visit_days ?? null;
      visitHours = extraFields.visit_hours ?? null;
      orientation = extraFields.orientation ?? null;
    }
  } else {
    // For unavailable properties, these were already fetched in mapRawToPropertyData
    suiteAmount = propertyData.suite_amount ?? null;
    roofedSurface = propertyData.roofed_surface ? Number(propertyData.roofed_surface) : null;
  }

  // Fetch contract fields from operaciones (if operacion exists)
  let ipcAdjustment: string | null = null;
  let contractDuration: number | null = null;
  const operacionId = propertyData.operacion_id;
  if (operacionId) {
    const { data: opData } = await supabaseAdmin
      .from("operaciones")
      .select("ipc_adjustment, duration_months")
      .eq("id", operacionId)
      .single();

    if (opData) {
      ipcAdjustment = opData.ipc_adjustment ?? null;
      contractDuration = opData.duration_months ?? null;
    }
  }

  // Publication date from properties_read
  const publicationDate: string | null = propertyData.property_created_at ?? null;

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
      propertyId={propertyId}
      contactPhone={contactPhone}
      ownerId={propertyData.user_id}
      age={propertyData.age ?? null}
      propertyPlan={propertyPlan}
      isInmobiliaria={isInmobiliaria}
      isUnavailable={isUnavailable}
      isPendingVerification={isPendingVerification}
      suiteAmount={suiteAmount}
      roofedSurface={roofedSurface}
      ipcAdjustment={ipcAdjustment}
      publicationDate={publicationDate}
      visitDays={visitDays}
      visitHours={visitHours}
      ownerAccountType={propertyData.owner_account_type ?? null}
      contractDuration={contractDuration}
      orientation={orientation}
      showVerificationModal={showVerificationModal}
    />
  );
}
