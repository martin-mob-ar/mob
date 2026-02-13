"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useVisita } from "@/contexts/VisitaContext";
import { properties } from "@/data/properties";
import { 
  Clock,
  CheckCircle2,
  Bell,
  Calendar,
  MapPin,
  BadgeCheck
} from "lucide-react";

const VisitaEspera = () => {
  const router = useRouter();
  const { selectedProperty, setVisitApproval, setVisitConfirmation } = useVisita();
  const [isSimulating, setIsSimulating] = useState(false);

  // Use mock property if none selected
  const property = selectedProperty || {
    id: "1",
    title: "Departamento 2 ambientes",
    address: "Av. Santa Fe 2500",
    neighborhood: "Palermo",
    price: 450000,
    image: properties[0]?.image || ""
  };

  // Simulate approval for demo purposes
  const handleSimulateApproval = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setVisitApproval("approved");
      setVisitConfirmation({
        date: "Lunes 3 de febrero",
        time: "15:00 hs",
        address: "Av. Santa Fe 2500, Piso 4, Depto B",
        contactName: "María González",
        contactPhone: "+54 11 5555-1234",
        contactEmail: "maria@inmobiliaria.com"
      });
      router.push("/visita/confirmada");
    }, 2000);
  };

  const handleSimulateRejection = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setVisitApproval("rejected");
      router.push("/visita/rechazada");
    }, 1500);
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">
                Solicitud enviada
              </h1>
              <p className="text-muted-foreground mt-2">
                Tu solicitud de visita fue enviada correctamente
              </p>
            </div>
          </div>

          {/* Property Summary */}
          <div className="bg-card rounded-xl border border-border p-4 flex gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <img 
                src={property.image || properties[0]?.image} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{property.title || `Depto en ${property.neighborhood}`}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {property.address}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-primary font-medium">Estás verificado</span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Esperando confirmación</p>
                <p className="text-sm text-muted-foreground">La inmobiliaria revisará tu solicitud</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Respuesta estimada:</span>
                <span className="font-medium">24-48 horas</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Te notificaremos por email y en la app</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground text-center">
              La inmobiliaria confirmará tu visita o te propondrá un horario alternativo. 
              Recibirás una notificación cuando haya novedades.
            </p>
          </div>

          {/* Demo buttons - for prototype only */}
          <div className="space-y-3 pt-4 border-t border-dashed border-border">
            <p className="text-xs text-center text-muted-foreground">
              Demo: Simular respuesta de la inmobiliaria
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleSimulateRejection}
                className="flex-1 rounded-full"
                disabled={isSimulating}
              >
                {isSimulating ? "Procesando..." : "Simular rechazo"}
              </Button>
              <Button 
                onClick={handleSimulateApproval}
                className="flex-1 rounded-full"
                disabled={isSimulating}
              >
                {isSimulating ? "Procesando..." : "Simular aprobación"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border shrink-0">
        <div className="max-w-md mx-auto">
          <Button 
            variant="outline"
            onClick={() => router.push("/buscar")}
            className="w-full rounded-full"
          >
            Volver a buscar propiedades
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default VisitaEspera;
