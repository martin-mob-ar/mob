import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server-component";
import { transformPropertyReadList } from "@/lib/transforms/property";
import SearchResults from "@/views/SearchResults";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mob.ar";

export const metadata: Metadata = {
  title: "Alquileres en Argentina - Departamentos y casas verificados",
  description:
    "Encontra alquileres verificados en CABA, GBA y toda Argentina. Departamentos, casas y PH con visitas, reservas y contratos 100% online. Sin comision inmobiliaria.",
  alternates: { canonical: "/alquileres" },
};

export default async function AlquileresPage() {
  let initialProperties;
  let initialTotal = 0;

  try {
    const supabase = await createClient();
    const { data, count } = await supabase
      .from("properties_read")
      .select("*", { count: "exact" })
      .eq("owner_verified", true)
      .order("sort_priority", { ascending: true })
      .order("listing_updated_at", { ascending: false })
      .range(0, 19);

    if (data && data.length > 0) {
      initialProperties = transformPropertyReadList(data);
      initialTotal = count || data.length;
    }
  } catch {
    // Falls back to empty on error
  }

  // Build ItemList JSON-LD for initial server-rendered properties
  const itemListJsonLd = initialProperties && initialProperties.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Alquileres en Argentina",
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
          lastUpdated={new Date().toISOString()}
        />
      </Suspense>
    </>
  );
}
