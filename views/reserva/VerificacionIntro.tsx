"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useReservation } from "@/contexts/ReservationContext";
import { 
  Clock,
  ArrowRight,
  Sparkles,
  Percent,
  Building2,
  BadgeCheck,
  User,
  Wallet
} from "lucide-react";

const VerificacionIntro = () => {
  const router = useRouter();
  const { selectedProperty } = useReservation();

  const handleContinue = () => {
    router.push("/reserva/verificacion-identidad");
  };

  const handleExit = () => {
    if (selectedProperty) {
      router.push(`/propiedad/${selectedProperty.id}`);
    } else {
      router.push("/buscar");
    }
  };

  const benefits = [
    {
      icon: Percent,
      text: "50% OFF en la garantía Hoggax"
    },
    {
      icon: Building2,
      text: <>Válido en todos los alquileres de <span className="font-ubuntu">mob</span></>
    },
    {
      icon: BadgeCheck,
      text: "Calificás ante +1000 inmobiliarias"
    },
    {
      icon: Sparkles,
      text: "Te verificás una sola vez y listo"
    },
  ];

  const steps = [
    { number: 1, icon: User, label: "Identidad" },
    { number: 2, icon: Wallet, label: "Ingresos" },
    { number: 3, icon: BadgeCheck, label: "Calificado" },
  ];

  return (
    <ReservationLayout showProgress={false} onExit={handleExit}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              Verificate para reservar
            </h1>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-foreground font-medium">{benefit.text}</p>
              </div>
            ))}
          </div>

          {/* Progress Steps */}
          <div className="bg-secondary/50 rounded-xl p-5">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              3 pasos simples
            </p>
            <div className="flex items-center justify-between px-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                      <step.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-12 h-0.5 bg-muted mx-2 mb-6" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time estimate */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Todo el proceso toma menos de 2 minutos</span>
          </div>
        </div>
      </div>

      {/* Footer - Sticky */}
      <div className="sticky bottom-0 p-6 border-t border-border bg-background shrink-0">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleContinue}
            className="w-full h-12 rounded-full gap-2 text-base"
          >
            Verificarme para reservar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default VerificacionIntro;
