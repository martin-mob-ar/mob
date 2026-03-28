import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  BTN,
  toKapsoPhone,
  formatVisitDateTime,
  sendTextMessage,
  sendOwnerConfirmationThankYou,
  sendOwnerRejectionAck,
  sendOwnerDatePrompt,
  sendOwnerSuggestionSent,
  sendOwnerCounterProposal,
  sendOwnerInquilinoAccepted,
  sendOwnerRejectionByInquilino,
  sendInquilinoConfirmation,
  sendInquilinoRejected,
  sendInquilinoConfirmationAck,
  sendInquilinoRejectionAck,
  sendInquilinoCounterProposal,
  sendInquilinoDatePrompt,
  sendInquilinoSuggestionSent,
} from '@/lib/kapso/client';

const KAPSO_WEBHOOK_SECRET = process.env.KAPSO_WEBHOOK_SECRET ?? '';

// ─── Date/time parsing ────────────────────────────────────────────────────────

/**
 * Parses "15/04 14:00" or "15/04/2026 14:00" from free text.
 * Returns { date: 'yyyy-MM-dd', time: 'HH:mm' } or null if no match.
 */
function parseDateTime(text: string): { date: string; time: string } | null {
  const match = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-]\d{2,4})?[^\d]+(\d{1,2})[:\.](\d{2})/);
  if (!match) return null;
  const [, d, m, h, min] = match;
  const year = new Date().getFullYear();
  const date = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  const time = `${h.padStart(2, '0')}:${min}`;
  return { date, time };
}

// ─── Incoming message types ───────────────────────────────────────────────────

interface KapsoButtonReply {
  id: string;
  title: string;
}

interface KapsoMessage {
  from: string;
  type: 'text' | 'interactive';
  text?: { body: string };
  interactive?: {
    type: 'button_reply';
    button_reply: KapsoButtonReply;
  };
}

// ─── State machine ────────────────────────────────────────────────────────────

async function handleIncomingMessage(senderPhone: string, msg: KapsoMessage): Promise<void> {
  // 1. Look up user by phone
  const cleanPhone = senderPhone.replace(/[^0-9]/g, '');
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name, telefono, telefono_country_code')
    .not('telefono', 'is', null);

  let userId: string | null = null;
  let userName: string | null = null;
  let userPhone: string | null = null;
  let userCountryCode: string | null = null;

  if (users) {
    const match = users.find((u) => {
      const codeDigits = (u.telefono_country_code || '').replace(/[^0-9]/g, '');
      const full = codeDigits + (u.telefono || '');
      return full === cleanPhone || u.telefono === cleanPhone;
    });
    if (match) {
      userId = match.id;
      userName = match.name;
      userPhone = match.telefono;
      userCountryCode = match.telefono_country_code;
    }
  }

  if (!userId) {
    console.log(`[KapsoWebhook] Unknown sender: ${senderPhone}`);
    return;
  }

  // 2. Find active visita for this user (owner or requester)
  const { data: visita } = await supabaseAdmin
    .from('visitas')
    .select(`
      id, status, whatsapp_state, whatsapp_pending_proposal_id,
      owner_user_id, requester_user_id,
      requester_name, requester_phone, requester_country_code,
      properties:property_id ( address ),
      owners:owner_user_id ( name, telefono, telefono_country_code )
    `)
    .in('status', ['pending'])
    .or(`requester_user_id.eq.${userId},owner_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!visita || !visita.whatsapp_state) {
    console.log(`[KapsoWebhook] No active visita for user ${userId}`);
    return;
  }

  const senderIsOwner = visita.owner_user_id === userId;
  const state = visita.whatsapp_state as string;

  // Resolve owner/inquilino phones for messaging
  const ownerData = visita.owners as unknown as { name: string; telefono: string; telefono_country_code: string } | null;
  const ownerPhone = ownerData ? toKapsoPhone(ownerData.telefono_country_code ?? '', ownerData.telefono) : null;
  const ownerName = ownerData?.name ?? 'Propietario';

  const inquilinoPhone = visita.requester_phone
    ? toKapsoPhone(visita.requester_country_code ?? '', visita.requester_phone)
    : null;
  const inquilinoName = visita.requester_name ?? 'Inquilino';

  const address: string = (visita.properties as unknown as { address: string } | null)?.address ?? '';

  const pendingProposalId = visita.whatsapp_pending_proposal_id as number | null;

  // Helper: get proposal date/time
  async function getPendingProposal(): Promise<{ proposed_date: string; proposed_time: string } | null> {
    if (!pendingProposalId) return null;
    const { data } = await supabaseAdmin
      .from('visita_proposals')
      .select('proposed_date, proposed_time')
      .eq('id', pendingProposalId)
      .single();
    return data;
  }

  // ── State: owner_responding ──────────────────────────────────────────────────
  if (state === 'owner_responding' && senderIsOwner) {
    const buttonId = msg.interactive?.button_reply?.id;

    if (buttonId === BTN.CONFIRM) {
      const proposal = await getPendingProposal();
      if (!proposal) return;

      const { dayLabel, time } = formatVisitDateTime(proposal.proposed_date, proposal.proposed_time);

      await supabaseAdmin
        .from('visita_proposals')
        .update({ status: 'accepted', message: 'confirmado por propietario' })
        .eq('id', pendingProposalId!);

      await supabaseAdmin
        .from('visitas')
        .update({
          status: 'accepted',
          confirmed_date: proposal.proposed_date,
          confirmed_time: proposal.proposed_time,
          whatsapp_state: null,
        })
        .eq('id', visita.id);

      if (ownerPhone) await sendOwnerConfirmationThankYou({ ownerPhone, dayLabel, time });
      if (inquilinoPhone) await sendInquilinoConfirmation({ inquilinoPhone, inquilinoName, address, dayLabel, time });

    } else if (buttonId === BTN.REJECT) {
      await supabaseAdmin
        .from('visita_proposals')
        .update({ status: 'declined', message: 'rechazado por propietario' })
        .eq('id', pendingProposalId!);

      await supabaseAdmin
        .from('visitas')
        .update({ status: 'declined', whatsapp_state: null })
        .eq('id', visita.id);

      if (ownerPhone) await sendOwnerRejectionAck(ownerPhone);
      if (inquilinoPhone) await sendInquilinoRejected({ inquilinoPhone, address });

    } else if (buttonId === BTN.SUGGEST) {
      await supabaseAdmin
        .from('visitas')
        .update({ whatsapp_state: 'owner_collecting_datetime' })
        .eq('id', visita.id);

      if (ownerPhone) await sendOwnerDatePrompt(ownerPhone);
    }
    return;
  }

  // ── State: owner_collecting_datetime ────────────────────────────────────────
  if (state === 'owner_collecting_datetime' && senderIsOwner) {
    if (msg.type !== 'text' || !msg.text?.body) return;

    const parsed = parseDateTime(msg.text.body);
    if (!parsed) {
      if (ownerPhone) {
        await sendTextMessage(ownerPhone, 'No entendí la fecha, probá con el formato: 15/04 14:00');
      }
      return;
    }

    const { date, time } = parsed;

    // Supersede current proposal
    if (pendingProposalId) {
      await supabaseAdmin
        .from('visita_proposals')
        .update({ status: 'superseded' })
        .eq('id', pendingProposalId);
    }

    // Insert new proposal from owner
    const { data: newProposal } = await supabaseAdmin
      .from('visita_proposals')
      .insert({
        visita_id: visita.id,
        proposed_by: 'owner',
        proposed_date: date,
        proposed_time: time,
        status: 'pending',
      })
      .select('id')
      .single();

    await supabaseAdmin
      .from('visitas')
      .update({
        whatsapp_state: 'requester_responding',
        whatsapp_pending_proposal_id: newProposal?.id ?? null,
      })
      .eq('id', visita.id);

    const { dayLabel, time: fTime } = formatVisitDateTime(date, time);
    if (ownerPhone) await sendOwnerSuggestionSent(ownerPhone);
    if (inquilinoPhone) {
      await sendInquilinoCounterProposal({
        inquilinoPhone,
        inquilinoName,
        address,
        dayLabel,
        time: fTime,
      });
    }
    return;
  }

  // ── State: requester_responding ─────────────────────────────────────────────
  if (state === 'requester_responding' && !senderIsOwner) {
    const buttonId = msg.interactive?.button_reply?.id;

    if (buttonId === BTN.CONFIRM) {
      const proposal = await getPendingProposal();
      if (!proposal) return;

      const { dayLabel, time } = formatVisitDateTime(proposal.proposed_date, proposal.proposed_time);

      await supabaseAdmin
        .from('visita_proposals')
        .update({ status: 'accepted', message: 'confirmado por inquilino' })
        .eq('id', pendingProposalId!);

      await supabaseAdmin
        .from('visitas')
        .update({
          status: 'accepted',
          confirmed_date: proposal.proposed_date,
          confirmed_time: proposal.proposed_time,
          whatsapp_state: null,
        })
        .eq('id', visita.id);

      if (inquilinoPhone) await sendInquilinoConfirmationAck({ inquilinoPhone });
      if (ownerPhone) await sendOwnerInquilinoAccepted({ ownerPhone, dayLabel, time });

    } else if (buttonId === BTN.REJECT) {
      await supabaseAdmin
        .from('visita_proposals')
        .update({ status: 'declined', message: 'rechazado por inquilino' })
        .eq('id', pendingProposalId!);

      await supabaseAdmin
        .from('visitas')
        .update({ status: 'declined', whatsapp_state: null })
        .eq('id', visita.id);

      if (inquilinoPhone) await sendInquilinoRejectionAck({ inquilinoPhone });
      if (ownerPhone) await sendOwnerRejectionByInquilino({ ownerPhone, address });

    } else if (buttonId === BTN.SUGGEST) {
      await supabaseAdmin
        .from('visitas')
        .update({ whatsapp_state: 'requester_collecting_datetime' })
        .eq('id', visita.id);

      if (inquilinoPhone) await sendInquilinoDatePrompt(inquilinoPhone);
    }
    return;
  }

  // ── State: requester_collecting_datetime ────────────────────────────────────
  if (state === 'requester_collecting_datetime' && !senderIsOwner) {
    if (msg.type !== 'text' || !msg.text?.body) return;

    const parsed = parseDateTime(msg.text.body);
    if (!parsed) {
      if (inquilinoPhone) await sendInquilinoDatePrompt(inquilinoPhone);
      return;
    }

    const { date, time } = parsed;

    if (pendingProposalId) {
      await supabaseAdmin
        .from('visita_proposals')
        .update({ status: 'superseded' })
        .eq('id', pendingProposalId);
    }

    const { data: newProposal } = await supabaseAdmin
      .from('visita_proposals')
      .insert({
        visita_id: visita.id,
        proposed_by: 'requester',
        proposed_date: date,
        proposed_time: time,
        status: 'pending',
      })
      .select('id')
      .single();

    await supabaseAdmin
      .from('visitas')
      .update({
        whatsapp_state: 'owner_responding',
        whatsapp_pending_proposal_id: newProposal?.id ?? null,
      })
      .eq('id', visita.id);

    const { dayLabel, time: fTime } = formatVisitDateTime(date, time);
    if (inquilinoPhone) await sendInquilinoSuggestionSent(inquilinoPhone);
    if (ownerPhone) {
      await sendOwnerCounterProposal({
        ownerPhone,
        ownerName,
        address,
        dayLabel,
        time: fTime,
      });
    }
    return;
  }

  console.log(`[KapsoWebhook] Unhandled state=${state} senderIsOwner=${senderIsOwner} type=${msg.type}`);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // 1. Verify HMAC-SHA256 signature
  const rawBody = await request.text();
  const sig = request.headers.get('x-webhook-signature') ?? '';

  if (KAPSO_WEBHOOK_SECRET) {
    const expected = createHmac('sha256', KAPSO_WEBHOOK_SECRET).update(rawBody).digest('hex');
    if (sig !== expected) {
      console.error('[KapsoWebhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let body: { messages?: KapsoMessage[] };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const messages = body.messages ?? [];
  for (const msg of messages) {
    if (!msg.from) continue;
    await handleIncomingMessage(msg.from, msg).catch((err) =>
      console.error(`[KapsoWebhook] Error handling message from ${msg.from}:`, err),
    );
  }

  return NextResponse.json({ ok: true });
}
