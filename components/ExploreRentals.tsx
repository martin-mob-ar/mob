"use client";
import { MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
const zones = [{
  id: "palermo",
  name: "Palermo"
}, {
  id: "recoleta",
  name: "Recoleta"
}, {
  id: "belgrano",
  name: "Belgrano"
}, {
  id: "caballito",
  name: "Caballito"
}, {
  id: "nuñez",
  name: "Núñez"
}, {
  id: "villa-urquiza",
  name: "Villa Urquiza"
}, {
  id: "almagro",
  name: "Almagro"
}, {
  id: "san-telmo",
  name: "San Telmo"
}];
const categories = {
  size: {
    title: "Por tamaño",
    items: ["Monoambiente", "2 ambientes", "3 ambientes", "4+ ambientes"]
  },
  budget: {
    title: "Por presupuesto",
    items: ["Hasta $300.000", "Hasta $500.000", "Hasta $800.000", "Hasta USD 1.000"]
  },
  lifestyle: {
    title: "Por estilo de vida",
    items: ["Con balcón", "Pet friendly", "Amoblado", "Luminoso"]
  },
  highlights: {
    title: "Destacados",
    items: ["Con terraza", "Con jardín", "Con pileta", "A estrenar"]
  }
};
const popularSearches = ["alquiler luminoso", "alquiler con balcón", "dueño directo", "alquiler barato", "alquiler en CABA"];
const ExploreRentals = () => {
  const [selectedZone, setSelectedZone] = useState("palermo");
  return <section className="py-[18px]">
      <div className="container">
        <div className="bg-background rounded-2xl border border-border shadow-sm p-6 md:p-8 text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Explorá alquileres
              </h2>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Alquiler
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Búsquedas frecuentes y útiles
            </p>
          </div>

          {/* Zone Navigation */}
          <div className="flex justify-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {zones.map(zone => <button key={zone.id} onClick={() => setSelectedZone(zone.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${selectedZone === zone.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"}`}>
                <MapPin className="h-3.5 w-3.5" />
                {zone.name}
              </button>)}
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(categories).map(([key, category]) => <div key={key} className="space-y-3">
                <h3 className="font-medium text-foreground text-sm uppercase tracking-wider">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.items.map(item => <li key={item}>
                      <Link href={`/buscar?tipo=alquiler&zona=${selectedZone}&q=${encodeURIComponent(item)}`} className="text-muted-foreground text-sm hover:text-primary hover:underline transition-colors">
                        {item}
                      </Link>
                    </li>)}
                </ul>
              </div>)}
          </div>

          {/* CTA */}
          <Link href="/buscar?tipo=alquiler" className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mb-6">
            Ver alquileres recientes
            <ChevronRight className="h-4 w-4" />
          </Link>

          {/* Popular Searches Footer */}
          <div className="pt-6 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm">
              <span className="text-muted-foreground font-medium">Búsquedas populares:</span>
              {popularSearches.map((search, index) => <span key={search} className="flex items-center">
                  <Link href={`/buscar?q=${encodeURIComponent(search)}`} className="text-foreground hover:text-primary hover:underline transition-colors">
                    {search}
                  </Link>
                  {index < popularSearches.length - 1 && <span className="text-muted-foreground mx-1">·</span>}
                </span>)}
              <span className="text-muted-foreground mx-1">·</span>
              <Link href="/buscar" className="text-primary font-medium hover:underline flex items-center gap-0.5">
                ver más
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default ExploreRentals;