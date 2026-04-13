import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';

export const maxDuration = 60;

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = request.headers.get('authorization') || '';
  const expected = `Bearer ${cronSecret}`;
  try {
    const a = Buffer.from(authHeader);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Fetch USD/ARS official rate from BCRA API.
 * Uses native fetch (Node 18+) with proper SSL handling.
 * Validates response is within reasonable bounds.
 */
async function fetchBCRARate(): Promise<{ rate: number } | { error: string }> {
  try {
    const res = await fetch(
      'https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones/USD',
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (!res.ok) {
      const msg = `BCRA API returned HTTP ${res.status}`;
      console.error(`[cron/exchange-rate] ${msg}`);
      return { error: msg };
    }

    const data = await res.json();
    const detalle = data?.results?.[0]?.detalle;
    if (!Array.isArray(detalle) || detalle.length === 0) {
      return { error: 'BCRA response missing detalle array' };
    }

    const rate = parseFloat(String(detalle[detalle.length - 1]?.tipoCotizacion));

    // Sanity check: rate should be between 100 and 50000 ARS per USD
    if (isNaN(rate) || rate < 100 || rate > 50000) {
      const msg = `BCRA rate out of bounds: ${rate}`;
      console.error(`[cron/exchange-rate] ${msg}`);
      return { error: msg };
    }

    return { rate };
  } catch (e) {
    const msg = `BCRA fetch failed: ${e instanceof Error ? e.message : String(e)}`;
    console.error(`[cron/exchange-rate] ${msg}`);
    return { error: msg };
  }
}

/**
 * GET /api/cron/exchange-rate
 *
 * Daily cron (midnight UTC) that:
 * 1. Fetches latest USD/ARS rate from BCRA
 * 2. Stores it in exchange_rates table
 * 3. Rebuilds only USD-priced property listings (targeted, no TRUNCATE)
 *
 * Secured via CRON_SECRET (Vercel injects Authorization header).
 */
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Log cron start
  const { data: logRow } = await supabaseAdmin
    .from('cron_job_log')
    .insert({ job_name: 'exchange-rate', status: 'running' })
    .select('id')
    .single();
  const logId = logRow?.id ?? null;

  const bcraResult = await fetchBCRARate();

  if ('error' in bcraResult) {
    if (logId) {
      await supabaseAdmin
        .from('cron_job_log')
        .update({
          finished_at: new Date().toISOString(),
          status: 'failed',
          error_message: bcraResult.error,
        })
        .eq('id', logId);
    }
    return NextResponse.json(
      { error: bcraResult.error },
      { status: 502 }
    );
  }

  const rate = bcraResult.rate;

  // Store in DB
  const { error: upsertError } = await supabaseAdmin
    .from('exchange_rates')
    .upsert(
      { currency_pair: 'USD_ARS', rate, updated_at: new Date().toISOString() },
      { onConflict: 'currency_pair' }
    );

  if (upsertError) {
    console.error('[cron/exchange-rate] DB upsert failed:', upsertError);
    if (logId) {
      await supabaseAdmin
        .from('cron_job_log')
        .update({
          finished_at: new Date().toISOString(),
          status: 'failed',
          error_message: `DB upsert failed: ${upsertError.message}`,
        })
        .eq('id', logId);
    }
    return NextResponse.json({ error: 'DB upsert failed' }, { status: 500 });
  }

  // Rebuild only USD-priced property listings
  const { data: rebuilt, error: rebuildError } = await supabaseAdmin.rpc(
    'rebuild_usd_property_listings'
  );

  if (rebuildError) {
    console.error('[cron/exchange-rate] Rebuild failed:', rebuildError);
    if (logId) {
      await supabaseAdmin
        .from('cron_job_log')
        .update({
          finished_at: new Date().toISOString(),
          status: 'failed',
          error_message: `Rebuild failed: ${rebuildError.message}`,
          stats: { rate, rebuilt: 0, source: 'bcra' },
        })
        .eq('id', logId);
    }
    return NextResponse.json({
      rate,
      rebuilt: 0,
      error: rebuildError.message,
    });
  }

  console.log(`[cron/exchange-rate] Rate: ${rate}, rebuilt ${rebuilt} USD listings`);

  if (logId) {
    await supabaseAdmin
      .from('cron_job_log')
      .update({
        finished_at: new Date().toISOString(),
        status: 'completed',
        stats: { rate, rebuilt, source: 'bcra' },
      })
      .eq('id', logId);
  }

  return NextResponse.json({ rate, rebuilt, source: 'bcra' });
}
