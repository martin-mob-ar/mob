"use client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import PopularSearches from "@/components/PopularSearches";

interface Zone {
  id: string;
  name: string;
  slug: string;         // location slug (empty for state-level zones)
  stateSlug: string;    // state slug for SEO path
}

const zones: Zone[] = [
  { id: "capital-federal", name: "Capital Federal", slug: "", stateSlug: "capital-federal" },
  { id: "palermo", name: "Palermo", slug: "palermo", stateSlug: "capital-federal" },
  { id: "recoleta", name: "Recoleta", slug: "recoleta", stateSlug: "capital-federal" },
  { id: "belgrano", name: "Belgrano", slug: "belgrano", stateSlug: "capital-federal" },
  { id: "caballito", name: "Caballito", slug: "caballito", stateSlug: "capital-federal" },
  { id: "nuñez", name: "Núñez", slug: "nunez", stateSlug: "capital-federal" },
  { id: "villa-urquiza", name: "Villa Urquiza", slug: "villa-urquiza", stateSlug: "capital-federal" },
  { id: "almagro", name: "Almagro", slug: "almagro", stateSlug: "capital-federal" },
  { id: "san-telmo", name: "San Telmo", slug: "san-telmo", stateSlug: "capital-federal" },
];

/** SEO-friendly base path for a zone: /alquileres/capital-federal or /alquileres/capital-federal/palermo */
function zonePath(zone: Zone): string {
  if (zone.slug) return `/alquileres/${zone.stateSlug}/${zone.slug}`;
  return `/alquileres/${zone.stateSlug}`;
}

/** Programmatic SEO path for room count + zone: /alquileres/2-ambientes/capital-federal/palermo */
function roomPath(zone: Zone, roomSlug: string): string {
  if (zone.slug) return `/alquileres/${roomSlug}/${zone.stateSlug}/${zone.slug}`;
  return `/alquileres/${roomSlug}/${zone.stateSlug}`;
}

interface CategoryItem {
  label: string;
  href: (zone: Zone) => string;
}

interface Category {
  title: string;
  items: CategoryItem[];
}

const categories: Record<string, Category> = {
  size: {
    title: "Por tamaño",
    items: [
      {
        label: "Monoambiente",
        href: (z) => roomPath(z, "monoambiente"),
      },
      {
        label: "2 ambientes",
        href: (z) => roomPath(z, "2-ambientes"),
      },
      {
        label: "3 ambientes",
        href: (z) => roomPath(z, "3-ambientes"),
      },
      {
        label: "4+ ambientes",
        href: (z) => `${zonePath(z)}?minAmbientes=4`,
      },
    ],
  },
  budget: {
    title: "Por presupuesto",
    items: [
      {
        label: "Hasta 600.000",
        href: (z) => `${zonePath(z)}?maxPrice=600000`,
      },
      {
        label: "Hasta 800.000",
        href: (z) => `${zonePath(z)}?maxPrice=800000`,
      },
      {
        label: "Hasta 1.000.000",
        href: (z) => `${zonePath(z)}?maxPrice=1000000`,
      },
      {
        label: "Hasta USD 1.000",
        href: (z) => `${zonePath(z)}?maxPrice=1300000`,
      },
    ],
  },
  surface: {
    title: "Por superficie",
    items: [
      {
        label: "Entre 40 y 60m²",
        href: (z) => `${zonePath(z)}?minSurface=40&maxSurface=60`,
      },
      {
        label: "Entre 60 y 80m²",
        href: (z) => `${zonePath(z)}?minSurface=60&maxSurface=80`,
      },
      {
        label: "Entre 80 y 100m²",
        href: (z) => `${zonePath(z)}?minSurface=80&maxSurface=100`,
      },
      {
        label: "Más de 100m²",
        href: (z) => `${zonePath(z)}?minSurface=100`,
      },
    ],
  },
  highlights: {
    title: "Destacados",
    items: [
      {
        label: "Con terraza",
        href: (z) => `${zonePath(z)}?tagIds=25,114`,
      },
      {
        label: "Con jardín",
        href: (z) => `${zonePath(z)}?tagIds=19`,
      },
      {
        label: "Con pileta",
        href: (z) => `${zonePath(z)}?tagIds=51,164`,
      },
      {
        label: "A estrenar",
        href: (z) => `${zonePath(z)}?maxAge=0`,
      },
    ],
  },
};

const ZoneButton = ({
  zone,
  isSelected,
  onClick,
}: {
  zone: Zone;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
      isSelected
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
    }`}
  >
    {zone.name}
  </button>
);

interface ExploreRentalsProps {
  title?: string;
}

const ExploreRentals = ({ title = "Alquileres para vos" }: ExploreRentalsProps) => {
  const [selectedZone, setSelectedZone] = useState("capital-federal");
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeZone = zones.find((z) => z.id === selectedZone) || zones[0];

  // Start scrolled to the middle set so user can scroll both directions
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth / 3;
    }
  }, []);

  // Infinite scroll: when nearing edges, jump to the equivalent position in the middle set
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const third = el.scrollWidth / 3;
    if (el.scrollLeft >= third * 2) {
      el.scrollLeft -= third;
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += third;
    }
  }, []);

  return (
    <section className="py-[18px]">
      <div className="container">
        <div className="bg-background rounded-xl border border-border shadow-sm p-6 md:px-8 md:pt-8 md:pb-6 text-center">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {title}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Búsquedas frecuentes y útiles
            </p>
          </div>

          {/* Zone Navigation - Desktop: centered wrap, Mobile: infinite scroll */}
          <div className="hidden md:flex justify-center gap-2 flex-wrap pb-4 mb-6">
            {zones.map((zone) => (
              <ZoneButton
                key={zone.id}
                zone={zone}
                isSelected={selectedZone === zone.id}
                onClick={() => setSelectedZone(zone.id)}
              />
            ))}
          </div>

          <div className="md:hidden overflow-hidden pb-4 mb-6 relative">
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-background to-transparent" />
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-2 overflow-x-auto scrollbar-hide"
            >
              {/* Render zones 3x for seamless infinite loop */}
              {[...zones, ...zones, ...zones].map((zone, i) => (
                <ZoneButton
                  key={`${zone.id}-${i}`}
                  zone={zone}
                  isSelected={selectedZone === zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                />
              ))}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {Object.entries(categories).map(([key, category]) => (
              <div key={key} className="space-y-3">
                <h3 className="font-medium text-foreground text-sm uppercase tracking-wider">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href(activeZone)}
                        className="text-muted-foreground text-sm hover:text-primary hover:underline transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/alquileres"
            className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mb-4"
          >
            Ver alquileres recientes
            <ChevronRight className="h-4 w-4" />
          </Link>

          {/* Popular Searches Footer */}
          <PopularSearches title="Búsquedas populares" />
        </div>
      </div>
    </section>
  );
};
export default ExploreRentals;
