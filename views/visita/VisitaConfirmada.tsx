"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useVisita } from "@/contexts/VisitaContext";
import { properties } from "@/data/properties";
import { 
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Bell,
  Home,
  BadgeCheck
} from "lucide-react";

const VisitaConfirmada = () => {
  const router = useRouter();
  const { visitConfirmation, selectedProperty } = useVisita();

  // Mock data if not set
  const confirmation = visitConfirmation || {
    date: "Lunes 3 de febrero",
    time: "15:00 hs",
    address: "Av. Santa Fe 2500, Piso 4, Depto B",
    contactName: "María González",
    contactPhone: "+54 11 5555-1234",
    contactEmail: "maria@inmobiliaria.com"
  };

  // Use mock property if none selected
  const property = selectedProperty || {
    id: "1",
    title: "Departamento 2 ambientes",
    address: "Av. Santa Fe 2500",
    neighborhood: "Palermo",
    price: 450000,
    image: properties[0]?.image || ""
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">
                ¡Visita confirmada!
              </h1>
              <p className="text-muted-foreground mt-2">
                Tu visita fue aprobada. Te esperamos.
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

          {/* Visit Details Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{confirmation.date}</p>
                  <p className="text-primary font-medium">{confirmation.time}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{confirmation.address}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">Datos de contacto</p>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{confirmation.contactName}</p>
                    <p className="text-sm text-muted-foreground">Inmobiliaria</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${confirmation.contactPhone}`} className="text-primary hover:underline">
                    {confirmation.contactPhone}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${confirmation.contactEmail}`} className="text-primary hover:underline">
                    {confirmation.contactEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder Notice */}
          <div className="bg-secondary/50 rounded-xl p-4 flex items-start gap-3">
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Recordatorios automáticos</p>
              <p className="text-sm text-muted-foreground">
                Te enviaremos un recordatorio 24 horas y 1 hora antes de tu visita
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border shrink-0">
        <div className="max-w-md mx-auto space-y-3">
          <Button 
            onClick={handleGoHome}
            className="w-full rounded-full gap-2"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Después de la visita podrás reservar esta propiedad desde tu panel
          </p>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default VisitaConfirmada;
