import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// In-memory cache for the exchange rate (avoids hitting DB on every request)
let cachedRate: { value: number; timestamp: number } | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * GET /api/exchange-rate
 *
 * Returns the current USD/ARS exchange rate from DB (cached in-memory for 1 hour).
 * The rate is updated daily by the /api/cron/exchange-rate cron job.
 */
export async function GET() {
  // Return in-memory cache if fresh
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION_MS) {
    return NextResponse.json(
      { rate: cachedRate.value, source: "cache" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  }

  // Read from DB
  const { data, error } = await supabaseAdmin
    .from("exchange_rates")
    .select("rate, updated_at")
    .eq("currency_pair", "USD_ARS")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { rate: null, error: "Exchange rate not available" },
      { status: 502 }
    );
  }

  const rate = Number(data.rate);
  cachedRate = { value: rate, timestamp: Date.now() };

  return NextResponse.json(
    { rate, source: "db", updated_at: data.updated_at },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    }
  );
}
