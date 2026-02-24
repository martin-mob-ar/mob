"use client";

import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  MessageCircle,
  Info,
  MapPin,
  Calendar,
  User,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  History,
  DoorOpen,
  BedDouble,
  Bath,
  Maximize2,
  Car,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import OperationTimeline from "./OperationTimeline";
import type {
  OperationHistoryEntry,
  OperacionStatus,
} from "@/lib/transforms/property";

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

function formatFullDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface PropertyDetailViewProps {
  property: any;
  operations: OperationHistoryEntry[];
  currentTenant: { name: string; email: string } | null;
  currentOperation: any | null;
  mockMode?: boolean;
  tokko?: boolean;
  tokkoId?: number | null;
}

const PropertyDetailView = ({
  property,
  operations,
  currentTenant,
  currentOperation,
  mockMode,
  tokko,
  tokkoId,
}: PropertyDetailViewProps) => {
  const title = property.title || property.address || "Propiedad";
  const address = property.address || "";
  const location = [property.location_name, property.parent_location_name]
    .filter(Boolean)
    .join(", ");
  const image = property.cover_photo_url || "/assets/property-new-1.png";
  const price = property.price ? Number(property.price) : 0;
  const currency = property.currency || "ARS";
  const status =
    (property.operacion_status as OperacionStatus) || "available";
  const config = statusConfig[status];

  const progress = currentOperation
    ? computeContractProgress(
        currentOperation.start_date,
        currentOperation.end_date
      )
    : null;

  const slug = property.slug;
  const propertyId = String(property.property_id);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/gestion"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis propiedades
      </Link>

      {/* Property Header */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-80 aspect-video md:aspect-auto overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${config.dotColor}`}
                    />
                    {config.label}
                  </span>
                </div>
                <h1 className="font-display text-2xl font-bold">{title}</h1>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {address || location}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Alquiler mensual
                </p>
                <p className="font-display font-bold text-2xl">
                  ${price.toLocaleString("es-AR")} {currency}
                </p>
              </div>
            </div>

            {/* Property stats */}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              {property.room_amount && (
                <span className="flex items-center gap-1.5">
                  <DoorOpen className="h-4 w-4" />
                  {property.room_amount} amb
                </span>
              )}
              {property.suite_amount && (
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" />
                  {property.suite_amount} dorm
                </span>
              )}
              {property.total_surface && (
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="h-4 w-4" />
                  {Number(property.total_surface)}m²
                </span>
              )}
              {property.bathroom_amount && (
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" />
                  {property.bathroom_amount} baño
                  {property.bathroom_amount > 1 ? "s" : ""}
                </span>
              )}
              {property.parking_lot_amount && (
                <span className="flex items-center gap-1.5">
                  <Car className="h-4 w-4" />
                  {property.parking_lot_amount} cochera
                  {property.parking_lot_amount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Tenant info if rented */}
            {currentTenant && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Inquilino actual
                    </p>
                    <p className="font-semibold">{currentTenant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentTenant.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {tokko && tokkoId ? (
          <Button asChild variant="outline" className="rounded-full gap-2">
            <a
              href={`https://www.tokkobroker.com/property/${tokkoId}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Editar en Tokko
            </a>
          </Button>
        ) : !tokko ? (
          <Button asChild variant="outline" className="rounded-full gap-2">
            <Link href={`/gestion/propiedad/${propertyId}/editar`}>
              <FileText className="h-4 w-4" />
              Editar información
            </Link>
          </Button>
        ) : null}
        {slug && (
          <Button asChild variant="outline" className="rounded-full gap-2">
            <Link href={`/propiedad/${slug}`}>
              <ExternalLink className="h-4 w-4" />
              Ver publicación
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="historial" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger
            value="historial"
            className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <History className="h-4 w-4" />
            Historial
            {operations.length > 0 && (
              <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-primary/20 text-primary data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground text-xs font-bold flex items-center justify-center">
                {operations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="contrato"
            className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-4 w-4" />
            Contrato
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Info className="h-4 w-4" />
            Información
          </TabsTrigger>
        </TabsList>

        {/* Historial Tab */}
        <TabsContent value="historial" className="space-y-6">
          <div>
            <h3 className="font-display font-semibold">
              Historial de operaciones
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Todas las operaciones registradas para esta propiedad
            </p>
          </div>
          <OperationTimeline operations={operations} />
        </TabsContent>

        {/* Contract Tab */}
        <TabsContent value="contrato" className="space-y-6">
          {currentOperation && currentOperation.start_date ? (
            <>
              {/* Contract Progress */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">
                  Estado del contrato
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Inicio: {formatFullDate(currentOperation.start_date)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Fin: {formatFullDate(currentOperation.end_date)}
                    </div>
                  </div>
                  {progress && (
                    <>
                      <Progress value={progress.percent} className="h-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        {progress.percent}% del contrato transcurrido
                        {progress.daysLeft > 0 &&
                          ` · ${progress.daysLeft} días restantes`}
                      </p>
                    </>
                  )}
                  {currentOperation.duration_months && (
                    <p className="text-sm text-muted-foreground">
                      Duración: {currentOperation.duration_months} meses
                    </p>
                  )}
                </div>
              </div>

              {/* Rental details */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">
                  Detalle de la operación
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Precio mensual
                    </p>
                    <p className="font-medium mt-1">
                      ${Number(currentOperation.price || 0).toLocaleString("es-AR")}{" "}
                      {currentOperation.currency || "ARS"}
                    </p>
                  </div>
                  {currentOperation.expenses > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Expensas
                      </p>
                      <p className="font-medium mt-1">
                        ${currentOperation.expenses.toLocaleString("es-AR")}
                      </p>
                    </div>
                  )}
                  {currentOperation.secondary_price && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Precio en{" "}
                        {currentOperation.secondary_currency || "ARS"}
                      </p>
                      <p className="font-medium mt-1">
                        $
                        {Number(
                          currentOperation.secondary_price
                        ).toLocaleString("es-AR")}{" "}
                        {currentOperation.secondary_currency || "ARS"}
                      </p>
                    </div>
                  )}
                  {currentOperation.ipc_adjustment && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Ajuste IPC
                      </p>
                      <p className="font-medium mt-1">
                        {currentOperation.ipc_adjustment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg">
                Sin contrato activo
              </h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Esta propiedad no tiene un contrato activo. Cuando se alquile,
                verás aquí la información del contrato.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-display font-semibold mb-6">
              Información de la propiedad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </p>
                  <p className="font-medium mt-1">{title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Dirección
                  </p>
                  <p className="font-medium mt-1">{address || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Ubicación
                  </p>
                  <p className="font-medium mt-1">{location || "—"}</p>
                </div>
                {property.property_type_name && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Tipo de propiedad
                    </p>
                    <p className="font-medium mt-1">
                      {property.property_type_name}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Precio
                  </p>
                  <p className="font-medium mt-1">
                    ${price.toLocaleString("es-AR")} {currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Estado
                  </p>
                  <p className="font-medium mt-1">{config.label}</p>
                </div>
                {property.room_amount && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Ambientes
                    </p>
                    <p className="font-medium mt-1">{property.room_amount}</p>
                  </div>
                )}
                {property.total_surface && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Superficie total
                    </p>
                    <p className="font-medium mt-1">
                      {Number(property.total_surface)}m²
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyDetailView;
