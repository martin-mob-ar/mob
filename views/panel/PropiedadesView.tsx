import { Plus, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const propertyNew1 = "/assets/property-new-1.png";
const propertyNew2 = "/assets/property-new-5.png";
const propertyNew3 = "/assets/property-new-8.png";

type PropertyStatus = "activa" | "alquilada" | "borrador";

interface Property {
  id: string;
  name: string;
  location: string;
  price: string;
  status: PropertyStatus;
  image: string;
}

const mockProperties: Property[] = [
  {
    id: "1",
    name: "Loft Palermo Soho",
    location: "Palermo Soho, CABA",
    price: "$850 USD",
    status: "activa",
    image: propertyNew1,
  },
  {
    id: "2",
    name: "Piso Exclusivo Recoleta",
    location: "Recoleta, CABA",
    price: "$1,200 USD",
    status: "alquilada",
    image: propertyNew2,
  },
  {
    id: "3",
    name: "Estudio Moderno Belgrano",
    location: "Belgrano, CABA",
    price: "$650 USD",
    status: "borrador",
    image: propertyNew3,
  },
];

export interface PropiedadesViewProps {
  properties?: Property[];
}

const statusConfig: Record<PropertyStatus, { label: string; className: string }> = {
  activa: {
    label: "Activa",
    className: "bg-primary text-primary-foreground",
  },
  alquilada: {
    label: "Alquilada",
    className: "bg-green-500 text-white",
  },
  borrador: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground",
  },
};

const PropiedadesView = ({ properties: propsProp }: PropiedadesViewProps) => {
  const properties = propsProp || mockProperties;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Propiedades</h1>
        <Button className="rounded-full gap-2" asChild>
          <Link href="/subir-propiedad">
            <Plus className="h-4 w-4" />
            Nueva propiedad
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upload property card */}
        <Link
          href="/subir-propiedad"
          className="bg-card rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 min-h-[320px] group"
        >
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
            <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="font-display font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            Subir propiedad
          </p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            Recomendado por MOB
          </p>
        </Link>

        {/* Property cards */}
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-card rounded-2xl border border-border overflow-hidden group"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span
                className={`absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${
                  statusConfig[property.status].className
                }`}
              >
                {statusConfig[property.status].label}
              </span>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-display font-semibold text-lg">{property.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {property.location}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Precio</p>
                  <p className="font-display font-bold text-lg">{property.price}</p>
                </div>
                <Link
                  href={`/propiedad/${property.id}`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Ver detalle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropiedadesView;
