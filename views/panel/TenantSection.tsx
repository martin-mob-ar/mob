"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  MapPin,
  ChevronDown,
  Search,
  Calendar,
  Maximize2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AnimateHeight } from "@/components/ui/animate-height";
import type { TenantRental, OperacionStatus } from "@/lib/transforms/property";

const statusConfig: Record<
  OperacionStatus,
  { label: string; className: string; dotColor: string }
> = {
  rented: {
    label: "Alquilando",
    className: "bg-green-500/10 text-green-600",
    dotColor: "bg-green-500",
  },
  available: {
    label: "Disponible",
    className: "bg-primary/10 text-primary",
    dotColor: "bg-primary",
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

function computeContractProgress(
  startDate: string | null,
  endDate: string | null
): { percent: number; daysLeft: number } | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (end <= start) return null;
  const total = end - start;
  const elapsed = Math.max(0, now - start);
  const percent = Math.min(100, Math.round((elapsed / total) * 100));
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  return { percent, daysLeft };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
}

function formatFullDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface TenantSectionProps {
  rentals: TenantRental[];
  mockMode?: boolean;
}

const TenantSection = ({ rentals, mockMode }: TenantSectionProps) => {
  const [showHistory, setShowHistory] = useState(false);

  const activeRentals = rentals.filter((r) => r.status === "rented");
  const pastRentals = rentals.filter(
    (r) => r.status === "finished" || r.status === "cancelled"
  );

  if (rentals.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
          <Home className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg">
          No tenés alquileres activos
        </h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Cuando alquiles una propiedad, vas a poder ver toda la información de
          tu contrato desde acá.
        </p>
        <Link
          href="/buscar"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          <Search className="h-4 w-4" />
          Buscar propiedades
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Rentals */}
      {activeRentals.length > 0 && (
        <div className="space-y-4">
          {activeRentals.map((rental) => {
            const progress = computeContractProgress(
              rental.startDate,
              rental.endDate
            );

            return (
              <Link
                key={rental.operacionId}
                href={`/gestion/alquiler/${rental.operacionId}${mockMode ? "?mock=true" : ""}`}
                className="block bg-card rounded-2xl border border-border overflow-hidden hover:border-green-500/30 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Photo */}
                  <div className="md:w-72 lg:w-80 aspect-video md:aspect-auto relative overflow-hidden">
                    <img
                      src={rental.image}
                      alt={rental.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${statusConfig.rented.className}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${statusConfig.rented.dotColor} animate-pulse`}
                        />
                        {statusConfig.rented.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-xl group-hover:text-primary transition-colors">
                        {rental.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {rental.address || rental.location}
                      </div>

                      {/* Quick stats */}
                      <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                        {rental.rooms && (
                          <span>{rental.rooms} amb</span>
                        )}
                        {rental.surface && (
                          <>
                            <span className="text-border">·</span>
                            <span className="flex items-center gap-1">
                              <Maximize2 className="h-3 w-3" />
                              {rental.surface}m²
                            </span>
                          </>
                        )}
                        {rental.propertyType && (
                          <>
                            <span className="text-border">·</span>
                            <span>{rental.propertyType}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Price + Contract */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-display font-bold text-lg">
                            ${rental.price?.toLocaleString()} {rental.currency}
                            <span className="text-sm font-normal text-muted-foreground">
                              {" "}
                              /mes
                            </span>
                          </p>
                          {rental.expenses && rental.expenses > 0 && (
                            <p className="text-sm text-muted-foreground">
                              + ${rental.expenses.toLocaleString()} expensas
                            </p>
                          )}
                        </div>
                      </div>

                      {progress && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(rental.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              {formatDate(rental.endDate)}
                              <Calendar className="h-3 w-3" />
                            </span>
                          </div>
                          <Progress value={progress.percent} className="h-1.5" />
                          <p className="text-xs text-muted-foreground text-center">
                            {progress.percent}% del contrato ·{" "}
                            {progress.daysLeft > 0
                              ? `${progress.daysLeft} días restantes`
                              : "Contrato vencido"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Past Rentals */}
      {pastRentals.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showHistory ? "rotate-180" : ""}`}
            />
            Historial de alquileres ({pastRentals.length})
          </button>

          <AnimateHeight show={showHistory}>
            <div className="mt-3 space-y-2">
              {pastRentals.map((rental) => {
                const config = statusConfig[rental.status];
                return (
                  <div
                    key={rental.operacionId}
                    className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 opacity-70"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${config.dotColor}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.className}`}
                        >
                          {config.label}
                        </span>
                        <span className="font-medium text-sm truncate">
                          {rental.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(rental.startDate)} →{" "}
                        {formatDate(rental.endDate)}
                        {rental.price && (
                          <>
                            {" · "}${rental.price.toLocaleString()}{" "}
                            {rental.currency}/mes
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AnimateHeight>
        </div>
      )}
    </div>
  );
};

export default TenantSection;
