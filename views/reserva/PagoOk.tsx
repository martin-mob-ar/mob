"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { 
  CheckCircle2, 
  Clock,
  ArrowRight,
  User,
  Bell,
  FileText
} from "lucide-react";

const PagoOk = () => {
  const router = useRouter();

  const nextSteps = [
    { icon: User, text: "El propietario revisará tu solicitud" },
    { icon: Bell, text: "Te notificaremos cuando responda" },
    { icon: FileText, text: "Si aprueba, avanzamos al contrato" },
  ];

  const handleSimulateApproved = () => {
    router.push("/reserva/aprobada");
  };

  const handleSimulateRejected = () => {
    router.push("/reserva/rechazada");
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-2">
            <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              ¡Reserva confirmada!
            </h1>
            <p className="text-muted-foreground">
              Tu pago fue procesado correctamente
            </p>
          </div>

          {/* Status */}
          <div className="bg-primary/10 rounded-xl border border-primary/20 p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Esperando aprobación</p>
                <p className="text-sm text-muted-foreground">
                  El propietario tiene 24hs para responder
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Próximos pasos
            </p>
            {nextSteps.map((step, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <step.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-foreground">{step.text}</p>
              </div>
            ))}
          </div>

          {/* Demo buttons */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wide">
              Demo: Simular respuesta del propietario
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleSimulateApproved}
                className="rounded-xl"
              >
                ✓ Aprueba
              </Button>
              <Button 
                variant="outline"
                onClick={handleSimulateRejected}
                className="rounded-xl"
              >
                ✗ Rechaza
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default PagoOk;
