"use client";
import { ChevronDown, ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Zone {
  id: string;
  name: string;
  slug: string;
  stateSlug: string;
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

function zonePath(zone: Zone): string {
  if (zone.slug) return `/alquileres/${zone.stateSlug}/${zone.slug}`;
  return `/alquileres/${zone.stateSlug}`;
}

function roomPath(zone: Zone, roomSlug: string): string {
  if (zone.slug) return `/alquileres/${roomSlug}/${zone.stateSlug}/${zone.slug}`;
  return `/alquileres/${roomSlug}/${zone.stateSlug}`;
}

interface CategoryItem {
  label: string;
  href: (zone: Zone) => string;
}

interface Category {
  number: string;
  title: string;
  items: CategoryItem[];
}

const categories: Category[] = [
  {
    number: "01",
    title: "Por tamaño",
    items: [
      { label: "Monoambiente", href: (z) => roomPath(z, "monoambiente") },
      { label: "2 ambientes", href: (z) => roomPath(z, "2-ambientes") },
      { label: "3 ambientes", href: (z) => roomPath(z, "3-ambientes") },
      { label: "4+ ambientes", href: (z) => `${zonePath(z)}?minAmbientes=4` },
    ],
  },
  {
    number: "02",
    title: "Por presupuesto",
    items: [
      { label: "Hasta $600.000", href: (z) => `${zonePath(z)}?maxPrice=600000` },
      { label: "Hasta $800.000", href: (z) => `${zonePath(z)}?maxPrice=800000` },
      { label: "Hasta $1.000.000", href: (z) => `${zonePath(z)}?maxPrice=1000000` },
      { label: "Hasta USD 1.000", href: (z) => `${zonePath(z)}?maxPrice=1300000` },
    ],
  },
  {
    number: "03",
    title: "Por superficie",
    items: [
      { label: "40–60 m²", href: (z) => `${zonePath(z)}?minSurface=40&maxSurface=60` },
      { label: "60–80 m²", href: (z) => `${zonePath(z)}?minSurface=60&maxSurface=80` },
      { label: "80–100 m²", href: (z) => `${zonePath(z)}?minSurface=80&maxSurface=100` },
      { label: "+100 m²", href: (z) => `${zonePath(z)}?minSurface=100` },
    ],
  },
  {
    number: "04",
    title: "Otras",
    items: [
      { label: "Mascotas", href: (z) => `${zonePath(z)}?tags=mascotas` },
      { label: "Pileta", href: (z) => `${zonePath(z)}?tags=pileta` },
      { label: "Amoblado", href: (z) => `${zonePath(z)}?tags=amoblado` },
      { label: "Alquiler dueño directo", href: (z) => `${zonePath(z)}?ownerType=dueno` },
    ],
  },
];

interface ExploreRentalsProps {
  title?: string;
}

const ExploreRentals = ({ title = "Alquileres para vos" }: ExploreRentalsProps) => {
  const [selectedZone, setSelectedZone] = useState("capital-federal");
  const [showZonePicker, setShowZonePicker] = useState(false);
  const activeZone = zones.find((z) => z.id === selectedZone) || zones[0];

  const CategoryBlock = ({ cat, large = false }: { cat: Category; large?: boolean }) => (
    <div>
      {/* Number + title */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-display text-3xl md:text-4xl font-black text-primary/75">
          {cat.number}
        </span>
        <h3 className="font-display text-lg font-bold text-foreground">
          {cat.title}
        </h3>
      </div>

      {/* Links */}
      <div>
        {cat.items.map((item) => (
          <Link
            key={item.label}
            href={item.href(activeZone)}
            className="group/link flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:pl-2 transition-all"
          >
            <span className={`${large ? "text-base" : "text-sm"} text-foreground group-hover/link:text-primary transition-colors`}>
              {item.label}
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover/link:text-primary group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-[18px]">
      <div className="container">
        {/* Title — editorial large */}
        <div className="mb-6 md:mb-8">
          <h2 className="font-display text-3xl md:text-[2.75rem] md:leading-tight font-black text-foreground">
            {title}
          </h2>
          <div className="h-1 w-12 bg-primary rounded-full mt-3" />
        </div>

        {/* Zone selector strip — desktop */}
        <div className="hidden md:flex items-center gap-4 mb-8">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold shrink-0">
            Barrio
          </span>
          <div className="h-px flex-1 bg-border" />
          <div className="flex gap-2 flex-wrap">
            {zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  selectedZone === zone.id
                    ? "text-primary underline underline-offset-4 decoration-2"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {zone.name}
              </button>
            ))}
          </div>
        </div>

        {/* Zone selector dropdown — mobile */}
        <div className="md:hidden mb-6 relative">
          <button
            onClick={() => setShowZonePicker(!showZonePicker)}
            className="inline-flex items-center gap-2 text-sm cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Buscar en</span>
            <span className="font-semibold text-primary">{activeZone.name}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                showZonePicker ? "rotate-180" : ""
              }`}
            />
          </button>

          {showZonePicker && (
            <div className="absolute left-0 top-full mt-2 bg-card rounded-xl border border-border shadow-lg p-2 z-20 min-w-[200px]">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => {
                    setSelectedZone(zone.id);
                    setShowZonePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    selectedZone === zone.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {zone.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Categories — equal width grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-accent/50 rounded-2xl p-6">
            <CategoryBlock cat={categories[0]} />
          </div>
          <div className="bg-accent/50 rounded-2xl p-6">
            <CategoryBlock cat={categories[1]} />
          </div>
          <div className="bg-accent/50 rounded-2xl p-6">
            <CategoryBlock cat={categories[2]} />
          </div>
          <div className="bg-accent/50 rounded-2xl p-6">
            <CategoryBlock cat={categories[3]} />
          </div>
        </div>

        {/* Popular searches */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
            {[
              { label: "alquiler barato", href: "/alquileres?maxPrice=700000" },
              { label: "alquiler en belgrano", href: "/alquileres/capital-federal/belgrano" },
              { label: "alquiler dueño directo", href: "/alquileres?ownerType=dueno" },
              { label: "alquiler en palermo", href: "/alquileres/capital-federal/palermo" },
              { label: "alquiler en CABA", href: "/alquileres/capital-federal" },
              { label: "alquileres sin garantía", href: "/alquileres?ownerType=dueno" },
            ].map((search, index, arr) => (
              <span key={search.label} className="flex items-center">
                <Link
                  href={search.href}
                  className="text-foreground hover:text-primary hover:underline transition-colors"
                >
                  {search.label}
                </Link>
                {index < arr.length - 1 && (
                  <span className="text-muted-foreground mx-1">·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreRentals;
