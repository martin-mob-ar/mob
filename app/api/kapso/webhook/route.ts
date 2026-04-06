import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { generateText } from 'ai';
import { gateway } from '@ai-sdk/gateway';
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

// ─── Slot conflict helpers ────────────────────────────────────────────────────

/** Check if an accepted visita already exists at this property+date+time. */
async function checkSlotConflict(propertyId: number, date: string, time: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('visitas')
    .select('id')
    .eq('property_id', propertyId)
    .eq('status', 'accepted')
    .eq('confirmed_date', date)
    .eq('confirmed_time', time)
    .limit(1)
    .maybeSingle();
  return !!data;
}

/** Map Spanish day IDs to JS getDay() numbers */
const DAY_ID_TO_JS: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
};
const JS_TO_DAY_ID: Record<number, string> = {};
for (const [id, num] of Object.entries(DAY_ID_TO_JS)) JS_TO_DAY_ID[num] = id;

/** Generate 30-minute increment time slots between start and end (exclusive). */
function generateTimeSlots(start: string, end: string): string[] {
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  const slots: string[] = [];
  for (let m = sH * 60 + sM; m < eH * 60 + eM; m += 30) {
    slots.push(`${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`);
  }
  return slots;
}

/**
 * Find nearby available time slots for a property on a given date.
 * Returns up to 3 slots closest to the requested time.
 */
async function findNearbyAvailableSlots(
  propertyId: number,
  date: string,
  time: string,
): Promise<string[]> {
  // Fetch property's visit_hours
  const { data: prop } = await supabaseAdmin
    .from('properties')
    .select('visit_hours')
    .eq('id', propertyId)
    .single();

  if (!prop?.visit_hours) return [];

  // Determine day name from date string
  const dateObj = new Date(date + 'T12:00:00');
  const dayId = JS_TO_DAY_ID[dateObj.getDay()];
  if (!dayId) return [];

  // Find hours entry for this day
  const hourEntry = (prop.visit_hours as string[]).find((e) => e.startsWith(dayId + ' '));
  if (!hourEntry) return [];

  const match = hourEntry.match(/^\w+\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!match) return [];

  const allSlots = generateTimeSlots(match[1], match[2]);

  // Fetch already-booked slots for this date
  const { data: booked } = await supabaseAdmin
    .from('visitas')
    .select('confirmed_time')
    .eq('property_id', propertyId)
    .eq('status', 'accepted')
    .eq('confirmed_date', date)
    .not('confirmed_time', 'is', null);

  const bookedSet = new Set((booked ?? []).map((v) => v.confirmed_time!));
  const available = allSlots.filter((s) => !bookedSet.has(s));

  if (available.length === 0) return [];

  // Sort by proximity to the requested time
  const [reqH, reqM] = time.split(':').map(Number);
  const reqMinutes = reqH * 60 + reqM;
  available.sort((a, b) => {
    const [aH, aM] = a.split(':').map(Number);
    const [bH, bM] = b.split(':').map(Number);
    return Math.abs(aH * 60 + aM - reqMinutes) - Math.abs(bH * 60 + bM - reqMinutes);
  });

  return available.slice(0, 3);
}

// ─── Date/time parsing ────────────────────────────────────────────────────────

/** Round minutes to nearest :00 or :30 slot, return { hour, minute }. */
function roundToSlot(hour: number, minute: number): { hour: number; minute: number } {
  if (minute < 15) return { hour, minute: 0 };
  if (minute < 45) return { hour, minute: 30 };
  return { hour: hour + 1, minute: 0 };
}

type ParseResult = { date: string; time: string } | 'bad_minutes' | null;

/** Fast regex pass for exact formats like "15/04 14:00" or "15/04/2026 14:00". */
function parseDateTimeRegex(text: string): ParseResult {
  const match = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-]\d{2,4})?[^\d]+(\d{1,2})[:\.](\d{2})/);
  if (!match) return null;
  const [, d, m, h, min] = match;
  const rawMinute = parseInt(min, 10);
  if (rawMinute !== 0 && rawMinute !== 30) return 'bad_minutes';
  const year = new Date().getFullYear();
  return {
    date: `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
    time: `${String(parseInt(h, 10)).padStart(2, '0')}:${String(rawMinute).padStart(2, '0')}`,
  };
}

/** AI fallback: extract date/time from natural language Spanish using Gemini. */
async function parseDateTimeAI(text: string): Promise<{ date: string; time: string } | null> {
  const now = new Date();
  const buenosAires = now.toLocaleDateString('es-AR', {
    timeZone: 'America/Buenos_Aires',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    const { text: response } = await generateText({
      model: gateway('google/gemini-2.5-flash'),
      prompt: `Hoy es ${buenosAires}.

Extraé la fecha y hora de este mensaje de WhatsApp sobre una visita a una propiedad:
"${text}"

El usuario puede expresar la hora con palabras (ej: "cinco y media de la tarde" = 17:30, "tres de la tarde" = 15:00).
Solo se permiten horarios en punto (:00) o y media (:30). Redondeá al más cercano.
Si el mensaje no contiene una fecha/hora válida, respondé exactamente: null

Si sí contiene fecha y hora, respondé SOLO con JSON (sin markdown):
{"day":DD,"month":MM,"year":YYYY,"hour":HH,"minute":MM}`,
      temperature: 0,
      maxOutputTokens: 100,
    });

    const cleaned = response.trim();
    if (cleaned === 'null' || !cleaned.startsWith('{')) return null;

    const parsed = JSON.parse(cleaned);
    if (!parsed.day || !parsed.month || parsed.hour === undefined) return null;

    const year = parsed.year ?? now.getFullYear();
    const { hour, minute } = roundToSlot(parsed.hour, parsed.minute ?? 0);

    return {
      date: `${year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`,
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    };
  } catch (err) {
    console.error('[KapsoWebhook] AI date parsing failed:', err);
    return null;
  }
}

/**
 * Parse date/time from user text: tries fast regex first, then AI fallback.
 * Returns { date, time }, 'bad_minutes' (user typed non-:00/:30), or null.
 */
async function parseDateTime(text: string): Promise<ParseResult> {
  const regex = parseDateTimeRegex(text);
  if (regex) return regex; // includes 'bad_minutes'
  return (await parseDateTimeAI(text));
}

// ─── Incoming message types ───────────────────────────────────────────────────

interface KapsoButtonReply {
  id: string;
  title: string;
}

interface KapsoMessage {
  from: string;
  type: 'text' | 'interactive' | 'button';
  text?: { body: string };
  interactive?: {
    type: 'button_reply';
    button_reply: KapsoButtonReply;
  };
  button?: {
    text: string;
    payload: string;
  };
}

// ─── State machine ────────────────────────────────────────────────────────────

async function handleIncomingMessage(senderPhone: string, msg: KapsoMessage): Promise<void> {
  // Normalize template quick_reply buttons (type: "button") into interactive format
  if (msg.type === 'button' && msg.button?.payload) {
    msg.type = 'interactive';
    msg.interactive = {
      type: 'button_reply',
      button_reply: { id: msg.button.payload, title: msg.button.text },
    };
  }
  // 1. Look up user by phone
  // Kapso sends Argentine numbers WITHOUT the mobile '9' (e.g. 541140462010),
  // so we strip the '9' from both sides to normalise comparison.
  const rawPhone = senderPhone.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('549') && rawPhone.length > 10
    ? '54' + rawPhone.slice(3)
    : rawPhone;

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name, telefono, telefono_country_code')
    .not('telefono', 'is', null);

  let userId: string | null = null;

  if (users) {
    const match = users.find((u) => {
      const codeDigits = (u.telefono_country_code || '').replace(/[^0-9]/g, '');
      const full = codeDigits + (u.telefono || '');
      return full === cleanPhone;
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
    id, property_id, status, whatsapp_state, whatsapp_pending_proposal_id,
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

      // Check for double-booking before confirming
      const conflict = await checkSlotConflict(visita.property_id, proposal.proposed_date, proposal.proposed_time);
      if (conflict) {
        const nearby = await findNearbyAvailableSlots(visita.property_id, proposal.proposed_date, proposal.proposed_time);
        const nearbyText = nearby.length > 0
          ? ` Horarios cercanos disponibles: ${nearby.join(', ')}.`
          : '';
        await supabaseAdmin
          .from('visitas')
          .update({ whatsapp_state: 'owner_collecting_datetime' })
          .eq('id', visita.id);
        if (ownerPhone) {
          await sendTextMessage(ownerPhone, `Ese horario ya fue reservado por otra visita.${nearbyText} Escribí la nueva fecha y hora para la visita (ej: 15/04 14:00).`);
        }
        return;
      }

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

    const parsed = await parseDateTime(msg.text.body);
    if (parsed === 'bad_minutes') {
      if (ownerPhone) {
        await sendTextMessage(ownerPhone, 'Solo se pueden agendar visitas en punto (:00) o y media (:30). Probá de nuevo, por ejemplo: 15/04 14:00 o 15/04 14:30.');
      }
      return;
    }
    if (!parsed) {
      if (ownerPhone) {
        await sendTextMessage(ownerPhone, 'No pude entender la fecha. Probá de nuevo, por ejemplo: mañana a las 14, 15/04 10:30. Solo horarios en punto o y media.');
      }
      return;
    }

    const { date, time } = parsed;

    // Check for double-booking before creating proposal
    const conflict = await checkSlotConflict(visita.property_id, date, time);
    if (conflict) {
      const nearby = await findNearbyAvailableSlots(visita.property_id, date, time);
      const nearbyText = nearby.length > 0
        ? ` Horarios cercanos disponibles: ${nearby.join(', ')}.`
        : '';
      if (ownerPhone) {
        await sendTextMessage(ownerPhone, `Ese horario ya fue reservado por otra visita.${nearbyText} Probá con otro horario.`);
      }
      return;
    }

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

      // Check for double-booking before confirming
      const conflict = await checkSlotConflict(visita.property_id, proposal.proposed_date, proposal.proposed_time);
      if (conflict) {
        const nearby = await findNearbyAvailableSlots(visita.property_id, proposal.proposed_date, proposal.proposed_time);
        const nearbyText = nearby.length > 0
          ? ` Horarios cercanos disponibles: ${nearby.join(', ')}.`
          : '';
        await supabaseAdmin
          .from('visitas')
          .update({ whatsapp_state: 'requester_collecting_datetime' })
          .eq('id', visita.id);
        if (inquilinoPhone) {
          await sendTextMessage(inquilinoPhone, `Ese horario ya fue reservado por otra visita.${nearbyText} Escribí la nueva fecha y hora para la visita (ej: 15/04 14:00).`);
        }
        return;
      }

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

    const parsed = await parseDateTime(msg.text.body);
    if (parsed === 'bad_minutes') {
      if (inquilinoPhone) {
        await sendTextMessage(inquilinoPhone, 'Solo se pueden agendar visitas en punto (:00) o y media (:30). Probá de nuevo, por ejemplo: 15/04 14:00 o 15/04 14:30.');
      }
      return;
    }
    if (!parsed) {
      if (inquilinoPhone) {
        await sendTextMessage(inquilinoPhone, 'No pude entender la fecha. Probá de nuevo, por ejemplo: mañana a las 14, 15/04 10:30. Solo horarios en punto o y media.');
      }
      return;
    }

    const { date, time } = parsed;

    // Check for double-booking before creating proposal
    const conflict = await checkSlotConflict(visita.property_id, date, time);
    if (conflict) {
      const nearby = await findNearbyAvailableSlots(visita.property_id, date, time);
      const nearbyText = nearby.length > 0
        ? ` Horarios cercanos disponibles: ${nearby.join(', ')}.`
        : '';
      if (inquilinoPhone) {
        await sendTextMessage(inquilinoPhone, `Ese horario ya fue reservado por otra visita.${nearbyText} Probá con otro horario.`);
      }
      return;
    }

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

  if (!KAPSO_WEBHOOK_SECRET) {
    console.error('[KapsoWebhook] KAPSO_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }
  const expected = createHmac('sha256', KAPSO_WEBHOOK_SECRET).update(rawBody).digest('hex');
  if (sig !== expected) {
    console.error('[KapsoWebhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ── DEBUG: log to DB for troubleshooting (temporary) ──
  const debugLog = async (branch: string, senderPhone?: string, error?: string) => {
    try {
      await supabaseAdmin.from('webhook_debug_log').insert({
        raw_payload: body,
        matched_branch: branch,
        sender_phone: senderPhone ?? null,
        error: error ?? null,
      });
    } catch { /* ignore debug failures */ }
  };

  // Kapso v2 payload: { message: {...}, conversation: { phone_number: "..." }, ... }
  // Legacy/meta payload: { messages: [{from: "...", ...}] }
  if (body.message && body.conversation) {
    // Kapso v2 format — single message with conversation metadata
    // Try message.from first (Meta Cloud API field), fall back to conversation.phone_number
    const rawFrom = body.message.from ?? body.conversation.phone_number ?? '';
    const senderPhone = String(rawFrom).replace(/[^0-9]/g, '');
    const msg: KapsoMessage = {
      from: senderPhone,
      ...body.message,
    };
    if (senderPhone) {
      await handleIncomingMessage(senderPhone, msg).catch(async (err) => {
        const errMsg = err instanceof Error ? err.message : String(err);
        await debugLog('v2-error', senderPhone, errMsg);
        console.error(`[KapsoWebhook] Error handling message from ${senderPhone}:`, err);
      });
      await debugLog('v2-ok', senderPhone);
    } else {
      await debugLog('v2-no-phone');
    }
  } else if (body.messages) {
    // Legacy format — array of messages
    const messages: KapsoMessage[] = body.messages;
    for (const msg of messages) {
      if (!msg.from) continue;
      await handleIncomingMessage(msg.from, msg).catch(async (err) => {
        const errMsg = err instanceof Error ? err.message : String(err);
        await debugLog('legacy-error', msg.from, errMsg);
        console.error(`[KapsoWebhook] Error handling message from ${msg.from}:`, err);
      });
    }
  } else {
    await debugLog('unknown-format');
    console.log('[KapsoWebhook] Unknown payload format:', JSON.stringify(body).slice(0, 500));
  }

  return NextResponse.json({ ok: true });
}
