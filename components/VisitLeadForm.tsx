"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import VisitSchedulePicker from "@/components/VisitSchedulePicker";

interface VisitLeadFormProps {
  propertyId: number;
  propertyAddress: string;
  visitDays: string[];
  visitHours: string[];
  onClose: () => void;
}

export default function VisitLeadForm({
  propertyId,
  visitDays,
  visitHours,
  onClose,
}: VisitLeadFormProps) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isVerified = !!user?.isVerified;

  /** Build /verificate URL with query params for the selected visit */
  const buildVerificateUrl = () => {
    const params = new URLSearchParams();
    params.set("propertyId", String(propertyId));
    if (selectedDate) params.set("date", format(selectedDate, "yyyy-MM-dd"));
    if (selectedTime) params.set("time", selectedTime);
    return `/verificate?${params.toString()}`;
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    if (!isAuthenticated) {
      // Unlogged: open auth modal with redirect to /verificate
      const verificateUrl = buildVerificateUrl();
      const params = new URLSearchParams(window.location.search);
      params.set("auth", "open");
      params.set("redirect", verificateUrl);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      openAuthModal();
      return;
    }

    if (!isVerified) {
      // Logged in + unverified: navigate to /verificate
      router.push(buildVerificateUrl());
      return;
    }

    // Logged in + verified: placeholder for truora outbound
    // TODO: Call truora outbound API to schedule visit
    setSubmitted(true);
  };

  // Post-submission state (verified users)
  if (submitted) {
    return (
      <div className="text-center py-4 space-y-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">¡Solicitud de visita enviada!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Te avisaremos cuando el propietario confirme o proponga otro horario.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSubmitted(false);
            onClose();
          }}
        >
          Volver
        </Button>
      </div>
    );
  }

  const isFormComplete = selectedDate && selectedTime;

  return (
    <div className="space-y-3">
      {/* Header with back button */}
      <div className="flex items-center gap-2 -ml-2">
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-sm">Agendar visita</h3>
      </div>

      {/* Schedule Picker */}
      <VisitSchedulePicker
        visitDays={visitDays}
        visitHours={visitHours}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateSelect={setSelectedDate}
        onTimeSelect={setSelectedTime}
      />

      {/* Submit */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!isFormComplete}
        className="w-full h-10 rounded-xl font-semibold text-sm"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Agendar visita
      </Button>
    </div>
  );
}
