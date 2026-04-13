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
  params: Promise<{ state: string }>;
}

async function getStateData(stateSlug: string) {
  const { data: state } = await supabaseAdmin
    .from("tokko_state")
    .select("id, name, slug")
    .eq("slug", stateSlug)
    .single();

  return state;
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
    .select("state_id, tokko_state!state_id(slug)")
    .in("id", locationIds as number[]);

  if (!locations) return [];

  const stateSlugs = [...new Set(
    locations.map((l: any) => l.tokko_state?.slug).filter(Boolean)
  )];

  return stateSlugs.map((slug) => ({ state: slug as string }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = await getStateData(stateSlug);

  if (!state) {
    return { title: "Alquileres no encontrados" };
  }

  const title = `Alquileres en ${state.name}`;
  const description = `Encontra departamentos, casas y PH en alquiler en ${state.name}. Propiedades verificadas con visitas, reservas y contratos 100% online en Mob.`;

  return {
    title,
    description,
    alternates: { canonical: `/alquileres/${state.slug}` },
  };
}

export default async function StatePage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = await getStateData(stateSlug);

  if (!state) {
    notFound();
  }

  // Get location IDs in this state for initial property query
  const { data: stateLocations } = await supabaseAdmin
    .from("tokko_location")
    .select("id")
    .eq("state_id", state.id);

  let initialProperties;
  let initialTotal = 0;

  if (stateLocations && stateLocations.length > 0) {
    const supabase = await createClient();
    const locationIds = stateLocations.map((l) => l.id);
    const { data, count } = await supabase
      .from("properties_read")
      .select("*", { count: "exact" })
      .eq("owner_verified", true)
      .in("location_id", locationIds)
      .order("sort_priority", { ascending: true })
      .order("listing_updated_at", { ascending: false })
      .range(0, 19);

    if (data && data.length > 0) {
      initialProperties = transformPropertyReadList(data);
      initialTotal = count || data.length;
    }
  }

  const itemListJsonLd = initialProperties && initialProperties.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Alquileres en ${state.name}`,
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
          basePath={`/alquileres/${state.slug}`}
          initialLocationSeed={{
            stateId: state.id,
            stateName: state.name!,
          }}
          pageTitle={`Alquileres en ${state.name}`}
          lastUpdated={new Date().toISOString()}
        />
      </Suspense>
    </>
  );
}
