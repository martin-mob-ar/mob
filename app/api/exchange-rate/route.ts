import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Cache the exchange rate in memory for 1 hour
let cachedRate: { value: number; timestamp: number } | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

async function fetchBCRARate(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones/USD",
      {
        headers: { Accept: "application/json" },
        // Skip SSL verification for BCRA's certificate issues
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) throw new Error(`BCRA API returned ${res.status}`);

    const data = await res.json();

    // BCRA response: { status: 200, results: { detalle: [{ tipoCotizacion: "...", ... }] } }
    // The tipoCotizacion in the "detalle" array contains the sell rate
    const detalle = data?.results?.detalle;
    if (Array.isArray(detalle) && detalle.length > 0) {
      // Find the "Venta" (sell) rate, or use tipoCotizacion from the last entry
      const ventaEntry = detalle.find(
        (d: Record<string, unknown>) =>
          typeof d.tipoPase === "string" && d.tipoPase.toLowerCase().includes("venta")
      );
      const rate = ventaEntry?.tipoCotizacion ?? detalle[detalle.length - 1]?.tipoCotizacion;
      if (typeof rate === "number" || typeof rate === "string") {
        return parseFloat(String(rate));
      }
    }

    return null;
  } catch (e) {
    console.error("[exchange-rate] BCRA fetch failed:", e);
    return null;
  }
}

// Fallback: try dolarapi.com (public, no auth, reliable)
async function fetchDolarApiRate(): Promise<number | null> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`dolarapi returned ${res.status}`);
    const data = await res.json();
    // Response: { moneda: "USD", casa: "oficial", nombre: "Oficial", compra: X, venta: Y, ... }
    if (data?.venta) return parseFloat(String(data.venta));
    return null;
  } catch (e) {
    console.error("[exchange-rate] dolarapi fallback failed:", e);
    return null;
  }
}

export async function GET() {
  // Return cached value if fresh
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json({ rate: cachedRate.value, source: "cache" });
  }

  // Try BCRA first, then dolarapi as fallback
  let rate = await fetchBCRARate();
  let source = "bcra";

  if (!rate) {
    rate = await fetchDolarApiRate();
    source = "dolarapi";
  }

  if (rate) {
    cachedRate = { value: rate, timestamp: Date.now() };
    // Sync rate to DB in the background (don't block the response)
    syncRateToDb(rate).catch((e) =>
      console.error("[exchange-rate] DB sync failed:", e)
    );
    return NextResponse.json({ rate, source });
  }

  // If both fail, return a reasonable fallback
  return NextResponse.json(
    { rate: null, error: "Could not fetch exchange rate" },
    { status: 502 }
  );
}

/**
 * POST /api/exchange-rate
 * Force-refresh the exchange rate: fetch latest, update DB, rebuild all listings.
 */
export async function POST() {
  let rate = await fetchBCRARate();
  let source = "bcra";

  if (!rate) {
    rate = await fetchDolarApiRate();
    source = "dolarapi";
  }

  if (!rate) {
    return NextResponse.json(
      { error: "Could not fetch exchange rate" },
      { status: 502 }
    );
  }

  cachedRate = { value: rate, timestamp: Date.now() };

  // Update DB and rebuild listings
  await syncRateToDb(rate);
  await supabaseAdmin.rpc("rebuild_all_property_listings");

  return NextResponse.json({ rate, source, rebuilt: true });
}

/** Update the exchange_rates table with the latest rate */
async function syncRateToDb(rate: number) {
  await supabaseAdmin
    .from("exchange_rates")
    .upsert(
      { currency_pair: "USD_ARS", rate, updated_at: new Date().toISOString() },
      { onConflict: "currency_pair" }
    );
}
