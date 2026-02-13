import { MapPin, ArrowRight, RefreshCw, User, Users, MessageCircle } from "lucide-react";
import Link from "next/link";
const propertyNew1 = "/assets/property-new-1.png";
const propertyNew2 = "/assets/property-new-2.png";
const propertyNew3 = "/assets/property-new-3.png";
const propertyNew4 = "/assets/property-new-4.png";
const propertyNew5 = "/assets/property-new-5.png";
const propertyNew6 = "/assets/property-new-6.png";

type PropertyStatus = "activa" | "alquilada" | "reservada";

interface Property {
  id: string;
  name: string;
  location: string;
  price: string;
  status: PropertyStatus;
  image: string;
  propietario: string;
  tokkoId: string;
  interestedCount: number;
  openTickets: number;
}

const mockProperties: Property[] = [
  {
    id: "1",
    name: "Loft Palermo Soho",
    location: "Palermo Soho, CABA",
    price: "$850 USD",
    status: "activa",
    image: propertyNew1,
    propietario: "Juan Pérez",
    tokkoId: "TK-001234",
    interestedCount: 0,
    openTickets: 0,
  },
  {
    id: "2",
    name: "Piso Exclusivo Recoleta",
    location: "Recoleta, CABA",
    price: "$1,200 USD",
    status: "alquilada",
    image: propertyNew2,
    propietario: "María García",
    tokkoId: "TK-001235",
    interestedCount: 3,
    openTickets: 1,
  },
  {
    id: "3",
    name: "Estudio Moderno Belgrano",
    location: "Belgrano, CABA",
    price: "$650 USD",
    status: "activa",
    image: propertyNew3,
    propietario: "Carlos López",
    tokkoId: "TK-001236",
    interestedCount: 2,
    openTickets: 0,
  },
  {
    id: "4",
    name: "Depto 3 amb Caballito",
    location: "Caballito, CABA",
    price: "$720 USD",
    status: "reservada",
    image: propertyNew4,
    propietario: "Ana Martínez",
    tokkoId: "TK-001237",
    interestedCount: 0,
    openTickets: 0,
  },
  {
    id: "5",
    name: "PH Luminoso Villa Crespo",
    location: "Villa Crespo, CABA",
    price: "$980 USD",
    status: "alquilada",
    image: propertyNew5,
    propietario: "Roberto Fernández",
    tokkoId: "TK-001238",
    interestedCount: 0,
    openTickets: 0,
  },
  {
    id: "6",
    name: "Monoambiente Núñez",
    location: "Núñez, CABA",
    price: "$520 USD",
    status: "activa",
    image: propertyNew6,
    propietario: "Laura Sánchez",
    tokkoId: "TK-001239",
    interestedCount: 2,
    openTickets: 0,
  },
];

export interface InmobiliariaPropiedadesViewProps {
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
  reservada: {
    label: "Reservada",
    className: "bg-amber-500 text-white",
  },
};

const InmobiliariaPropiedadesView = ({ properties: propsProp }: InmobiliariaPropiedadesViewProps) => {
  const properties = propsProp || mockProperties;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Propiedades</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sincronizadas desde <span className="font-semibold text-foreground">Tokko Broker</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Property cards */}
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/gestion-inmobiliaria/propiedad/${property.id}`}
            className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all"
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
              <span className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-mono bg-background/80 backdrop-blur-sm text-foreground">
                {property.tokkoId}
              </span>
              
              {/* Badges for interested and tickets */}
              <div className="absolute bottom-3 right-3 flex gap-2">
                {property.interestedCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-lg">
                    <Users className="h-3 w-3" />
                    {property.interestedCount}
                  </span>
                )}
                {property.openTickets > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-destructive text-destructive-foreground shadow-lg">
                    <MessageCircle className="h-3 w-3" />
                    {property.openTickets}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{property.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {property.location}
              </div>
              
              {/* Propietario */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                <User className="h-3.5 w-3.5" />
                <span className="text-xs uppercase tracking-wider">Propietario:</span>
                <span className="font-medium text-foreground">{property.propietario}</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Precio</p>
                  <p className="font-display font-bold text-lg">{property.price}</p>
                </div>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:underline">
                  Ver detalle
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default InmobiliariaPropiedadesView;
