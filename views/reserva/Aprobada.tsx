"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { 
  CheckCircle2, 
  ArrowRight,
  PartyPopper,
  FileText,
  Calendar
} from "lucide-react";

const Aprobada = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/reserva/contrato-revision");
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-2">
            <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <PartyPopper className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              ¡El propietario aprobó tu reserva!
            </h1>
            <p className="text-muted-foreground">
              Estás muy cerca de tu nuevo hogar
            </p>
          </div>

          {/* Status badge */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Reserva aprobada</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Siguiente paso
            </p>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Revisión del contrato</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Te enviamos el contrato para que lo revises antes de firmar
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Podés coordinar la entrega de llaves después de firmar
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border shrink-0">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleContinue}
            className="w-full rounded-full gap-2 animate-pulse-glow"
            size="lg"
          >
            Continuar con el contrato
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default Aprobada;
