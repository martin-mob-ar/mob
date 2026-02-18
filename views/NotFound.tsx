"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <p className="font-ubuntu text-primary text-2xl font-bold mb-6">mob</p>
        <h1 className="font-display text-6xl font-bold text-foreground mb-3">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          La página que buscás no existe o fue movida.
        </p>
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
