import { NextRequest, NextResponse, after } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendNovedadesEmail, type NovedadesProperty } from '@/lib/mailing/novedades-email';

export const maxDuration = 300;

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

const BATCH_SIZE = 50;
const SEND_DELAY_MS = 500; // Resend rate-limit safety
const TIME_BUDGET_MS = 250_000; // Leave 50s buffer before maxDuration

/**
 * GET /api/cron/mailing-novedades
 *
 * Daily at 12:35 UTC (9:35 AM ART). Sends personalized emails
 * with new properties matching each subscriber's price range and state.
 *
 * Processes the unified mailing_preferences table (guests + registered users).
 * Email is the identifier; no join to users table needed.
 *
 * Self-chains via after() when processing exceeds time budget.
 * Secured via CRON_SECRET.
 *
 * Query params (for self-chaining):
 *   - chain: chain link index
 *   - logId: cron_job_log ID to continue
 *   - offset: pagination offset
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // ── 1. Verify CRON_SECRET ──
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Parse chain params ──
  const { searchParams } = request.nextUrl;
  const chainIndex = parseInt(searchParams.get('chain') || '0', 10);
  const logId = searchParams.get('logId');
  const offsetParam = parseInt(searchParams.get('offset') || '0', 10);

  // ── 3. Concurrency guard ──
  const { data: runningLogs } = await supabaseAdmin
    .from('cron_job_log')
    .select('id, started_at')
    .eq('job_name', 'mailing-novedades')
    .eq('status', 'running')
    .order('started_at', { ascending: false })
    .limit(1);

  if (runningLogs && runningLogs.length > 0) {
    const runningLog = runningLogs[0];
    if (!(logId && runningLog.id === parseInt(logId, 10))) {
      const elapsed = Date.now() - new Date(runningLog.started_at).getTime();
      if (elapsed < 10 * 60 * 1000) {
        return NextResponse.json({ skipped: true, reason: 'Already running' });
      }
      // Stale — mark as failed
      await supabaseAdmin
        .from('cron_job_log')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error_message: 'Stale: exceeded 10 minute timeout',
        })
        .eq('id', runningLog.id);
    }
  }

  // ── 4. Create or resume log entry ──
  let currentLogId: number;
  if (logId && chainIndex > 0) {
    currentLogId = parseInt(logId, 10);
    await supabaseAdmin
      .from('cron_job_log')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', currentLogId);
  } else {
    const { data: newLog, error: logError } = await supabaseAdmin
      .from('cron_job_log')
      .insert({ job_name: 'mailing-novedades', status: 'running' })
      .select('id')
      .single();
    if (logError || !newLog) {
      console.error('[Mailing Cron] Failed to create log entry:', logError);
      return NextResponse.json({ error: 'Failed to create log entry' }, { status: 500 });
    }
    currentLogId = newLog.id;
  }

  // ── 5. Fetch eligible subscribers ──
  // email + name are stored directly — no join to users table needed
  const { data: subscribers } = await supabaseAdmin
    .from('mailing_preferences')
    .select('email, name, avg_price_ars, state_ids')
    .eq('unsubscribed', false)
    .gte('interactions_count', 2)
    .not('avg_price_ars', 'is', null)
    .order('email')
    .range(offsetParam, offsetParam + BATCH_SIZE - 1);

  if (!subscribers || subscribers.length === 0) {
    await supabaseAdmin
      .from('cron_job_log')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        stats: { usersChecked: 0, emailsSent: 0, skipped: 0, errors: 0, chain: chainIndex },
      })
      .eq('id', currentLogId);
    return NextResponse.json({ status: 'completed', emailsSent: 0 });
  }

  // ── 6. Fetch new properties from last 24h ──
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: newProperties } = await supabaseAdmin
    .from('properties_read')
    .select('property_id, slug, cover_photo_url, address, property_type_name, location_name, parent_location_name, price, currency, state_id, owner_account_type, room_amount, suite_amount, total_surface, bathroom_amount, parking_lot_amount, expenses, tokko_id, company_name, mob_plan, valor_total_primary')
    .eq('owner_verified', true)
    .gte('property_created_at', twentyFourHoursAgo);

  if (!newProperties || newProperties.length === 0) {
    await supabaseAdmin
      .from('cron_job_log')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        stats: { usersChecked: 0, emailsSent: 0, skipped: 0, errors: 0, noNewProperties: true, chain: chainIndex },
      })
      .eq('id', currentLogId);
    return NextResponse.json({ status: 'completed', emailsSent: 0, noNewProperties: true });
  }

  // ── 7. Process subscribers ──
  const hasTime = () => Date.now() - startTime < TIME_BUDGET_MS;
  const stats = { usersChecked: 0, emailsSent: 0, skipped: 0, errors: 0 };

  for (const subscriber of subscribers) {
    if (!hasTime()) break;
    stats.usersChecked++;

    // Match properties: ±15% price AND same state
    const avgPrice = Number(subscriber.avg_price_ars);
    const priceLow = avgPrice * 0.85;
    const priceHigh = avgPrice * 1.15;
    const subscriberStateIds = new Set(subscriber.state_ids as number[]);

    const matching = newProperties.filter(
      (p) =>
        p.state_id &&
        subscriberStateIds.has(p.state_id) &&
        p.valor_total_primary &&
        Number(p.valor_total_primary) >= priceLow &&
        Number(p.valor_total_primary) <= priceHigh
    );

    if (matching.length === 0) {
      stats.skipped++;
      continue;
    }

    // Prioritize: inquilino (1) + dueño (2) first, then inmobiliaria (3/4)
    matching.sort((a, b) => {
      const aScore = a.owner_account_type === 1 || a.owner_account_type === 2 ? 0 : 1;
      const bScore = b.owner_account_type === 1 || b.owner_account_type === 2 ? 0 : 1;
      return aScore - bScore;
    });

    const topProperties: NovedadesProperty[] = matching.slice(0, 6).map((p) => ({
      property_id: p.property_id,
      slug: p.slug,
      cover_photo_url: p.cover_photo_url,
      address: p.address,
      property_type_name: p.property_type_name,
      location_name: p.location_name,
      parent_location_name: p.parent_location_name,
      price: p.price ? Number(p.price) : null,
      currency: p.currency,
      expenses: p.expenses ? Number(p.expenses) : null,
      room_amount: p.room_amount,
      suite_amount: p.suite_amount ?? null,
      total_surface: p.total_surface ? Number(p.total_surface) : null,
      bathroom_amount: p.bathroom_amount ?? null,
      parking_lot_amount: p.parking_lot_amount ?? null,
      tokko_id: p.tokko_id ?? null,
      company_name: p.company_name ?? null,
      mob_plan: p.mob_plan ?? null,
    }));

    try {
      // Email is used as the unsubscribe uid (works for both guests and registered users)
      const result = await sendNovedadesEmail(
        subscriber.email,
        subscriber.name,
        topProperties,
        subscriber.email
      );

      if (result.success) {
        stats.emailsSent++;
        await supabaseAdmin
          .from('mailing_preferences')
          .update({ last_email_sent_at: new Date().toISOString() })
          .eq('email', subscriber.email);
      } else {
        stats.errors++;
        console.error(`[Mailing Cron] Send failed for ${subscriber.email}:`, result.error);
      }
    } catch (err) {
      stats.errors++;
      console.error(`[Mailing Cron] Exception for ${subscriber.email}:`, err);
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
  }

  // ── 8. Check if we need to chain ──
  const needsChain = subscribers.length === BATCH_SIZE;

  if (needsChain) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const nextUrl = new URL(`${appUrl}/api/cron/mailing-novedades`);
    nextUrl.searchParams.set('chain', String(chainIndex + 1));
    nextUrl.searchParams.set('logId', String(currentLogId));
    nextUrl.searchParams.set('offset', String(offsetParam + stats.usersChecked));

    // Update log with current progress
    await supabaseAdmin
      .from('cron_job_log')
      .update({ stats })
      .eq('id', currentLogId);

    after(async () => {
      try {
        await fetch(nextUrl.toString(), {
          headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
          signal: AbortSignal.timeout(10_000),
        });
      } catch {
        // Expected — AbortError or network error
      }
    });

    console.log(
      `[Mailing Cron] Chaining to link #${chainIndex + 1}, ${stats.usersChecked} subscribers processed in this link`
    );

    return NextResponse.json({
      status: 'chained',
      chainIndex,
      ...stats,
      elapsed_ms: Date.now() - startTime,
    });
  }

  // ── 9. Finalize ──
  await supabaseAdmin
    .from('cron_job_log')
    .update({
      status: 'completed',
      finished_at: new Date().toISOString(),
      stats: { ...stats, chain: chainIndex },
    })
    .eq('id', currentLogId);

  console.log(
    `[Mailing Cron] Completed: ${stats.usersChecked} checked, ${stats.emailsSent} sent, ${stats.skipped} skipped, ${stats.errors} errors`
  );

  return NextResponse.json({
    status: 'completed',
    ...stats,
    elapsed_ms: Date.now() - startTime,
  });
}
