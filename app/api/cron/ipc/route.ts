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
 * Fetch all IPC monthly rates from the official Argentine government API (datos.gob.ar).
 * Series: 148.3_INIVELNAL_DICI_M_26 — IPC Nivel General Nacional, monthly % change.
 * No authentication required. Returns decimal values (e.g. 0.034 = 3.4%).
 */
async function fetchIPCRates(): Promise<
  { rows: { period: string; rate: number }[] } | { error: string }
> {
  try {
    const url =
      'https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&format=json&representation_mode=percent_change&start_date=2020-01';

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      const msg = `datos.gob.ar API returned HTTP ${res.status}`;
      console.error(`[cron/ipc] ${msg}`);
      return { error: msg };
    }

    const json = await res.json();
    const data = json?.data;

    if (!Array.isArray(data) || data.length === 0) {
      return { error: 'datos.gob.ar response missing data array' };
    }

    const rows: { period: string; rate: number }[] = [];

    for (const entry of data) {
      if (!Array.isArray(entry) || entry.length < 2) continue;
      const [dateStr, decimalVal] = entry as [string, number];

      // Parse "YYYY-MM-DD" → "YYYY-MM"
      const period = String(dateStr).slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(period)) continue;

      const rate = Math.round(Number(decimalVal) * 1000) / 10; // decimal → %, 1 decimal place

      // Sanity check: IPC Argentina should be between -5% and 50% monthly
      if (isNaN(rate) || rate < -5 || rate > 50) {
        console.warn(`[cron/ipc] Skipping out-of-bounds rate for ${period}: ${rate}`);
        continue;
      }

      rows.push({ period, rate });
    }

    if (rows.length === 0) {
      return { error: 'No valid IPC rows parsed from API response' };
    }

    return { rows };
  } catch (e) {
    const msg = `datos.gob.ar fetch failed: ${e instanceof Error ? e.message : String(e)}`;
    console.error(`[cron/ipc] ${msg}`);
    return { error: msg };
  }
}

/**
 * GET /api/cron/ipc
 *
 * Daily cron (4 AM UTC) that:
 * 1. Fetches all IPC monthly rates from datos.gob.ar (official INDEC data)
 * 2. Upserts them into the ipc_rates table
 *
 * Idempotent — safe to re-run. New month data appears ~10th-16th of each month.
 * Secured via CRON_SECRET (Vercel injects Authorization header).
 */
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Log cron start
  const { data: logRow } = await supabaseAdmin
    .from('cron_job_log')
    .insert({ job_name: 'ipc', status: 'running' })
    .select('id')
    .single();
  const logId = logRow?.id ?? null;

  const result = await fetchIPCRates();

  if ('error' in result) {
    if (logId) {
      await supabaseAdmin
        .from('cron_job_log')
        .update({
          finished_at: new Date().toISOString(),
          status: 'failed',
          error_message: result.error,
        })
        .eq('id', logId);
    }
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const { rows } = result;

  // Upsert all rows (idempotent)
  const { error: upsertError } = await supabaseAdmin
    .from('ipc_rates')
    .upsert(
      rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })),
      { onConflict: 'period' }
    );

  if (upsertError) {
    console.error('[cron/ipc] DB upsert failed:', upsertError);
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

  const latest = rows[rows.length - 1];
  const stats = {
    monthsUpserted: rows.length,
    latestMonth: latest.period,
    latestRate: latest.rate,
    source: 'datos.gob.ar',
  };

  console.log(`[cron/ipc] Upserted ${rows.length} months. Latest: ${latest.period} = ${latest.rate}%`);

  if (logId) {
    await supabaseAdmin
      .from('cron_job_log')
      .update({
        finished_at: new Date().toISOString(),
        status: 'completed',
        stats,
      })
      .eq('id', logId);
  }

  return NextResponse.json(stats);
}
