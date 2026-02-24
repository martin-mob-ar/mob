"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useReservation } from "@/contexts/ReservationContext";
import { 
  MapPin, 
  CreditCard, 
  ArrowRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  Home
} from "lucide-react";

const Checkout = () => {
  const router = useRouter();
  const { selectedProperty } = useReservation();

  // Mock property data if not set
  const property = selectedProperty || {
    id: "1",
    title: "Depto de 2 ambientes en Palermo",
    address: "Av. Santa Fe 3200",
    neighborhood: "Palermo",
    price: 450000,
    image: "/placeholder.svg"
  };

  const reservationAmount = Math.round(property.price * 0.1); // 10% as reservation

  const handlePay = () => {
    router.push("/reserva/pago");
  };

  const handleBack = () => {
    router.push("/reserva/perfil-verificado");
  };

  return (
    <ReservationLayout currentStep={5} totalSteps={6}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl font-bold">
              Resumen de tu reserva
            </h1>
            <p className="text-muted-foreground">
              Revisá los detalles antes de continuar
            </p>
          </div>

          {/* Property Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="aspect-video relative">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-background/95 text-primary shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verificada
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">{property.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {property.address}, {property.neighborhood}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Alquiler mensual</span>
                <span className="font-semibold">${property.price.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>

          {/* Reservation Amount */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Monto de reserva</p>
                <p className="text-sm text-muted-foreground">10% del primer mes</p>
              </div>
              <p className="font-display text-2xl font-bold text-primary">
                ${reservationAmount.toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              La reserva queda sujeta a aprobación del propietario. Si no es aprobada, el monto se reintegra.
            </p>
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
            onClick={handlePay}
            className="flex-1 rounded-full gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Ir a pagar
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default Checkout;
