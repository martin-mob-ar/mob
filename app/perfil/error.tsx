"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function PerfilError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-xl font-semibold mb-2">Algo salio mal</h2>
      <p className="text-muted-foreground mb-6">
        Ocurrio un error inesperado. Por favor, intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
