"use client";

import Link from "next/link";
import {
  Plus,
  MapPin,
  DollarSign,
  User,
} from "lucide-react";
import type { OwnerProperty, OperacionStatus } from "@/lib/transforms/property";

const statusConfig: Record<
  OperacionStatus,
  { label: string; className: string; dotColor: string }
> = {
  rented: {
    label: "Alquilada",
    className: "bg-green-500/10 text-green-600",
    dotColor: "bg-green-500",
  },
  available: {
    label: "Disponible",
    className: "bg-primary text-primary-foreground",
    dotColor: "bg-primary-foreground",
  },
  finished: {
    label: "Finalizado",
    className: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-destructive/10 text-destructive",
    dotColor: "bg-destructive",
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface OwnerSectionProps {
  properties: OwnerProperty[];
  mockMode?: boolean;
}

const OwnerSection = ({ properties, mockMode }: OwnerSectionProps) => {
  const rentedProperties = properties.filter((p) => p.status === "rented");
  const totalIncome = rentedProperties.reduce(
    (sum, p) => sum + (p.price || 0),
    0
  );
  const mainCurrency =
    rentedProperties[0]?.currency || properties[0]?.currency || "USD";

  return (
    <div className="space-y-8">
      {/* Header with income metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            Mis propiedades
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestioná tus propiedades desde un solo lugar
          </p>
        </div>

        {rentedProperties.length > 0 && (
          <div className="flex items-center gap-4 px-5 py-3 bg-card rounded-xl border border-border">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Ingresos del mes
              </p>
              <p className="font-display font-bold text-lg text-success">
                ${totalIncome.toLocaleString()} {mainCurrency}
              </p>
            </div>
          </div>
        )}
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
        {properties.map((property) => {
          const config = statusConfig[property.status];
          return (
            <Link
              key={property.id}
              href={`/gestion/propiedad/${property.id}${mockMode ? "?mock=true" : ""}`}
              className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all relative"
            >
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${config.className}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${config.dotColor}`}
                    />
                    {config.label}
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
                    <p className="text-xs text-muted-foreground">
                      Alquiler mensual
                    </p>
                    <p className="font-display font-bold text-lg">
                      {property.priceFormatted}
                    </p>
                    {property.expenses && property.expenses > 0 && (
                      <p className="text-xs text-muted-foreground">
                        + ${property.expenses.toLocaleString()} expensas
                      </p>
                    )}
                  </div>

                  {/* Tenant avatar on rented properties */}
                  {property.status === "rented" && property.tenantName && (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-green-600">
                          {getInitials(property.tenantName)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground hidden sm:block max-w-[80px] truncate">
                        {property.tenantName}
                      </span>
                    </div>
                  )}

                  {property.status !== "rented" && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Sin inquilino
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state when no properties */}
      {properties.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold text-lg">
            Todavía no tenés propiedades publicadas
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Subí tu primera propiedad y empezá a recibir consultas de
            potenciales inquilinos.
          </p>
          <Link
            href="/subir-propiedad"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Publicar mi propiedad
          </Link>
        </div>
      )}
    </div>
  );
};

export default OwnerSection;
