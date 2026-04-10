"use client";

import { MapPin, User, Home } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { GeneralStatusBadge } from "./OperacionStatusBadge";
import type { Operacion } from "@/lib/mock/operaciones-types";

interface OperacionHeaderProps {
  operation: Operacion;
}

const OperacionHeader = ({ operation }: OperacionHeaderProps) => {
  const completedSteps = operation.checklist.filter(
    (s) => s.status === "completed"
  ).length;

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
      {/* Property address + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display font-bold text-lg leading-tight">
              {operation.propertyAddress}
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <Home className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {operation.propertyType}
              </span>
            </div>
          </div>
        </div>
        <GeneralStatusBadge status={operation.generalStatus} className="shrink-0" />
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Inquilino</p>
            <p className="text-sm font-medium truncate">
              {operation.tenantName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Propietario</p>
            <p className="text-sm font-medium truncate">
              {operation.ownerName}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progreso</span>
          <span>
            {completedSteps} de {operation.checklist.length} pasos
          </span>
        </div>
        <Progress value={operation.progressPercent} className="h-2" />
      </div>
    </div>
  );
};

export default OperacionHeader;
