"use client";

import Link from "next/link";


import { Plus, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-6">
            <Link href="/">
              <img src="/assets/mob-logo-new.png" alt="MOB" className="h-7" />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Button asChild variant="default" size="sm" className="rounded-full gap-2">
              <Link href="/subir-propiedad">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar propiedad</span>
              </Link>
            </Button>

            {/* User menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {getInitials(user?.name || "JP")}
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-sm">{user?.name || "Juan Pérez"}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-destructive/10 transition-colors ml-2"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default PanelLayout;
