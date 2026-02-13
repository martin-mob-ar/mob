"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useVisita } from "@/contexts/VisitaContext";
import { 
  MapPin, 
  BadgeCheck,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock
} from "lucide-react";
import { properties } from "@/data/properties";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const VisitaSeleccionarHorario = () => {
  const router = useRouter();
  const { selectedProperty, setVisitApproval, setVisitConfirmation } = useVisita();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Use mock property if none selected
  const property = selectedProperty || {
    id: "1",
    title: "Departamento 2 ambientes",
    address: "Av. Santa Fe 2500",
    neighborhood: "Palermo",
    price: 450000,
    image: properties[0]?.image || ""
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      setVisitApproval("pending");
      router.push("/visita/espera");
    }
  };

  const handleBack = () => {
    router.push("/visita/perfil-verificado");
  };

  const isFormComplete = selectedDate && selectedTime;

  // Disable past dates
  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <ReservationLayout showProgress={false}>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl font-bold">
              Elegí el día y horario
            </h1>
            <p className="text-muted-foreground">
              Seleccioná cuándo querés visitar la propiedad
            </p>
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

          {/* Calendar */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Seleccioná el día</span>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disablePastDates}
                locale={es}
                className={cn("rounded-md border-0 pointer-events-auto")}
              />
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Seleccioná el horario</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "p-3 rounded-lg text-sm font-medium transition-colors",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selection Summary */}
          {selectedDate && selectedTime && (
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
              <p className="text-sm text-muted-foreground mb-1">Tu visita</p>
              <p className="font-semibold text-foreground">
                {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las {selectedTime}
              </p>
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
            onClick={handleConfirm}
            className="flex-1 rounded-full gap-2"
            disabled={!isFormComplete}
          >
            Confirmar visita
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default VisitaSeleccionarHorario;
