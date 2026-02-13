import { Plus, MapPin, DollarSign, MessageCircle, Users } from "lucide-react";
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
  openTickets: number;
  interestedCount: number;
}

const mockProperties: Property[] = [
  {
    id: "1",
    name: "Loft Palermo Soho",
    location: "Palermo Soho, CABA",
    price: "$850 USD",
    status: "alquilada",
    image: propertyNew1,
    openTickets: 2,
    interestedCount: 0,
  },
  {
    id: "2",
    name: "Piso Exclusivo Recoleta",
    location: "Recoleta, CABA",
    price: "$1,200 USD",
    status: "activa",
    image: propertyNew2,
    openTickets: 0,
    interestedCount: 3,
  },
  {
    id: "3",
    name: "Estudio Moderno Belgrano",
    location: "Belgrano, CABA",
    price: "$650 USD",
    status: "borrador",
    image: propertyNew3,
    openTickets: 0,
    interestedCount: 1,
  },
];

export interface ResumenViewProps {
  properties?: Property[];
}

const statusConfig: Record<PropertyStatus, { label: string; className: string; dotColor: string }> = {
  activa: {
    label: "Activa",
    className: "bg-primary/10 text-primary",
    dotColor: "bg-primary",
  },
  alquilada: {
    label: "Alquilada",
    className: "bg-green-500/10 text-green-600",
    dotColor: "bg-green-500",
  },
  borrador: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
};

const ResumenView = ({ properties: propsProp }: ResumenViewProps) => {
  const properties = propsProp || mockProperties;
  const totalIncome = 2050; // Mock: sum of rented properties

  return (
    <div className="space-y-8">
      {/* Header with income metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Mis propiedades</h1>
          <p className="text-muted-foreground mt-1">
            Gestioná tus propiedades desde un solo lugar
          </p>
        </div>

        {/* Monthly income card - subtle, not protagonist */}
        <div className="flex items-center gap-4 px-5 py-3 bg-card rounded-xl border border-border">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ingresos del mes</p>
            <p className="font-display font-bold text-lg text-success">${totalIncome.toLocaleString()} USD</p>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upload property card - always first */}
        <Link
          href="/subir-propiedad"
          className="bg-card rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center p-8 min-h-[340px] group hover:shadow-lg"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <p className="font-display font-semibold text-lg text-foreground">
            Subí tu propiedad
          </p>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-[180px]">
            Publicá y empezá a recibir consultas
          </p>
        </Link>

        {/* Property cards */}
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/gestion/propiedad/${property.id}`}
            className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all relative"
          >
            {/* Badges container */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              {/* Interested badge */}
              {property.interestedCount > 0 && (
                <div className="h-7 px-2 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {property.interestedCount}
                </div>
              )}
              {/* Tickets badge */}
              {property.openTickets > 0 && (
                <div className="h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold shadow-lg">
                  {property.openTickets}
                </div>
              )}
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Status indicator overlay */}
              <div className="absolute bottom-3 left-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${statusConfig[property.status].className}`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusConfig[property.status].dotColor}`} />
                  {statusConfig[property.status].label}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                {property.name}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {property.location}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Alquiler mensual</p>
                  <p className="font-display font-bold text-lg">{property.price}</p>
                </div>
                {property.openTickets > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {property.openTickets} tickets
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResumenView;
