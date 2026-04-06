"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, MessageCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimateHeight } from "@/components/ui/animate-height";
import { COUNTRY_CODES } from "@/lib/constants/country-codes";
import { useAuth } from "@/contexts/AuthContext";

interface VerificationSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VerificationSuccessModal = ({ open, onOpenChange }: VerificationSuccessModalProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, refreshUser } = useAuth();

  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editCountryCode, setEditCountryCode] = useState(user?.phoneCountryCode || "+54");
  const [isSending, setIsSending] = useState(false);
  const [resent, setResent] = useState(false);

  const formattedPhone = user?.phone
    ? `${user.phoneCountryCode || "+54"} ${user.phone}`
    : "";

  const handleDismiss = () => {
    onOpenChange(false);
    // Strip ?verification from URL
    router.replace(pathname, { scroll: false });
  };

  const handleResend = async () => {
    if (editPhone.length < 6) return;
    setIsSending(true);
    try {
      // Update phone in DB
      const profileRes = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefono: editPhone,
          telefono_country_code: editCountryCode,
        }),
      });

      if (!profileRes.ok) {
        const data = await profileRes.json().catch(() => ({}));
        throw new Error(data.error || "Error al actualizar teléfono");
      }

      // Refresh auth context
      await refreshUser();

      // Re-trigger Truora outbound
      await fetch("/api/truora/outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: editPhone,
          country_code: editCountryCode,
          name: user?.name || "",
          accountType: user?.accountType || 2,
        }),
      });

      setResent(true);
      setShowPhoneEdit(false);
      toast.success("Mensaje reenviado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al reenviar",
        { position: "bottom-right" }
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent className="sm:max-w-md p-6 gap-0">
        <DialogTitle className="sr-only">Propiedad publicada</DialogTitle>

        <div>
          <div className="text-center space-y-2">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <Shield className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Verificá tu identidad
            </h2>
            <p className="text-sm text-muted-foreground">
              Tu propiedad fue creada, pero no será visible hasta que verifiques tu identidad. Es rápido y solo se hace una vez.
            </p>
          </div>

          <div className="mt-5 flex items-start gap-2.5 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              Te enviamos un WhatsApp al{" "}
              <span className="font-semibold text-foreground">{formattedPhone}</span>.
              Respondé para verificarte.
            </p>
          </div>

          <AnimateHeight show={!showPhoneEdit && !resent}>
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowPhoneEdit(true);
                  setEditPhone(user?.phone || "");
                  setEditCountryCode(user?.phoneCountryCode || "+54");
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                No recibí el mensaje
              </button>
            </div>
          </AnimateHeight>

          <AnimateHeight show={showPhoneEdit}>
            <div className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">
                Editá tu número y te reenviamos el mensaje:
              </p>
              <div className="flex gap-2">
                <Select value={editCountryCode} onValueChange={setEditCountryCode}>
                  <SelectTrigger className="h-12 rounded-xl text-sm w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {COUNTRY_CODES.map((code) => (
                      <SelectItem key={code.value} value={code.value}>
                        {code.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="(11) 0000-0000"
                  autoComplete="tel-national"
                  value={editPhone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "");
                    setEditPhone(cleaned);
                  }}
                  className="h-12 rounded-xl flex-1"
                />
              </div>
              <Button
                onClick={handleResend}
                disabled={isSending || editPhone.length < 6}
                className="w-full rounded-xl h-11 font-semibold"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  "Guardar y reenviar"
                )}
              </Button>
            </div>
          </AnimateHeight>

          <AnimateHeight show={resent}>
            <div className="text-center mt-4">
              <p className="text-sm text-primary font-medium">
                Mensaje reenviado correctamente
              </p>
            </div>
          </AnimateHeight>

          <Button
            onClick={handleDismiss}
            className="w-full rounded-xl h-11 font-semibold mt-5"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationSuccessModal;
