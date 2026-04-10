"use client";

import { useState } from "react";
import { Check, Circle, Send, FileCheck, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  FirmaStage,
  OperacionViewerRole,
} from "@/lib/mock/operaciones-types";

interface FirmaTimelineProps {
  currentStage: FirmaStage;
  role: OperacionViewerRole;
}

const stages: { id: FirmaStage; label: string }[] = [
  { id: "enviado_propietario", label: "Enviado a propietario" },
  { id: "firmado_propietario", label: "Firmado por propietario" },
  { id: "enviado_inquilino", label: "Enviado a inquilino" },
  { id: "firmado_inquilino", label: "Firmado por inquilino" },
  { id: "documento_final", label: "Documento final disponible" },
];

const stageOrder: Record<FirmaStage, number> = {
  pendiente: 0,
  enviado_propietario: 1,
  firmado_propietario: 2,
  enviado_inquilino: 3,
  firmado_inquilino: 4,
  documento_final: 5,
};

const FirmaTimeline = ({ currentStage, role }: FirmaTimelineProps) => {
  const [stage, setStage] = useState<FirmaStage>(currentStage);
  const currentOrder = stageOrder[stage];

  const canInitiate = role === "admin" && stage === "pendiente";
  const canOwnerSign =
    role === "propietario" && stage === "enviado_propietario";
  const canTenantSign =
    role === "inquilino" && stage === "enviado_inquilino";

  // After signing, automatically forward to the next signer
  // (simulates ZapSign auto-forwarding once a party completes their signature).
  const handleOwnerSign = () => setStage("enviado_inquilino");
  const handleTenantSign = () => setStage("documento_final");

  return (
    <div className="space-y-3">
      {stage === "pendiente" ? (
        <div className="bg-card rounded-lg border border-border p-4 text-center space-y-3">
          <Send className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            El contrato está listo para ser enviado a firma.
          </p>
          {canInitiate && (
            <Button
              className="w-full h-10"
              onClick={() => setStage("enviado_propietario")}
            >
              <Send className="h-4 w-4 mr-1.5" />
              Enviar a firma
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-4 space-y-0">
          {stages.map((stageDef, idx) => {
            const order = stageOrder[stageDef.id];
            const isCompleted = order < currentOrder;
            const isActive = order === currentOrder;
            const isPending = order > currentOrder;
            const isLast = idx === stages.length - 1;

            return (
              <div key={stageDef.id} className="flex gap-3">
                {/* Dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full shrink-0 flex items-center justify-center",
                      isCompleted && "bg-green-500",
                      isActive && "bg-primary ring-3 ring-primary/20",
                      isPending && "bg-muted border border-border"
                    )}
                  >
                    {isCompleted && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                    {isActive && (
                      <Circle className="h-2.5 w-2.5 text-white fill-white" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "w-px h-4",
                        isCompleted ? "bg-green-500/30" : "bg-border"
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="pb-2">
                  <span
                    className={cn(
                      "text-sm",
                      isCompleted && "text-green-600 font-medium",
                      isActive && "text-primary font-semibold",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {stageDef.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Owner sign button */}
          {canOwnerSign && (
            <div className="pt-3">
              <Button className="w-full h-10" onClick={handleOwnerSign}>
                <PenLine className="h-4 w-4 mr-1.5" />
                Firmar contrato
              </Button>
            </div>
          )}

          {/* Tenant sign button */}
          {canTenantSign && (
            <div className="pt-3">
              <Button className="w-full h-10" onClick={handleTenantSign}>
                <PenLine className="h-4 w-4 mr-1.5" />
                Firmar contrato
              </Button>
            </div>
          )}

          {/* Download button for final document */}
          {stage === "documento_final" && (
            <div className="pt-3">
              <Button variant="outline" className="w-full h-10">
                <FileCheck className="h-4 w-4 mr-1.5" />
                Descargar contrato firmado
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FirmaTimeline;
