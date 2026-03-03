"use client";
import { MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Zone {
  id: string;
  name: string;
  locationId?: number;
  stateId?: number;
}

const zones: Zone[] = [
  { id: "capital-federal", name: "Capital Federal", stateId: 146 },
  { id: "palermo", name: "Palermo", locationId: 24728 },
  { id: "recoleta", name: "Recoleta", locationId: 24681 },
  { id: "belgrano", name: "Belgrano", locationId: 24682 },
  { id: "caballito", name: "Caballito", locationId: 24690 },
  { id: "nuñez", name: "Núñez", locationId: 24721 },
  { id: "villa-urquiza", name: "Villa Urquiza", locationId: 24753 },
  { id: "almagro", name: "Almagro", locationId: 24673 },
  { id: "san-telmo", name: "San Telmo", locationId: 24738 },
];

function buildLocationParam(zone: Zone): string {
  const loc = encodeURIComponent(zone.name);
  if (zone.stateId) return `location=${loc}&stateId=${zone.stateId}`;
  return `location=${loc}&locationId=${zone.locationId}`;
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
        href: (z) => `/buscar?${buildLocationParam(z)}&minAmbientes=1&maxAmbientes=1`,
      },
      {
        label: "2 ambientes",
        href: (z) => `/buscar?${buildLocationParam(z)}&minAmbientes=2&maxAmbientes=2`,
      },
      {
        label: "3 ambientes",
        href: (z) => `/buscar?${buildLocationParam(z)}&minAmbientes=3&maxAmbientes=3`,
      },
      {
        label: "4+ ambientes",
        href: (z) => `/buscar?${buildLocationParam(z)}&minAmbientes=4`,
      },
    ],
  },
  budget: {
    title: "Por presupuesto",
    items: [
      {
        label: "Hasta 600.000",
        href: (z) => `/buscar?${buildLocationParam(z)}&maxPrice=600000`,
      },
      {
        label: "Hasta 800.000",
        href: (z) => `/buscar?${buildLocationParam(z)}&maxPrice=800000`,
      },
      {
        label: "Hasta 1.000.000",
        href: (z) => `/buscar?${buildLocationParam(z)}&maxPrice=1000000`,
      },
      {
        label: "Hasta USD 1.000",
        href: (z) => `/buscar?${buildLocationParam(z)}&maxPrice=1300000`,
      },
    ],
  },
  surface: {
    title: "Por superficie",
    items: [
      {
        label: "Entre 40 y 60m²",
        href: (z) => `/buscar?${buildLocationParam(z)}&minSurface=40&maxSurface=60`,
      },
      {
        label: "Entre 60 y 80m²",
        href: (z) => `/buscar?${buildLocationParam(z)}&minSurface=60&maxSurface=80`,
      },
      {
        label: "Entre 80 y 100m²",
        href: (z) => `/buscar?${buildLocationParam(z)}&minSurface=80&maxSurface=100`,
      },
      {
        label: "Más de 100m²",
        href: (z) => `/buscar?${buildLocationParam(z)}&minSurface=100`,
      },
    ],
  },
  highlights: {
    title: "Destacados",
    items: [
      {
        label: "Con terraza",
        href: (z) => `/buscar?${buildLocationParam(z)}&tagIds=25,114`,
      },
      {
        label: "Con jardín",
        href: (z) => `/buscar?${buildLocationParam(z)}&tagIds=19`,
      },
      {
        label: "Con pileta",
        href: (z) => `/buscar?${buildLocationParam(z)}&tagIds=51,164`,
      },
      {
        label: "A estrenar",
        href: (z) => `/buscar?${buildLocationParam(z)}&maxAge=0`,
      },
    ],
  },
};

const popularSearches = [
  { label: "alquiler barato", href: "/buscar?maxPrice=700000" },
  { label: "alquiler en belgrano", href: "/buscar?location=Belgrano&locationId=24682" },
  { label: "dueño directo", href: "/buscar?propertyType=dueno" },
  { label: "alquiler en palermo", href: "/buscar?location=Palermo&locationId=24728" },
  { label: "alquiler en CABA", href: `/buscar?location=${encodeURIComponent("Capital Federal")}&stateId=146` },
];

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
    <MapPin className="h-3.5 w-3.5" />
    {zone.name}
  </button>
);

const ExploreRentals = () => {
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
        <div className="bg-background rounded-2xl border border-border shadow-sm p-6 md:p-8 text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Alquileres para vos
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            href="/buscar"
            className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mb-6"
          >
            Ver alquileres recientes
            <ChevronRight className="h-4 w-4" />
          </Link>

          {/* Popular Searches Footer */}
          <div className="pt-6 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm">
              <span className="text-muted-foreground font-medium">Búsquedas populares:</span>
              {popularSearches.map((search, index) => (
                <span key={search.label} className="flex items-center">
                  <Link
                    href={search.href}
                    className="text-foreground hover:text-primary hover:underline transition-colors"
                  >
                    {search.label}
                  </Link>
                  {index < popularSearches.length - 1 && (
                    <span className="text-muted-foreground mx-1">·</span>
                  )}
                </span>
              ))}
              <span className="text-muted-foreground mx-1">·</span>
              <Link
                href="/buscar"
                className="text-primary font-medium hover:underline flex items-center gap-0.5"
              >
                ver más
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ExploreRentals;
