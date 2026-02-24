"use client";

import { User, Calendar } from "lucide-react";
import type { OperationHistoryEntry, OperacionStatus } from "@/lib/transforms/property";

const statusConfig: Record<
  OperacionStatus,
  { label: string; dotColor: string; textColor: string; bgColor: string }
> = {
  rented: {
    label: "Alquilado",
    dotColor: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  available: {
    label: "Disponible",
    dotColor: "bg-primary",
    textColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  finished: {
    label: "Finalizado",
    dotColor: "bg-muted-foreground",
    textColor: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  cancelled: {
    label: "Cancelado",
    dotColor: "bg-destructive",
    textColor: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
}

interface OperationTimelineProps {
  operations: OperationHistoryEntry[];
}

const OperationTimeline = ({ operations }: OperationTimelineProps) => {
  if (operations.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg">
          Sin historial de operaciones
        </h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Esta propiedad todavía no tiene operaciones registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {operations.map((op, index) => {
        const config = statusConfig[op.status as OperacionStatus] || statusConfig.available;
        const isLast = index === operations.length - 1;

        return (
          <div key={op.id} className="flex gap-4">
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={`h-3.5 w-3.5 rounded-full shrink-0 mt-1.5 ${
                  op.isCurrent
                    ? `${config.dotColor} ring-4 ring-offset-2 ring-offset-background ${config.bgColor.replace("bg-", "ring-")}`
                    : config.dotColor
                }`}
              />
              {/* Connecting line */}
              {!isLast && (
                <div className="w-px flex-1 bg-border min-h-[24px]" />
              )}
            </div>

            {/* Content card */}
            <div
              className={`flex-1 mb-4 rounded-xl border p-4 ${
                op.isCurrent
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}
                >
                  {config.label}
                  {op.isCurrent && " (actual)"}
                </span>
              </div>

              {/* Tenant info */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className={op.tenantName ? "text-foreground" : "text-muted-foreground"}>
                  {op.tenantName || "Sin inquilino"}
                </span>
              </div>

              {/* Price + Period */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                {op.price && (
                  <span className="font-medium text-foreground">
                    ${op.price.toLocaleString("es-AR")} {op.currency || "ARS"}/mes
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(op.startDate)} →{" "}
                  {op.isCurrent ? "presente" : formatDate(op.endDate)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OperationTimeline;
