"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useVisita } from "@/contexts/VisitaContext";
import { 
  XCircle,
  Search,
  Calendar,
  BadgeCheck
} from "lucide-react";

const VisitaRechazada = () => {
  const router = useRouter();
  const { resetVisita } = useVisita();

  const handleSearchMore = () => {
    router.push("/buscar");
  };

  const handleScheduleAnother = () => {
    // Reset and go back to search - user remains verified
    router.push("/buscar");
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">
                Solicitud no aprobada
              </h1>
              <p className="text-muted-foreground mt-2">
                Lamentablemente, tu solicitud de visita no pudo ser aprobada en este momento
              </p>
            </div>
          </div>

          {/* Verified Status - Reassurance */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Tu verificación sigue activa</p>
              <p className="text-sm text-muted-foreground">Podés agendar visitas en otras propiedades sin volver a verificarte</p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground text-center">
              Esto puede pasar por varios motivos: la propiedad ya no está disponible, 
              el propietario eligió otro candidato, o el horario no coincide. 
              No te desanimes, hay muchas propiedades esperándote.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border shrink-0">
        <div className="max-w-md mx-auto space-y-3">
          <Button 
            onClick={handleSearchMore}
            className="w-full rounded-full gap-2"
          >
            <Search className="h-4 w-4" />
            Seguir buscando propiedades
          </Button>
          <Button 
            variant="outline"
            onClick={handleScheduleAnother}
            className="w-full rounded-full gap-2"
          >
            <Calendar className="h-4 w-4" />
            Agendar visita en otra propiedad
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default VisitaRechazada;
