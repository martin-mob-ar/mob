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
 * Fetch latest UVA value from BCRA Estadísticas Monetarias API (variable 31).
 * Returns the most recent UVA value and its date.
 */
async function fetchBCRAUva(): Promise<{ valor: number; fecha: string } | { error: string }> {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

    const res = await fetch(
      `https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/31?limit=5&offset=0&desde=${weekAgo}&hasta=${today}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (!res.ok) {
      const msg = `BCRA UVA API returned HTTP ${res.status}`;
      console.error(`[cron/exchange-rate] ${msg}`);
      return { error: msg };
    }

    const data = await res.json();
    const detalle = data?.results?.[0]?.detalle;
    if (!Array.isArray(detalle) || detalle.length === 0) {
      return { error: 'BCRA UVA response missing detalle array' };
    }

    // detalle is sorted descending by date; first entry is the latest
    const latest = detalle[0];
    const valor = parseFloat(String(latest.valor));
    const fecha = String(latest.fecha).slice(0, 10);

    // Sanity check: UVA should be between 10 and 100000
    if (isNaN(valor) || valor < 10 || valor > 100000) {
      const msg = `BCRA UVA value out of bounds: ${valor}`;
      console.error(`[cron/exchange-rate] ${msg}`);
      return { error: msg };
    }

    return { valor, fecha };
  } catch (e) {
    const msg = `BCRA UVA fetch failed: ${e instanceof Error ? e.message : String(e)}`;
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

  // Fetch USD rate and UVA in parallel
  const [bcraResult, uvaResult] = await Promise.all([
    fetchBCRARate(),
    fetchBCRAUva(),
  ]);

  const errors: string[] = [];

  // ── USD/ARS ──
  let rate: number | null = null;
  let rebuilt: number | null = null;

  if ('error' in bcraResult) {
    errors.push(`USD: ${bcraResult.error}`);
  } else {
    rate = bcraResult.rate;

    const { error: upsertError } = await supabaseAdmin
      .from('exchange_rates')
      .upsert(
        { currency_pair: 'USD_ARS', rate, updated_at: new Date().toISOString() },
        { onConflict: 'currency_pair' }
      );

    if (upsertError) {
      console.error('[cron/exchange-rate] USD upsert failed:', upsertError);
      errors.push(`USD upsert: ${upsertError.message}`);
    } else {
      // Rebuild only USD-priced property listings
      const { data: rebuildData, error: rebuildError } = await supabaseAdmin.rpc(
        'rebuild_usd_property_listings'
      );

      if (rebuildError) {
        console.error('[cron/exchange-rate] Rebuild failed:', rebuildError);
        errors.push(`Rebuild: ${rebuildError.message}`);
      } else {
        rebuilt = rebuildData;
      }
    }
  }

  // ── UVA ──
  let uvaValor: number | null = null;
  let uvaFecha: string | null = null;

  if ('error' in uvaResult) {
    errors.push(`UVA: ${uvaResult.error}`);
  } else {
    uvaValor = uvaResult.valor;
    uvaFecha = uvaResult.fecha;

    const { error: uvaUpsertError } = await supabaseAdmin
      .from('exchange_rates')
      .upsert(
        { currency_pair: 'UVA_ARS', rate: uvaValor, updated_at: new Date().toISOString() },
        { onConflict: 'currency_pair' }
      );

    if (uvaUpsertError) {
      console.error('[cron/exchange-rate] UVA upsert failed:', uvaUpsertError);
      errors.push(`UVA upsert: ${uvaUpsertError.message}`);
    }
  }

  // ── Log & respond ──
  const status = errors.length === 0 ? 'completed' : (rate || uvaValor) ? 'partial' : 'failed';

  console.log(`[cron/exchange-rate] USD: ${rate}, UVA: ${uvaValor} (${uvaFecha}), rebuilt ${rebuilt} listings, status: ${status}`);

  if (logId) {
    await supabaseAdmin
      .from('cron_job_log')
      .update({
        finished_at: new Date().toISOString(),
        status,
        error_message: errors.length ? errors.join('; ') : null,
        stats: { rate, uva: uvaValor, uvaFecha, rebuilt, source: 'bcra' },
      })
      .eq('id', logId);
  }

  if (status === 'failed') {
    return NextResponse.json({ error: errors.join('; ') }, { status: 502 });
  }

  return NextResponse.json({ rate, uva: uvaValor, uvaFecha, rebuilt, source: 'bcra' });
}
