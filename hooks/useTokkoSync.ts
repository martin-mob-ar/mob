"use client";

import { useRef, useCallback } from "react";
import CryptoJS from "crypto-js";
import { toast } from "sonner";

export function useTokkoSync() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSync = useCallback((apiKey: string) => {
    const apiKeyHash = CryptoJS.SHA256(apiKey).toString();

    // Fire-and-forget POST — keepalive ensures the request survives page navigation
    fetch("/api/tokko/sync", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, limit: 500 }),
    });

    // Show persistent loading toast
    const toastId = toast.loading("Sincronizando propiedades...", {
      duration: Infinity,
    });

    // Poll status every 5 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/tokko/sync/status?apiKeyHash=${encodeURIComponent(apiKeyHash)}`
        );
        const data = await res.json();

        if (data.status === "syncing") {
          toast.loading(data.message || "Sincronizando...", { id: toastId, duration: Infinity });
        } else if (data.status === "done") {
          toast.success(
            `¡Listo! Se sincronizaron ${data.propertiesCount ?? 0} propiedades`,
            { id: toastId, duration: 10000 }
          );
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else if (data.status === "error") {
          toast.error(data.message || "Error en la sincronización", {
            id: toastId,
            duration: 10000,
          });
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // Network error during poll — keep trying
      }
    }, 5000);
  }, []);

  return { startSync };
}
