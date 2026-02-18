"use client";

import { useState, useEffect, useRef } from "react";

export interface LocationResult {
  id: number;
  name: string;
  depth: number;
  display: string;
}

export function useLocationSearch(query: string, { enabled = true, limit = 15 } = {}) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      // Abort previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({ q: query.trim(), limit: String(limit) });
        const res = await fetch(`/api/locations/search?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        setResults(json.data || []);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, enabled, limit]);

  return { results, isLoading };
}
