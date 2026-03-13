"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import type { InitialAuthUser } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { MockUserProvider } from "@/contexts/MockUserContext";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { VisitaProvider } from "@/contexts/VisitaContext";
import AuthModal from "@/components/AuthModal";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
  initialUser?: InitialAuthUser | null;
}

/** Shows a toast when the auth session expires silently (token refresh failure). */
function AuthExpiredNotifier() {
  const { authExpired, clearAuthExpired, openAuthModal } = useAuth();

  useEffect(() => {
    if (authExpired) {
      toast("Tu sesion expiro", {
        description: "Inicia sesion nuevamente para continuar.",
        action: {
          label: "Iniciar sesion",
          onClick: () => openAuthModal(),
        },
      });
      clearAuthExpired();
    }
  }, [authExpired, clearAuthExpired, openAuthModal]);

  return null;
}

export function Providers({ children, initialUser }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>
        <FavoritesProvider>
        <MockUserProvider>
          <ReservationProvider>
            <VisitaProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AuthExpiredNotifier />
                <Suspense fallback={null}>
                  <AuthModal />
                </Suspense>
                {children}
              </TooltipProvider>
            </VisitaProvider>
          </ReservationProvider>
        </MockUserProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
