import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server-component";
import { supabaseAdmin } from "@/lib/supabase/server";
import { transformPropertyReadList } from "@/lib/transforms/property";
import SearchResults from "@/views/SearchResults";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { PROPERTY_TYPES, ROOM_COUNTS, type PropertyTypeSlug, type RoomSlug } from "./programmatic-constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export const programmaticRevalidate = 3600;

interface ProgrammaticPageProps {
  propertyTypeSlug?: PropertyTypeSlug;
  roomSlug?: RoomSlug;
  stateSlug?: string;
  locationSlug?: string;
}

export default async function ProgrammaticSearchPage({
  propertyTypeSlug,
  roomSlug,
  stateSlug,
  locationSlug,
}: ProgrammaticPageProps) {
  const typeInfo = propertyTypeSlug ? PROPERTY_TYPES[propertyTypeSlug] : null;
  const roomInfo = roomSlug ? ROOM_COUNTS[roomSlug] : null;

  // Resolve state
  let stateData: { id: number; name: string; slug: string } | null = null;
  if (stateSlug) {
    const { data } = await supabaseAdmin
      .from("tokko_state")
      .select("id, name, slug")
      .eq("slug", stateSlug)
      .single();
    if (!data) notFound();
    stateData = data;
  }

  // Resolve location
  let locationData: { id: number; name: string; slug: string } | null = null;
  if (locationSlug && stateData) {
    const { data } = await supabaseAdmin
      .from("tokko_location")
      .select("id, name, slug")
      .eq("slug", locationSlug)
      .eq("state_id", stateData.id)
      .single();
    if (!data) notFound();
    locationData = data;
  }

  // Resolve property type ID
  let propertyTypeId: number | null = null;
  if (propertyTypeSlug) {
    const { data } = await supabaseAdmin
      .from("tokko_property_type")
      .select("id")
      .eq("slug", propertyTypeSlug)
      .single();
    if (data) propertyTypeId = data.id;
  }

  // Build property query
  const supabase = await createClient();
  let query = supabase
    .from("properties_read")
    .select("*", { count: "exact" })
    .eq("owner_verified", true);

  if (propertyTypeId) query = query.eq("property_type_id", propertyTypeId);
  if (roomInfo) query = query.eq("room_amount", roomInfo.count);

  if (locationData) {
    query = query.eq("location_id", locationData.id);
  } else if (stateData) {
    const { data: stateLocations } = await supabaseAdmin
      .from("tokko_location")
      .select("id")
      .eq("state_id", stateData.id);
    if (stateLocations && stateLocations.length > 0) {
      query = query.in("location_id", stateLocations.map((l) => l.id));
    }
  }

  const { data: properties, count } = await query
    .order("sort_priority", { ascending: true })
    .order("property_created_at", { ascending: false })
    .range(0, 19);

  const initialProperties = properties && properties.length > 0
    ? transformPropertyReadList(properties)
    : undefined;
  const initialTotal = count || 0;

  // Build breadcrumbs
  const breadcrumbs: { name: string; href: string }[] = [
    { name: "Inicio", href: "/" },
    { name: "Alquileres", href: "/alquileres" },
  ];
  const pathSegments = ["/alquileres"];

  if (typeInfo) {
    pathSegments.push(propertyTypeSlug!);
    breadcrumbs.push({ name: typeInfo.display, href: pathSegments.join("/") });
  }
  if (roomInfo) {
    pathSegments.push(roomSlug!);
    breadcrumbs.push({ name: roomInfo.titleLabel, href: pathSegments.join("/") });
  }
  if (stateData) {
    pathSegments.push(stateData.slug);
    breadcrumbs.push({ name: stateData.name!, href: pathSegments.join("/") });
  }
  if (locationData) {
    pathSegments.push(locationData.slug);
    breadcrumbs.push({ name: locationData.name!, href: pathSegments.join("/") });
  }

  const basePath = pathSegments.join("/");

  // Build page title
  const locationLabel = locationData && stateData
    ? `${locationData.name}, ${stateData.name}`
    : stateData?.name || "Argentina";

  let pageTitle: string;
  if (typeInfo && roomInfo) {
    pageTitle = `${typeInfo.display} ${roomInfo.label} en alquiler en ${locationLabel}`;
  } else if (typeInfo) {
    pageTitle = `${typeInfo.display} en alquiler en ${locationLabel}`;
  } else if (roomInfo) {
    pageTitle = `Alquileres de ${roomInfo.label} en ${locationLabel}`;
  } else {
    pageTitle = `Alquileres en ${locationLabel}`;
  }

  // ItemList JSON-LD
  const itemListJsonLd = initialProperties && initialProperties.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: pageTitle,
    numberOfItems: initialTotal,
    itemListElement: initialProperties.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${APP_URL}/propiedad/${p.slug || p.id}`,
      name: p.address || "Propiedad en alquiler",
    })),
  } : null;

  // Build location seed for SearchResults
  const initialLocationSeed = locationData && stateData
    ? {
        stateId: stateData.id,
        stateName: stateData.name!,
        locationId: locationData.id,
        locationName: locationData.name!,
        locationDisplay: `${stateData.name}, Argentina`,
      }
    : stateData
      ? { stateId: stateData.id, stateName: stateData.name! }
      : undefined;

  return (
    <>
      {initialTotal < 2 && (
        <meta name="robots" content="noindex, follow" />
      )}
      <BreadcrumbJsonLd items={breadcrumbs} />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/<\//g, '<\\/') }}
        />
      )}
      <Suspense>
        <SearchResults
          initialProperties={initialProperties}
          initialTotal={initialTotal}
          basePath={basePath}
          initialLocationSeed={initialLocationSeed}
          initialPropertyTypeNames={typeInfo ? [typeInfo.dbName] : undefined}
          initialAmbientes={roomInfo ? { min: roomInfo.count, max: roomInfo.count } : undefined}
          pageTitle={pageTitle}
          lastUpdated={new Date().toISOString()}
        />
      </Suspense>
    </>
  );
}
