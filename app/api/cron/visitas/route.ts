import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  toKapsoPhone,
  formatVisitDateTime,
  sendOwnerReminder,
  sendInquilinoReminder,
  sendOwnerPostVisitFeedback,
  sendInquilinoPostVisitFeedback,
} from '@/lib/kapso/client';

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
 * GET /api/cron/visitas
 *
 * Runs every 30 minutes (at :00 and :30). Sends:
 * - 24h reminder to both parties
 * - 2h reminder to both parties
 * - Post-visit feedback 40min after the visit
 *
 * Secured via CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const stats = { reminder24h: 0, reminder2h: 0, postvisit: 0, errors: 0 };

  // Log cron start
  const { data: logRow } = await supabaseAdmin
    .from('cron_job_log')
    .insert({ job_name: 'visitas', status: 'running' })
    .select('id')
    .single();
  const logId = logRow?.id ?? null;

  try {

  // ── 24h reminder ───────────────────────────────────────────────────────────
  // Visit is 23.5h to 24h from now
  const reminder24hFrom = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
  const reminder24hTo = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: visitas24h } = await supabaseAdmin
    .from('visitas')
    .select(`
      id, confirmed_date, confirmed_time,
      owner_user_id, requester_user_id, requester_name, requester_phone, requester_country_code,
      properties:property_id ( address ),
      owners:owner_user_id ( name, telefono, telefono_country_code )
    `)
    .eq('status', 'accepted')
    .is('reminder_24h_sent_at', null)
    .not('confirmed_date', 'is', null)
    .not('confirmed_time', 'is', null);

  if (visitas24h) {
    for (const v of visitas24h) {
      const visitDt = new Date(`${v.confirmed_date}T${v.confirmed_time}-03:00`);
      if (visitDt < reminder24hFrom || visitDt > reminder24hTo) continue;

      try {
        await sendReminders(v);
        await supabaseAdmin
          .from('visitas')
          .update({
            reminder_24h_sent_at: now.toISOString(),
            owner_wa_context: 'reminder',
            requester_wa_context: 'reminder',
          })
          .eq('id', v.id);
        stats.reminder24h++;
      } catch (err) {
        console.error(`[CronVisitas] 24h reminder error for visita ${v.id}:`, err);
        stats.errors++;
      }
    }
  }

  // ── 2h reminder ────────────────────────────────────────────────────────────
  // Visit is 1.5h to 2h from now
  const reminder2hFrom = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
  const reminder2hTo = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const { data: visitas2h } = await supabaseAdmin
    .from('visitas')
    .select(`
      id, confirmed_date, confirmed_time,
      owner_user_id, requester_user_id, requester_name, requester_phone, requester_country_code,
      properties:property_id ( address ),
      owners:owner_user_id ( name, telefono, telefono_country_code )
    `)
    .eq('status', 'accepted')
    .is('reminder_2h_sent_at', null)
    .not('confirmed_date', 'is', null)
    .not('confirmed_time', 'is', null);

  if (visitas2h) {
    for (const v of visitas2h) {
      const visitDt = new Date(`${v.confirmed_date}T${v.confirmed_time}-03:00`);
      if (visitDt < reminder2hFrom || visitDt > reminder2hTo) continue;

      try {
        await sendReminders(v);
        await supabaseAdmin
          .from('visitas')
          .update({
            reminder_2h_sent_at: now.toISOString(),
            owner_wa_context: 'reminder',
            requester_wa_context: 'reminder',
          })
          .eq('id', v.id);
        stats.reminder2h++;
      } catch (err) {
        console.error(`[CronVisitas] 2h reminder error for visita ${v.id}:`, err);
        stats.errors++;
      }
    }
  }

  // ── Post-visit feedback ────────────────────────────────────────────────────
  // Visit was 40min to 70min ago
  const postvisitFrom = new Date(now.getTime() - 70 * 60 * 1000);
  const postvisitTo = new Date(now.getTime() - 40 * 60 * 1000);

  const { data: visitasPost } = await supabaseAdmin
    .from('visitas')
    .select(`
      id, confirmed_date, confirmed_time,
      owner_user_id, requester_user_id, requester_name, requester_phone, requester_country_code,
      properties:property_id ( address ),
      owners:owner_user_id ( name, telefono, telefono_country_code )
    `)
    .eq('status', 'accepted')
    .is('postvisit_sent_at', null)
    .not('confirmed_date', 'is', null)
    .not('confirmed_time', 'is', null);

  if (visitasPost) {
    for (const v of visitasPost) {
      const visitDt = new Date(`${v.confirmed_date}T${v.confirmed_time}-03:00`);
      if (visitDt < postvisitFrom || visitDt > postvisitTo) continue;

      try {
        await sendPostVisitMessages(v);
        await supabaseAdmin
          .from('visitas')
          .update({
            postvisit_sent_at: now.toISOString(),
            owner_wa_context: 'postvisit',
            requester_wa_context: 'postvisit',
          })
          .eq('id', v.id);
        stats.postvisit++;
      } catch (err) {
        console.error(`[CronVisitas] Post-visit error for visita ${v.id}:`, err);
        stats.errors++;
      }
    }
  }

  console.log(`[CronVisitas] Done: 24h=${stats.reminder24h}, 2h=${stats.reminder2h}, postvisit=${stats.postvisit}, errors=${stats.errors}`);

  if (logId) {
    await supabaseAdmin
      .from('cron_job_log')
      .update({
        finished_at: new Date().toISOString(),
        status: stats.errors > 0 ? 'failed' : 'completed',
        stats,
      })
      .eq('id', logId);
  }

  return NextResponse.json({ success: true, stats });

  } catch (err) {
    console.error('[CronVisitas] Unexpected error:', err);
    if (logId) {
      await supabaseAdmin
        .from('cron_job_log')
        .update({
          finished_at: new Date().toISOString(),
          status: 'failed',
          error_message: err instanceof Error ? err.message : String(err),
        })
        .eq('id', logId);
    }
    return NextResponse.json(
      { error: 'Internal error', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VisitaRow = Record<string, any>;

async function sendReminders(v: VisitaRow): Promise<void> {
  const ownerData = v.owners as { name: string; telefono: string; telefono_country_code: string } | null;
  const address = (v.properties as { address: string } | null)?.address ?? '';
  const { dayLabel, time } = formatVisitDateTime(v.confirmed_date, v.confirmed_time);

  // Send to owner
  if (ownerData?.telefono) {
    const ownerPhone = toKapsoPhone(ownerData.telefono_country_code ?? '', ownerData.telefono);
    await sendOwnerReminder({
      ownerPhone,
      ownerName: ownerData.name ?? 'Propietario',
      address,
      dayLabel,
      time,
    });
  }

  // Send to inquilino
  if (v.requester_phone) {
    const inquilinoPhone = toKapsoPhone(v.requester_country_code ?? '', v.requester_phone);
    await sendInquilinoReminder({
      inquilinoPhone,
      inquilinoName: v.requester_name ?? 'Inquilino',
      address,
      dayLabel,
      time,
    });
  }
}

async function sendPostVisitMessages(v: VisitaRow): Promise<void> {
  const ownerData = v.owners as { name: string; telefono: string; telefono_country_code: string } | null;
  const address = (v.properties as { address: string } | null)?.address ?? '';

  // Send to owner
  if (ownerData?.telefono) {
    const ownerPhone = toKapsoPhone(ownerData.telefono_country_code ?? '', ownerData.telefono);
    await sendOwnerPostVisitFeedback({
      ownerPhone,
      ownerName: ownerData.name ?? 'Propietario',
      address,
    });
  }

  // Send to inquilino
  if (v.requester_phone) {
    const inquilinoPhone = toKapsoPhone(v.requester_country_code ?? '', v.requester_phone);
    await sendInquilinoPostVisitFeedback({
      inquilinoPhone,
      inquilinoName: v.requester_name ?? 'Inquilino',
      address,
    });
  }
}
