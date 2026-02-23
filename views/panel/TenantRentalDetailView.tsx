"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Maximize2,
  ExternalLink,
  MessageCircle,
  DoorOpen,
  BedDouble,
  Bath,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { OperacionStatus } from "@/lib/transforms/property";

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
): { percent: number; daysLeft: number; totalMonths: number } | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (end <= start) return null;
  const total = end - start;
  const elapsed = Math.max(0, now - start);
  const percent = Math.min(100, Math.round((elapsed / total) * 100));
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const totalMonths = Math.round(total / (1000 * 60 * 60 * 24 * 30.44));
  return { percent, daysLeft, totalMonths };
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

interface TenantRentalDetailViewProps {
  operacion: any;
  property: any;
  photos: any[];
  mockMode?: boolean;
}

const TenantRentalDetailView = ({
  operacion,
  property,
  photos,
  mockMode,
}: TenantRentalDetailViewProps) => {
  const status = (operacion.status as OperacionStatus) || "available";
  const config = statusConfig[status];
  const progress = computeContractProgress(
    operacion.start_date,
    operacion.end_date
  );

  const title = property?.title || property?.address || "Propiedad";
  const address = property?.address || "";
  const location = [property?.location_name, property?.parent_location_name]
    .filter(Boolean)
    .join(", ");
  const mainPhoto =
    photos.find((p: any) => p.is_front_cover)?.url ||
    photos[0]?.url ||
    property?.cover_photo_url ||
    "/assets/property-new-1.png";
  const slug = property?.slug;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/gestion"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis alquileres
      </Link>

      {/* Property Header Card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Photo */}
          <div className="md:w-80 aspect-video md:aspect-auto relative overflow-hidden">
            <img
              src={mainPhoto}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${config.className}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${config.dotColor} ${status === "rented" ? "animate-pulse" : ""}`}
                />
                {config.label}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 p-6">
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            {address && (
              <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 shrink-0" />
                {address}
              </div>
            )}
            {location && (
              <p className="text-sm text-muted-foreground mt-0.5 ml-5.5">
                {location}
              </p>
            )}

            {/* Property stats */}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              {property?.room_amount && (
                <span className="flex items-center gap-1.5">
                  <DoorOpen className="h-4 w-4" />
                  {property.room_amount} amb
                </span>
              )}
              {property?.suite_amount && (
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" />
                  {property.suite_amount} dorm
                </span>
              )}
              {property?.total_surface && (
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="h-4 w-4" />
                  {Number(property.total_surface)}m²
                </span>
              )}
              {property?.bathroom_amount && (
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" />
                  {property.bathroom_amount} baño
                  {property.bathroom_amount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="font-display font-bold text-2xl">
                ${Number(operacion.price || 0).toLocaleString()}{" "}
                {operacion.currency || "ARS"}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  /mes
                </span>
              </p>
              {operacion.expenses && operacion.expenses > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  + ${operacion.expenses.toLocaleString()} expensas
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Section */}
      {progress && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Contrato
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Inicio: {formatFullDate(operacion.start_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Fin: {formatFullDate(operacion.end_date)}</span>
              </div>
            </div>
            <Progress value={progress.percent} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{progress.percent}% transcurrido</span>
              <span>
                {progress.daysLeft > 0
                  ? `${progress.daysLeft} días restantes`
                  : "Contrato vencido"}
              </span>
            </div>
            {operacion.duration_months && (
              <p className="text-sm text-muted-foreground">
                Duración total: {operacion.duration_months} meses
              </p>
            )}
          </div>
        </div>
      )}

      {/* Rental Details */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-display font-semibold mb-4">
          Detalle del alquiler
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Precio mensual
            </p>
            <p className="font-medium mt-1">
              ${Number(operacion.price || 0).toLocaleString()}{" "}
              {operacion.currency || "ARS"}
            </p>
          </div>
          {operacion.expenses && operacion.expenses > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Expensas
              </p>
              <p className="font-medium mt-1">
                ${operacion.expenses.toLocaleString()} ARS
              </p>
            </div>
          )}
          {operacion.secondary_price && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Precio en {operacion.secondary_currency || "ARS"}
              </p>
              <p className="font-medium mt-1">
                ${Number(operacion.secondary_price).toLocaleString()}{" "}
                {operacion.secondary_currency || "ARS"}
              </p>
            </div>
          )}
          {operacion.ipc_adjustment && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Ajuste IPC
              </p>
              <p className="font-medium mt-1">{operacion.ipc_adjustment}</p>
            </div>
          )}
          {operacion.down_payment && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Depósito
              </p>
              <p className="font-medium mt-1">
                ${Number(operacion.down_payment).toLocaleString()}{" "}
                {operacion.currency || "ARS"}
              </p>
            </div>
          )}
          {operacion.fire_insurance_cost && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Seguro de incendio
              </p>
              <p className="font-medium mt-1">
                ${Number(operacion.fire_insurance_cost).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {slug && (
          <Button asChild variant="outline" className="rounded-full gap-2">
            <Link href={`/propiedad/${slug}`}>
              <ExternalLink className="h-4 w-4" />
              Ver publicación original
            </Link>
          </Button>
        )}
        <Button variant="outline" className="rounded-full gap-2">
          <MessageCircle className="h-4 w-4" />
          Abrir ticket
        </Button>
      </div>
    </div>
  );
};

export default TenantRentalDetailView;
