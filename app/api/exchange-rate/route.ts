import { NextResponse } from "next/server";
import https from "node:https";
import { supabaseAdmin } from "@/lib/supabase/server";

// Cache the exchange rate in memory for 1 hour
let cachedRate: { value: number; timestamp: number } | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// BCRA has an incomplete SSL certificate chain — use Node's https directly to bypass it
function fetchBCRARate(): Promise<number | null> {
  return new Promise((resolve) => {
    const req = https.get(
      "https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones/USD",
      { headers: { Accept: "application/json" }, rejectUnauthorized: false },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode !== 200) {
              console.error(`[exchange-rate] BCRA API returned ${res.statusCode}`);
              return resolve(null);
            }
            const data = JSON.parse(body);
            // BCRA response: { results: [{ fecha, detalle: [{ tipoCotizacion, ... }] }] }
            const detalle = data?.results?.[0]?.detalle;
            if (Array.isArray(detalle) && detalle.length > 0) {
              const rate = detalle[detalle.length - 1]?.tipoCotizacion;
              if (typeof rate === "number" || typeof rate === "string") {
                return resolve(parseFloat(String(rate)));
              }
            }
            resolve(null);
          } catch (e) {
            console.error("[exchange-rate] BCRA parse failed:", e);
            resolve(null);
          }
        });
      }
    );
    req.on("error", (e) => {
      console.error("[exchange-rate] BCRA fetch failed:", e);
      resolve(null);
    });
    req.end();
  });
}

export async function GET() {
  // Return cached value if fresh
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json({ rate: cachedRate.value, source: "cache" });
  }

  const rate = await fetchBCRARate();

  if (rate) {
    cachedRate = { value: rate, timestamp: Date.now() };
    syncRateToDb(rate).catch((e) =>
      console.error("[exchange-rate] DB sync failed:", e)
    );
    return NextResponse.json({ rate, source: "bcra" });
  }

  return NextResponse.json(
    { rate: null, error: "Could not fetch exchange rate from BCRA" },
    { status: 502 }
  );
}

/**
 * POST /api/exchange-rate
 * Force-refresh the exchange rate: fetch latest, update DB, rebuild all listings.
 */
export async function POST() {
  const rate = await fetchBCRARate();

  if (!rate) {
    return NextResponse.json(
      { error: "Could not fetch exchange rate from BCRA" },
      { status: 502 }
    );
  }

  cachedRate = { value: rate, timestamp: Date.now() };

  // Update DB and rebuild listings
  await syncRateToDb(rate);
  await supabaseAdmin.rpc("rebuild_all_property_listings");

  return NextResponse.json({ rate, source: "bcra", rebuilt: true });
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
