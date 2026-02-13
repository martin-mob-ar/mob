"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useVisita } from "@/contexts/VisitaContext";
import { useReservation } from "@/contexts/ReservationContext";
import { 
  User, 
  CheckCircle2, 
  ArrowRight,
  ChevronLeft,
  Upload,
  Camera,
  Shield
} from "lucide-react";

const VerificacionIdentidad = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isVisitaFlow = pathname.includes("/visita/");
  const isStandaloneFlow = pathname.startsWith("/verificacion/");
  
  const visitaContext = useVisita();
  const reservationContext = useReservation();
  
  const setIsIdentityVerified = isVisitaFlow 
    ? visitaContext.setIsIdentityVerified 
    : reservationContext.setIsIdentityVerified;

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      if (!isStandaloneFlow) {
        setIsIdentityVerified(true);
      }
    }, 1500);
  };

  const handleContinue = () => {
    if (isStandaloneFlow) {
      router.push("/verificacion/ingresos");
    } else if (isVisitaFlow) {
      router.push("/visita/verificacion-ingresos");
    } else {
      router.push("/reserva/verificacion-ingresos");
    }
  };

  const handleBack = () => {
    if (isStandaloneFlow) {
      router.push("/verificacion");
    } else if (isVisitaFlow) {
      router.push("/visita/intro");
    } else {
      router.push("/reserva/verificacion-intro");
    }
  };

  return (
    <ReservationLayout currentStep={1} totalSteps={3}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className={`h-14 w-14 rounded-full mx-auto flex items-center justify-center mb-4 transition-colors ${
              isVerified ? "bg-primary/10" : "bg-muted"
            }`}>
              {isVerified ? (
                <CheckCircle2 className="h-7 w-7 text-primary" />
              ) : (
                <User className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <h1 className="font-display text-2xl font-bold">
              Verificación de identidad
            </h1>
            <p className="text-muted-foreground">
              Confirmamos tu identidad de forma segura
            </p>
          </div>

          {/* Verification Card */}
          {!isVerified ? (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Tuora</p>
                    <p className="text-sm text-muted-foreground">Verificación segura</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Foto del DNI (frente y dorso)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Selfie para validar identidad</span>
                  </div>
                </div>

                <Button 
                  onClick={handleVerify}
                  className="w-full rounded-xl"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Iniciar verificación
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Tu información está protegida y se usa solo para esta verificación
              </p>
            </div>
          ) : (
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Identidad verificada</p>
                <p className="text-sm text-muted-foreground">Tu información fue validada correctamente</p>
              </div>
            </div>
          )}
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
            disabled={!isVerified}
          >
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default VerificacionIdentidad;
