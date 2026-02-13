"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

const mobLogo = "/assets/mob-logo-new.png";

interface ReservationLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
  showProgress?: boolean;
  onExit?: () => void;
}

const ReservationLayout = ({ 
  children, 
  currentStep, 
  totalSteps, 
  showProgress = true,
  onExit 
}: ReservationLayoutProps) => {
  const router = useRouter();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0">
        <img src={mobLogo} alt="MOB" className="h-6" />
        <button 
          onClick={handleExit}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Salir
        </button>
      </header>

      {/* Progress indicator */}
      {showProgress && currentStep && totalSteps && (
        <div className="px-6 pt-6 shrink-0">
          <div className="max-w-md mx-auto">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Paso {currentStep} de {totalSteps}
            </p>
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <div 
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    s <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default ReservationLayout;
