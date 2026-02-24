"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReservationLayout from "@/components/reservation/ReservationLayout";
import { useReservation } from "@/contexts/ReservationContext";
import { 
  CreditCard, 
  Lock,
  ChevronLeft,
  AlertCircle
} from "lucide-react";

const Pago = () => {
  const router = useRouter();
  const { setPaymentStatus, selectedProperty } = useReservation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showError, setShowError] = useState(false);

  const property = selectedProperty || { price: 450000 };
  const reservationAmount = Math.round(property.price * 0.1);

  const handlePaySuccess = () => {
    setIsProcessing(true);
    setShowError(false);
    setTimeout(() => {
      setPaymentStatus("success");
      router.push("/reserva/pago-ok");
    }, 2000);
  };

  const handlePayFailed = () => {
    setIsProcessing(true);
    setShowError(false);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus("failed");
      setShowError(true);
    }, 2000);
  };

  const handleBack = () => {
    router.push("/reserva/checkout");
  };

  return (
    <ReservationLayout currentStep={6} totalSteps={6}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <CreditCard className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              Completá el pago
            </h1>
            <p className="text-muted-foreground">
              Procesamos tu pago de forma segura
            </p>
          </div>

          {/* Error message */}
          {showError && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                Hubo un problema con el pago. Intentá nuevamente.
              </p>
            </div>
          )}

          {/* Mock Payment Form */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            {/* Amount */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Total a pagar</span>
              <span className="font-semibold text-foreground">${reservationAmount.toLocaleString("es-AR")}</span>
            </div>

            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número de tarjeta</Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                className="h-12 rounded-xl font-mono"
                disabled={isProcessing}
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Vencimiento</Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  className="h-12 rounded-xl"
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  className="h-12 rounded-xl"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre en la tarjeta</Label>
              <Input
                id="name"
                placeholder="Como figura en la tarjeta"
                className="h-12 rounded-xl"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-xs">Pago seguro encriptado</span>
          </div>

          {/* Demo buttons */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wide">
              Demo: Simular resultado
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handlePaySuccess}
                disabled={isProcessing}
                className="rounded-xl"
              >
                {isProcessing ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  "✓ Pago OK"
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handlePayFailed}
                disabled={isProcessing}
                className="rounded-xl"
              >
                ✗ Pago fallido
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
            onClick={handleBack}
            className="rounded-full"
            disabled={isProcessing}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al resumen
          </Button>
        </div>
      </div>
    </ReservationLayout>
  );
};

export default Pago;
