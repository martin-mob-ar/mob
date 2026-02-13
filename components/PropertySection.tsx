import { ChevronRight } from "lucide-react";
import Link from "next/link";
import PropertyCard, { Property } from "./PropertyCard";
interface PropertySectionProps {
  title: string;
  properties: Property[];
  showAll?: boolean;
}
const PropertySection = ({
  title,
  properties,
  showAll = true
}: PropertySectionProps) => {
  return <section className="py-[18px]">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-foreground text-xl">
            {title}
          </h2>
          {showAll && <Link href="/buscar" className="flex items-center gap-1 text-primary font-medium hover:underline uppercase tracking-wider text-xs">
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </Link>}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {properties.map(property => <PropertyCard key={property.id} property={property} compactVerified />)}
        </div>
      </div>
    </section>;
};
export default PropertySection;