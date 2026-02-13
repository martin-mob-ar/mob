"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useVisita } from "@/contexts/VisitaContext";
import { 
  Calendar,
  MapPin,
  BadgeCheck,
  Send,
  ChevronLeft,
  Home
} from "lucide-react";
import { properties } from "@/data/properties";

const VisitaSolicitud = () => {
  const router = useRouter();
  const { selectedProperty, setVisitApproval } = useVisita();
  
  // Use mock property if none selected
  const property = selectedProperty || {
    id: "1",
    title: "Departamento 2 ambientes",
    address: "Av. Santa Fe 2500",
    neighborhood: "Palermo",
    price: 450000,
    image: properties[0]?.image || ""
  };

  const handleSubmit = () => {
    setVisitApproval("pending");
    router.push("/visita/espera");
  };

  const handleBack = () => {
    router.push("/visita/seleccionar-horario");
  };

  return (
    <ReservationLayout currentStep={4} totalSteps={4}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl font-bold">
              Confirma tu solicitud de visita
            </h1>
            <p className="text-muted-foreground">
              Revisá los detalles antes de enviar
            </p>
          </div>

          {/* Property Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="aspect-video relative">
              <img 
                src={property.image || properties[0]?.image} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{property.title || `Depto en ${property.neighborhood}`}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {property.address}, {property.neighborhood}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xl font-bold">
                  ${property.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">/mes</span>
              </div>
            </div>
          </div>

          {/* Verified Status */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">¡Estás verificado!</p>
              <p className="text-sm text-muted-foreground">Tu perfil está listo para agendar visitas</p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">¿Qué pasa después?</p>
                <p className="text-sm text-muted-foreground">
                  Tu solicitud será enviada a la inmobiliaria. Te confirmarán un horario dentro de las próximas 24-48 horas.
                </p>
              </div>
            </div>
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
            onClick={handleSubmit}
            className="flex-1 rounded-full gap-2"
          >
            <Send className="h-4 w-4" />
            Enviar solicitud de visita
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default VisitaSolicitud;
