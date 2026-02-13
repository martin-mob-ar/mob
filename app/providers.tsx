"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { MockUserProvider } from "@/contexts/MockUserContext";
import { ReservationProvider } from "@/contexts/ReservationContext";
import { VisitaProvider } from "@/contexts/VisitaContext";
import AuthModal from "@/components/AuthModal";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MockUserProvider>
          <ReservationProvider>
            <VisitaProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AuthModal />
                {children}
              </TooltipProvider>
            </VisitaProvider>
          </ReservationProvider>
        </MockUserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
