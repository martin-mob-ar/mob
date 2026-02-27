"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { MockUserProvider } from "@/contexts/MockUserContext";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { VisitaProvider } from "@/contexts/VisitaContext";
import AuthModal from "@/components/AuthModal";
import { useState, Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
        <MockUserProvider>
          <ReservationProvider>
            <VisitaProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
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
