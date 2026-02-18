"use client";

import { useState, useEffect } from "react";

let globalRate: number | null = null;
let globalPromise: Promise<number | null> | null = null;

async function fetchRate(): Promise<number | null> {
  try {
    const res = await fetch("/api/exchange-rate");
    if (!res.ok) return null;
    const data = await res.json();
    return data.rate ?? null;
  } catch {
    return null;
  }
}

export function useExchangeRate() {
  const [rate, setRate] = useState<number | null>(globalRate);
  const [isLoading, setIsLoading] = useState(!globalRate);

  useEffect(() => {
    if (globalRate) {
      setRate(globalRate);
      setIsLoading(false);
      return;
    }

    if (!globalPromise) {
      globalPromise = fetchRate();
    }

    globalPromise.then((r) => {
      globalRate = r;
      setRate(r);
      setIsLoading(false);
    });
  }, []);

  return { rate, isLoading };
}
