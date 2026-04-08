"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { clarityEvent } from "@/lib/analytics/clarity";

import { Button } from "@/components/ui/button";
import VisitSchedulePicker from "@/components/VisitSchedulePicker";
import ConsultaEnviadaModal from "@/components/ConsultaEnviadaModal";

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
  const [submitting, setSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<{ date: string; time: string }[]>([]);
  const [showModal, setShowModal] = useState(false);

  const isVerified = !!user?.isVerified;

  // Fetch booked slots for this property
  useEffect(() => {
    fetch(`/api/visitas/booked-slots?propertyId=${propertyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.slots) setBookedSlots(data.slots);
      })
      .catch((err) => console.error("[VisitLeadForm] Failed to fetch booked slots:", err));
  }, [propertyId]);

  /** Build /verificate URL with query params for the selected visit */
  const buildVerificateUrl = () => {
    const params = new URLSearchParams();
    params.set("propertyId", String(propertyId));
    if (selectedDate) params.set("date", format(selectedDate, "yyyy-MM-dd"));
    if (selectedTime) params.set("time", selectedTime);
    return `/verificate?${params.toString()}`;
  };

  const handleSubmit = async () => {
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

    // Logged in + verified: create visita directly
    setSubmitting(true);
    try {
      const res = await fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          proposedDate: format(selectedDate, "yyyy-MM-dd"),
          proposedTime: selectedTime,
          name: user!.name ?? "",
          email: user!.email ?? "",
          phone: user!.phone ?? undefined,
          country_code: user!.phoneCountryCode ?? "+54",
          submitterUserId: user!.publicUserId,
        }),
      });
      if (res.ok) {
        clarityEvent("cta_visita");
        setSubmitted(true);
        setShowModal(true);
      } else {
        console.error("[VisitLeadForm] POST /api/visitas failed:", await res.text());
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Post-submission state (verified users)
  if (submitted) {
    return (
      <>
        <div className="text-center py-4 space-y-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">¡Solicitud de visita enviada!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Te avisaremos por WhatsApp cuando el propietario confirme o proponga otro horario.
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
        <ConsultaEnviadaModal open={showModal} onOpenChange={setShowModal} isVisitRequest />
      </>
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
        bookedSlots={bookedSlots}
      />

      {/* Submit */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!isFormComplete || submitting}
        className="w-full h-10 rounded-xl font-semibold text-sm"
      >
        <Calendar className="h-4 w-4 mr-2" />
        {submitting ? "Enviando..." : "Agendar visita"}
      </Button>
    </div>
  );
}
