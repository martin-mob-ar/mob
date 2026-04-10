"use client";

import { CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PagoPanelProps {
  isPaid: boolean;
  onRegister: () => void;
}

const PagoPanel = ({ isPaid, onRegister }: PagoPanelProps) => {
  if (isPaid) {
    return (
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 bg-green-500/10 text-green-700 rounded-md px-3 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium">
            Pago de garantía registrado
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      <p className="text-xs text-muted-foreground">
        Confirmá el pago de la garantía para avanzar con la operación.
      </p>
      <Button className="w-full h-10" onClick={onRegister}>
        <CreditCard className="h-4 w-4 mr-1.5" />
        Registrar pago
      </Button>
    </div>
  );
};

export default PagoPanel;
