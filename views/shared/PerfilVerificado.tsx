"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMockUser } from "@/contexts/MockUserContext";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { 
  BadgeCheck, 
  ArrowRight,
  ChevronLeft,
  Shield,
  Building2,
  Sparkles,
  Calendar,
  CreditCard,
  Home
} from "lucide-react";

const PerfilVerificado = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isVisitaFlow = pathname.includes("/visita/");
  const isStandaloneFlow = pathname.startsWith("/verificacion/");
  const { setIsVerified } = useMockUser();

  // Mark user as verified when reaching this screen in standalone flow
  if (isStandaloneFlow) {
    setIsVerified(true);
  }

  const handleContinue = () => {
    if (isStandaloneFlow) {
      router.push("/");
    } else if (isVisitaFlow) {
      router.push("/visita/seleccionar-horario");
    } else {
      router.push("/reserva/checkout");
    }
  };

  const handleBack = () => {
    if (isStandaloneFlow) {
      router.push("/verificacion/ingresos");
    } else if (isVisitaFlow) {
      router.push("/visita/verificacion-ingresos");
    } else {
      router.push("/reserva/verificacion-ingresos");
    }
  };

  return (
    <ReservationLayout currentStep={3} totalSteps={3}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              ¡Ya estás calificado para alquilar!
            </h1>
            <p className="text-muted-foreground">
              Tu verificación está completa
            </p>
          </div>

          {/* Success Card */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <BadgeCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg text-foreground">Perfil verificado</p>
                <p className="text-sm text-muted-foreground">Hoggax te respalda</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">50% OFF en garantía</p>
                <p className="text-sm text-muted-foreground">Accedés al mejor precio</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Válido en +1000 inmobiliarias</p>
                <p className="text-sm text-muted-foreground">Tu verificación te sirve en todos lados</p>
              </div>
            </div>
          </div>

          {/* Next step hint */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {isStandaloneFlow ? (
              <>
                <Home className="h-4 w-4" />
                <span>Ya podés buscar y alquilar propiedades</span>
              </>
            ) : isVisitaFlow ? (
              <>
                <Calendar className="h-4 w-4" />
                <span>Siguiente: elegí el horario de tu visita</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Siguiente: confirmá tu reserva</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border shrink-0">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Atrás
          </Button>
          <Button 
            onClick={handleContinue}
            className="flex-1 rounded-full gap-2"
          >
            {isStandaloneFlow ? "Volver al inicio" : isVisitaFlow ? "Elegir horario" : "Continuar a reserva"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default PerfilVerificado;
