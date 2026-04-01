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
  sendInquilinoCounterProposal,
  sendInquilinoConfirmation,
  sendInquilinoRejected,
  sendInquilinoConfirmationAck,
  sendInquilinoRejectionAck,
  sendInquilinoDatePrompt,
  sendInquilinoSuggestionSent,
  sendPostVisitAdvanceAck,
  sendPostVisitDeclineAck,
} from '@/lib/kapso/client';

const KAPSO_WEBHOOK_SECRET = process.env.KAPSO_WEBHOOK_SECRET ?? '';

// ─── Date/time parsing ────────────────────────────────────────────────────────

/**
 * Parses "15/04 14:00" or "15/04/2026 14:00" from free text.
 * Returns { date: 'yyyy-MM-dd', time: 'HH:mm' } or null if no match.
 * Time is rounded to the nearest :00 or :30.
 */
function parseDateTime(text: string): { date: string; time: string } | null {
  const match = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-]\d{2,4})?[^\d]+(\d{1,2})[:\.](\d{2})/);
  if (!match) return null;
  const [, d, m, h, min] = match;
  let hour = parseInt(h, 10);
  const minute = parseInt(min, 10);

  // Round to nearest :00 or :30
  let roundedMin: number;
  if (minute < 15) {
    roundedMin = 0;
  } else if (minute < 45) {
    roundedMin = 30;
  } else {
    roundedMin = 0;
    hour += 1;
  }

  const year = new Date().getFullYear();
  const date = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  const time = `${String(hour).padStart(2, '0')}:${String(roundedMin).padStart(2, '0')}`;
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

  if (users) {
    const match = users.find((u) => {
      const codeDigits = (u.telefono_country_code || '').replace(/[^0-9]/g, '');
      const full = codeDigits + (u.telefono || '');
      return full === cleanPhone || u.telefono === cleanPhone;
    });
    if (match) {
      userId = match.id;
    }
  }

  if (!userId) {
    console.log(`[KapsoWebhook] Unknown sender: ${senderPhone}`);
    return;
  }

  // 2. Find active visita for this user
  // First check for reminder/post-visit context (accepted visitas with wa_context set)
  const visitaColumns = `
    id, status, whatsapp_state, whatsapp_pending_proposal_id,
    owner_user_id, requester_user_id,
    requester_name, requester_phone, requester_country_code,
    confirmed_date, confirmed_time,
    owner_wa_context, requester_wa_context,
    owner_feedback, requester_feedback,
    properties:property_id ( address ),
    owners:owner_user_id ( name, telefono, telefono_country_code )
  `;

  // Try context-based visita first (reminder/postvisit)
  const { data: contextVisita } = await supabaseAdmin
    .from('visitas')
    .select(visitaColumns)
    .or(`owner_user_id.eq.${userId},requester_user_id.eq.${userId}`)
    .or('owner_wa_context.not.is.null,requester_wa_context.not.is.null')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Check if sender actually has context on this visita
  let visita = contextVisita;
  if (visita) {
    const isOwner = visita.owner_user_id === userId;
    const myContext = isOwner ? visita.owner_wa_context : visita.requester_wa_context;
    if (!myContext) {
      // This user doesn't have context, fall through to negotiation lookup
      visita = null;
    }
  }

  // Fall through: find pending negotiation visita
  if (!visita) {
    const { data: negotiationVisita } = await supabaseAdmin
      .from('visitas')
      .select(visitaColumns)
      .eq('status', 'pending')
      .not('whatsapp_state', 'is', null)
      .or(`requester_user_id.eq.${userId},owner_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    visita = negotiationVisita;
  }

  if (!visita) {
    console.log(`[KapsoWebhook] No active visita for user ${userId}`);
    return;
  }

  const senderIsOwner = visita.owner_user_id === userId;
  const myContext = senderIsOwner ? visita.owner_wa_context : visita.requester_wa_context;
  const state = visita.whatsapp_state as string | null;

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

  // ── Context: reminder ───────────────────────────────────────────────────────
  if (myContext === 'reminder') {
    const buttonId = msg.interactive?.button_reply?.id;
    if (!buttonId) return; // ignore non-button messages during reminder

    // Race condition: if visita was re-negotiated, ignore stale reminder
    if (visita.status === 'pending') {
      const contextCol = senderIsOwner ? 'owner_wa_context' : 'requester_wa_context';
      await supabaseAdmin.from('visitas').update({ [contextCol]: null }).eq('id', visita.id);
      console.log(`[KapsoWebhook] Stale reminder for visita ${visita.id}, clearing`);
      return;
    }

    const { dayLabel, time } = formatVisitDateTime(visita.confirmed_date!, visita.confirmed_time!);

    if (buttonId === BTN.CONFIRM) {
      const contextCol = senderIsOwner ? 'owner_wa_context' : 'requester_wa_context';
      await supabaseAdmin.from('visitas').update({ [contextCol]: null }).eq('id', visita.id);

      if (senderIsOwner && ownerPhone) {
        await sendTextMessage(ownerPhone, `Genial, te esperamos con el inquilino el ${dayLabel} a las ${time}!`);
      } else if (!senderIsOwner && inquilinoPhone) {
        await sendTextMessage(inquilinoPhone, `Perfecto, te esperamos el ${dayLabel} a las ${time}! Suerte en tu futura casa.`);
      }

    } else if (buttonId === BTN.REJECT) {
      await supabaseAdmin
        .from('visitas')
        .update({
          status: 'cancelled',
          owner_wa_context: null,
          requester_wa_context: null,
        })
        .eq('id', visita.id);

      if (senderIsOwner) {
        if (ownerPhone) await sendTextMessage(ownerPhone, 'Ok, la visita fue cancelada. Le avisamos al inquilino.');
        if (inquilinoPhone) await sendTextMessage(inquilinoPhone, `Lamentablemente el propietario canceló la visita del ${dayLabel} a las ${time}. Te invitamos a seguir buscando en mob.ar`);
      } else {
        if (inquilinoPhone) await sendTextMessage(inquilinoPhone, 'Ok, la visita fue cancelada. Le avisamos al propietario.');
        if (ownerPhone) await sendTextMessage(ownerPhone, `Lamentablemente el inquilino canceló la visita del ${dayLabel} a las ${time}. Cuando haya otro interesado te contactaremos!`);
      }

    } else if (buttonId === BTN.SUGGEST) {
      const wsState = senderIsOwner ? 'owner_collecting_datetime' : 'requester_collecting_datetime';
      await supabaseAdmin
        .from('visitas')
        .update({
          status: 'pending',
          whatsapp_state: wsState,
          confirmed_date: null,
          confirmed_time: null,
          owner_wa_context: null,
          requester_wa_context: null,
          // Reset reminder flags so new date gets fresh reminders
          reminder_24h_sent_at: null,
          reminder_2h_sent_at: null,
        })
        .eq('id', visita.id);

      if (senderIsOwner && ownerPhone) {
        await sendOwnerDatePrompt(ownerPhone);
      } else if (!senderIsOwner && inquilinoPhone) {
        await sendInquilinoDatePrompt(inquilinoPhone);
      }
    }
    return;
  }

  // ── Context: postvisit ────────────────────────────────────────────────────
  if (myContext === 'postvisit') {
    const buttonId = msg.interactive?.button_reply?.id;
    if (!buttonId) return;

    const feedbackCol = senderIsOwner ? 'owner_feedback' : 'requester_feedback';
    const contextCol = senderIsOwner ? 'owner_wa_context' : 'requester_wa_context';
    const senderPhone = senderIsOwner ? ownerPhone : inquilinoPhone;

    if (buttonId === BTN.ADVANCE) {
      await supabaseAdmin
        .from('visitas')
        .update({ [feedbackCol]: 'advance', [contextCol]: null })
        .eq('id', visita.id);
      if (senderPhone) await sendPostVisitAdvanceAck(senderPhone);
    } else if (buttonId === BTN.DECLINE) {
      await supabaseAdmin
        .from('visitas')
        .update({ [feedbackCol]: 'decline', [contextCol]: null })
        .eq('id', visita.id);
      if (senderPhone) await sendPostVisitDeclineAck(senderPhone);
    }

    // Check if both feedbacks are in → mark completed
    const { data: updated } = await supabaseAdmin
      .from('visitas')
      .select('owner_feedback, requester_feedback')
      .eq('id', visita.id)
      .single();

    if (updated?.owner_feedback && updated?.requester_feedback) {
      await supabaseAdmin
        .from('visitas')
        .update({ status: 'completed' })
        .eq('id', visita.id);
    }
    return;
  }

  // ── Negotiation state machine (status='pending') ──────────────────────────
  if (!state) {
    console.log(`[KapsoWebhook] No active state for user ${userId} on visita ${visita.id}`);
    return;
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
    const { dayLabel, time: formattedTime } = formatVisitDateTime(date, time);

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

    if (ownerPhone) await sendOwnerSuggestionSent(ownerPhone);
    if (inquilinoPhone) {
      await sendInquilinoCounterProposal({ inquilinoPhone, inquilinoName, dayLabel, time: formattedTime });
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
    const { dayLabel, time: formattedTime } = formatVisitDateTime(date, time);

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

    if (inquilinoPhone) await sendInquilinoSuggestionSent(inquilinoPhone);
    if (ownerPhone) {
      await sendOwnerCounterProposal({ ownerPhone, ownerName, dayLabel, time: formattedTime });
    }
    return;
  }

  console.log(`[KapsoWebhook] Unhandled state=${state} senderIsOwner=${senderIsOwner} type=${msg.type}`);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
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
