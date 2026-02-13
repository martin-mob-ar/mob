"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  BadgeCheck, 
  Shield, 
  Building2,
  ArrowRight,
  Percent,
  RefreshCw,
  Clock
} from "lucide-react";
const mobLogo = "/assets/mob-logo-new.png";

const Verificacion = () => {
  const router = useRouter();

  const handleStartVerification = () => {
    router.push("/verificacion/identidad");
  };

  const handleGoBack = () => {
    router.back();
  };

  const benefits = [
    { icon: Percent, text: "50% OFF en la garantía Hoggax" },
    { icon: Building2, text: <>Válido en todos los alquileres de <span className="font-ubuntu">mob</span></> },
    { icon: BadgeCheck, text: "Calificás ante +1000 inmobiliarias" },
    { icon: RefreshCw, text: "Te verificás una sola vez y listo" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6">
        <img src={mobLogo} alt="MOB" className="h-6" />
        <button 
          onClick={handleGoBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Salir
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              Verificá tu perfil
            </h1>
            <p className="text-muted-foreground">
              Completá el proceso en menos de 2 minutos
            </p>
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

          {/* Duration hint */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Proceso de 3 pasos simples</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleStartVerification}
            className="w-full rounded-full gap-2"
          >
            Comenzar verificación
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Verificacion;
