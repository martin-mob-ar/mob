"use client";

import { Send, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import OperacionHeader from "@/components/operaciones/OperacionHeader";
import OperacionChecklist from "@/components/operaciones/OperacionChecklist";
import type { Operacion, OperacionViewerRole } from "@/lib/mock/operaciones-types";

interface OperacionDetailViewProps {
  operation: Operacion;
  role: OperacionViewerRole;
}

const OperacionDetailView = ({
  operation,
  role,
}: OperacionDetailViewProps) => {
  return (
    <div className="flex-1 bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header card */}
        <OperacionHeader operation={operation} role={role} />

        {/* Checklist */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            Pasos de la operación
          </h2>
          <OperacionChecklist operation={operation} role={role} />
        </div>

        {/* Admin actions */}
        {role === "admin" && (
          <div className="space-y-2 pt-2 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Acciones de administrador
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Reenviar links
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Retroceder paso
              </Button>
            </div>
            {operation.generalStatus === "en_proceso" && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full h-9 text-xs"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Cancelar operación
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperacionDetailView;
