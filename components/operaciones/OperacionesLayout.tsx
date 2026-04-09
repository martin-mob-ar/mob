"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface OperacionesLayoutProps {
  children: ReactNode;
}

const OperacionesLayout = ({ children }: OperacionesLayoutProps) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-foreground">
            Validación por Hoggax
          </span>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Salir
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
};

export default OperacionesLayout;
