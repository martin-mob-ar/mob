import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/ipc?from=2024-01&to=2026-04
 *
 * Returns IPC monthly rates from the ipc_rates table for the given range.
 * Used by the calculadora-ipc page to replace the dead ArgenStats client-side fetch.
 *
 * Response: { data: [{ month: "2024-01", rate: 20.6 }, ...] }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Missing required params: from, to (YYYY-MM format)' },
      { status: 400 }
    );
  }

  // Validate format
  if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) {
    return NextResponse.json(
      { error: 'Invalid format. Use YYYY-MM for from and to.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('ipc_rates')
    .select('period, rate')
    .gte('period', from)
    .lte('period', to)
    .order('period', { ascending: true });

  if (error) {
    console.error('[api/ipc] DB query failed:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  // Map period → month to match the IPCDataPoint interface used in ipcService.ts
  const result = (data ?? []).map((row) => ({ month: row.period, rate: Number(row.rate) }));

  return NextResponse.json({ data: result });
}
