import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server-component";
import { supabaseAdmin } from "@/lib/supabase/server";
import { transformPropertyReadList } from "@/lib/transforms/property";
import SearchResults from "@/views/SearchResults";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const revalidate = 3600; // ISR: revalidate every hour

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

interface PageProps {
  params: Promise<{ state: string; location: string }>;
}

async function getLocationData(stateSlug: string, locationSlug: string) {
  const { data: state } = await supabaseAdmin
    .from("tokko_state")
    .select("id, name, slug")
    .eq("slug", stateSlug)
    .single();

  if (!state) return null;

  const { data: location } = await supabaseAdmin
    .from("tokko_location")
    .select("id, name, slug")
    .eq("slug", locationSlug)
    .eq("state_id", state.id)
    .single();

  if (!location) return null;

  return { state, location };
}

export async function generateStaticParams() {
  const { data: propsWithLoc } = await supabaseAdmin
    .from("properties_read")
    .select("location_id")
    .eq("owner_verified", true);

  if (!propsWithLoc) return [];

  const locationIds = [...new Set(propsWithLoc.map((p) => p.location_id).filter(Boolean))];
  if (locationIds.length === 0) return [];

  const { data: locations } = await supabaseAdmin
    .from("tokko_location")
    .select("id, slug, state_id, tokko_state!state_id(slug)")
    .in("id", locationIds as number[]);

  if (!locations) return [];

  return locations
    .filter((l: any) => l.slug && l.tokko_state?.slug)
    .map((l: any) => ({
      state: l.tokko_state.slug as string,
      location: l.slug as string,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug, location: locationSlug } = await params;
  const data = await getLocationData(stateSlug, locationSlug);

  if (!data) {
    return { title: "Alquileres no encontrados" };
  }

  const { state, location } = data;
  const title = `Alquileres en ${location.name}, ${state.name}`;
  const description = `Departamentos, casas y PH en alquiler en ${location.name}, ${state.name}. Propiedades verificadas, visitas online, reservas y contratos digitales en Mob.`;

  return {
    title,
    description,
    alternates: { canonical: `/alquileres/${state.slug}/${location.slug}` },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { state: stateSlug, location: locationSlug } = await params;
  const data = await getLocationData(stateSlug, locationSlug);

  if (!data) {
    notFound();
  }

  const { state, location } = data;
  const supabase = await createClient();

  const { data: properties, count } = await supabase
    .from("properties_read")
    .select("*", { count: "exact" })
    .eq("owner_verified", true)
    .eq("location_id", location.id)
    .order("sort_priority", { ascending: true })
    .order("property_created_at", { ascending: false })
    .range(0, 19);

  const initialProperties = properties && properties.length > 0
    ? transformPropertyReadList(properties)
    : undefined;
  const initialTotal = count || 0;

  const itemListJsonLd = initialProperties && initialProperties.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Alquileres en ${location.name}, ${state.name}`,
    numberOfItems: initialTotal,
    itemListElement: initialProperties.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${APP_URL}/propiedad/${p.slug || p.id}`,
      name: p.address || "Propiedad en alquiler",
    })),
  } : null;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", href: "/" },
          { name: "Alquileres", href: "/alquileres" },
          { name: state.name!, href: `/alquileres/${state.slug}` },
          { name: location.name!, href: `/alquileres/${state.slug}/${location.slug}` },
        ]}
      />
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
          basePath={`/alquileres/${state.slug}/${location.slug}`}
          initialLocationSeed={{
            stateId: state.id,
            stateName: state.name!,
            locationId: location.id,
            locationName: location.name!,
            locationDisplay: `${state.name}, Argentina`,
          }}
          pageTitle={`Alquileres en ${location.name}, ${state.name}`}
          lastUpdated={new Date().toISOString()}
        />
      </Suspense>
    </>
  );
}
