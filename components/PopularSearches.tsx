import Link from "next/link";
import { ChevronRight } from "lucide-react";

const popularSearches = [
  { label: "alquiler barato", href: "/buscar?maxPrice=700000" },
  { label: "alquiler en belgrano", href: "/buscar?location=Belgrano&locationId=24682" },
  { label: "dueño directo", href: "/buscar?propertyType=dueno" },
  { label: "alquiler en palermo", href: "/buscar?location=Palermo&locationId=24728" },
  { label: "alquiler en CABA", href: `/buscar?location=${encodeURIComponent("Capital Federal")}&stateId=146` },
  { label: "alquileres sin garantía", href: "/buscar?ownerType=dueno" },
];

interface PopularSearchesProps {
  title?: string;
}

const PopularSearches = ({ title = "Búsquedas populares" }: PopularSearchesProps) => {
  return (
    <div className="pt-4 border-t border-border">
      <div className="container flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm">
        <span className="text-muted-foreground font-medium">{title}:</span>
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
  );
};

export default PopularSearches;
