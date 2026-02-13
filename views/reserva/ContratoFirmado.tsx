"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useReservation } from "@/contexts/ReservationContext";
import { 
  CheckCircle2, 
  ArrowRight,
  PartyPopper,
  Key,
  Calendar,
  Home
} from "lucide-react";

const ContratoFirmado = () => {
  const router = useRouter();
  const { setContractSigned } = useReservation();

  const handleGoToPostVenta = () => {
    setContractSigned(true);
    router.push("/post-venta");
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-2">
            <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4 relative">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <div className="absolute -top-1 -right-1">
                <PartyPopper className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold">
              ¡Contrato firmado con éxito!
            </h1>
            <p className="text-muted-foreground">
              Felicitaciones, ya tenés tu nuevo hogar
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Tu alquiler está activo</p>
                <p className="text-sm text-muted-foreground">Contrato vigente desde hoy</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              ¿Qué sigue?
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Entrega de llaves</p>
                  <p className="text-sm text-muted-foreground">Coordiná con el propietario</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Primer pago</p>
                  <p className="text-sm text-muted-foreground">Te avisamos cuando corresponda</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border shrink-0">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleGoToPostVenta}
            className="w-full rounded-full gap-2 animate-pulse-glow"
            size="lg"
          >
            Ir a mi alquiler
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default ContratoFirmado;
