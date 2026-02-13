"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useReservation } from "@/contexts/ReservationContext";
import { 
  XCircle, 
  Search,
  RefreshCw,
  Heart
} from "lucide-react";

const Rechazada = () => {
  const router = useRouter();
  const { resetReservation } = useReservation();

  const handleSearchProperties = () => {
    resetReservation();
    router.push("/buscar");
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="h-20 w-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              El propietario no aprobó la reserva
            </h1>
            <p className="text-muted-foreground">
              No te preocupes, hay muchas opciones esperándote
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Tu pago fue reintegrado</p>
                <p className="text-sm text-muted-foreground">
                  El monto de la reserva ya está en tu cuenta
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Tu verificación sigue activa</p>
                <p className="text-sm text-muted-foreground">
                  Podés aplicar a otras propiedades al instante
                </p>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">+200 propiedades</span> disponibles en tu zona
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border shrink-0">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleSearchProperties}
            className="w-full rounded-full gap-2"
            size="lg"
          >
            <Search className="h-4 w-4" />
            Ver otras propiedades
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default Rechazada;
