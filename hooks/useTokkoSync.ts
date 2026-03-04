"use client";

import { useRef, useCallback, useEffect } from "react";
import CryptoJS from "crypto-js";
import { toast } from "sonner";

const SYNC_HASH_KEY = "mob_sync_apiKeyHash";

function pollSyncStatus(
  apiKeyHash: string,
  intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  toastId?: string | number
) {
  const id =
    toastId ??
    toast.loading("Sincronizando propiedades...", { duration: Infinity });

  intervalRef.current = setInterval(async () => {
    try {
      const res = await fetch(
        `/api/tokko/sync/status?apiKeyHash=${encodeURIComponent(apiKeyHash)}`
      );
      const data = await res.json();

      if (data.status === "syncing") {
        toast.loading(data.message || "Sincronizando...", {
          id,
          duration: Infinity,
        });
      } else if (data.status === "done") {
        toast.success(
          `¡Listo! Se sincronizaron ${data.propertiesCount ?? 0} propiedades`,
          { id, duration: 10000 }
        );
        sessionStorage.removeItem(SYNC_HASH_KEY);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else if (data.status === "error") {
        toast.error(data.message || "Error en la sincronización", {
          id,
          duration: 10000,
        });
        sessionStorage.removeItem(SYNC_HASH_KEY);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch {
      // Network error during poll — keep trying
    }
  }, 2000);
}

export function useTokkoSync() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount: resume polling if there's an active sync from a previous page load
  useEffect(() => {
    const savedHash = sessionStorage.getItem(SYNC_HASH_KEY);
    if (!savedHash) return;

    // Check if sync is still active before starting polling
    fetch(
      `/api/tokko/sync/status?apiKeyHash=${encodeURIComponent(savedHash)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "syncing") {
          pollSyncStatus(savedHash, intervalRef);
        } else if (data.status === "done") {
          toast.success(
            `¡Listo! Se sincronizaron ${data.propertiesCount ?? 0} propiedades`,
            { duration: 10000 }
          );
          sessionStorage.removeItem(SYNC_HASH_KEY);
        } else if (data.status === "error") {
          toast.error(data.message || "Error en la sincronización", {
            duration: 10000,
          });
          sessionStorage.removeItem(SYNC_HASH_KEY);
        } else {
          // idle or unknown — clean up
          sessionStorage.removeItem(SYNC_HASH_KEY);
        }
      })
      .catch(() => {});

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startSync = useCallback(
    (apiKey: string, authId?: string, authEmail?: string) => {
      const apiKeyHash = CryptoJS.SHA256(apiKey).toString();

      // Persist hash so polling survives page reload
      sessionStorage.setItem(SYNC_HASH_KEY, apiKeyHash);

      // Fire-and-forget POST — keepalive ensures the request survives page navigation
      fetch("/api/tokko/sync", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, limit: 500, authId, authEmail }),
      });

      pollSyncStatus(apiKeyHash, intervalRef);
    },
    []
  );

  return { startSync };
}
