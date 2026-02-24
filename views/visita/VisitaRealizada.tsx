"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useVisita } from "@/contexts/VisitaContext";
import { 
  Home,
  Search,
  BadgeCheck,
  Sparkles
} from "lucide-react";
const KeyRoundIcon = "/assets/key-round-icon.svg";
import { properties } from "@/data/properties";

const VisitaRealizada = () => {
  const router = useRouter();
  const { selectedProperty, resetVisita } = useVisita();

  // Mock property
  const property = selectedProperty || {
    id: "1",
    title: "Departamento 2 ambientes",
    address: "Av. Santa Fe 2500",
    neighborhood: "Palermo",
    price: 450000,
    image: properties[0]?.image || ""
  };

  const handleReserve = () => {
    router.push("/reserva/verificacion-intro");
  };

  const handleKeepSearching = () => {
    router.push("/buscar");
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">
                ¿Cómo fue tu visita?
              </h1>
              <p className="text-muted-foreground mt-2">
                Esperamos que hayas encontrado tu próximo hogar
              </p>
            </div>
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
            <div className="p-4">
              <h3 className="font-semibold">{property.title || `Depto en ${property.neighborhood}`}</h3>
              <p className="text-sm text-muted-foreground">{property.address}, {property.neighborhood}</p>
              <p className="font-display text-lg font-bold mt-2">
                ${property.price.toLocaleString("es-AR")}<span className="text-sm font-normal text-muted-foreground">/mes</span>
              </p>
            </div>
          </div>

          {/* Verified Status */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Tu verificación sigue activa</p>
              <p className="text-sm text-muted-foreground">Podés reservar o seguir buscando sin volver a verificarte</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border shrink-0">
        <div className="max-w-md mx-auto space-y-3">
          <Button 
            onClick={handleReserve}
            className="w-full h-12 rounded-full gap-2 text-base"
          >
            <img src={KeyRoundIcon} alt="" className="h-5 w-5 invert" />
            Reservar esta propiedad
          </Button>
          <Button 
            variant="outline"
            onClick={handleKeepSearching}
            className="w-full rounded-full gap-2"
          >
            <Search className="h-4 w-4" />
            Seguir buscando
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default VisitaRealizada;
