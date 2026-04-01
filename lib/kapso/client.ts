const BASE = process.env.KAPSO_API_BASE_URL ?? '';
const KEY = process.env.KAPSO_API_KEY ?? '';
const PHONE = process.env.KAPSO_PHONE_NUMBER_ID ?? '';
const GRAPH = process.env.META_GRAPH_VERSION ?? 'v24.0';

export const BTN = {
  CONFIRM: 'confirm_visita',
  SUGGEST: 'suggest_date',
  REJECT: 'reject_visita',
  ADVANCE: 'advance_visita',
  DECLINE: 'decline_visita',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format a phone for Kapso — Kapso expects "5491140462010" format.
 * Argentine mobile numbers need a '9' inserted after the country code (54).
 */
export function toKapsoPhone(countryCode: string, phone: string): string {
  const codeDigits = countryCode.replace(/[^0-9]/g, '');
  const phoneDigits = phone.replace(/[^0-9]/g, '');
  if (codeDigits === '54' && !phoneDigits.startsWith('9')) {
    return codeDigits + '9' + phoneDigits;
  }
  return codeDigits + phoneDigits;
}

/**
 * Format a yyyy-MM-dd date as "Martes 15 de abril"
 * and return the time as-is.
 */
export function formatVisitDateTime(date: string, time: string): { dayLabel: string; time: string } {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const dayLabel = `${days[dt.getDay()].charAt(0).toUpperCase()}${days[dt.getDay()].slice(1)} ${d} de ${months[m - 1]}`;
  return { dayLabel, time };
}

// ─── Low-level ────────────────────────────────────────────────────────────────

async function sendWhatsApp(to: string, payload: object): Promise<void> {
  const url = `${BASE}/meta/whatsapp/${GRAPH}/${PHONE}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': KEY,
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, ...payload }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Kapso sendWhatsApp failed (${res.status}): ${text}`);
  }
}

async function sendButtonMessage(
  to: string,
  body: string,
  buttons: Array<{ id: string; title: string }>,
): Promise<void> {
  await sendWhatsApp(to, {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply',
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  });
}

export async function sendTextMessage(to: string, text: string): Promise<void> {
  await sendWhatsApp(to, {
    type: 'text',
    text: { body: text, preview_url: false },
  });
}

/**
 * Send a template with 3 fixed quick-reply buttons (Confirmar / Sugerir / Rechazar).
 * bodyParams are positional: maps to {{1}}, {{2}}, ... in the template body.
 */
async function sendTemplateWithButtons(
  to: string,
  templateName: string,
  bodyParams: string[],
): Promise<void> {
  const components: object[] = [];

  if (bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParams.map((v) => ({ type: 'text', text: v })),
    });
  }

  components.push(
    { type: 'button', sub_type: 'quick_reply', index: '0', parameters: [{ type: 'payload', payload: BTN.CONFIRM }] },
    { type: 'button', sub_type: 'quick_reply', index: '1', parameters: [{ type: 'payload', payload: BTN.SUGGEST }] },
    { type: 'button', sub_type: 'quick_reply', index: '2', parameters: [{ type: 'payload', payload: BTN.REJECT }] },
  );

  await sendWhatsApp(to, {
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'es_AR' },
      components,
    },
  });
}

// ─── High-level exported functions ───────────────────────────────────────────

/** Owner: first contact — new visita request */
export async function sendOwnerNewVisitaRequest(params: {
  ownerPhone: string;
  ownerName: string;
  address: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTemplateWithButtons(
    params.ownerPhone,
    'mob_solicitud_visita_owner_momentaneo_2',
    [params.ownerName, params.address, params.dayLabel, params.time],
  );
}

/** Owner: inquilino sent a counter-proposal */
export async function sendOwnerCounterProposal(params: {
  ownerPhone: string;
  ownerName: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTemplateWithButtons(
    params.ownerPhone,
    'mob_contrapropuesta_owner_momentaneo',
    [params.ownerName, params.dayLabel, params.time],
  );
}

/** Owner: visita confirmed — thank you */
export async function sendOwnerConfirmationThankYou(params: {
  ownerPhone: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTextMessage(
    params.ownerPhone,
    `Gracias por confirmar! Recibirás a tu futuro inquilino el ${params.dayLabel} a las ${params.time}. Vamos a confirmarle al inquilino!`,
  );
}

/** Owner: inquilino accepted the owner's counter-proposal */
export async function sendOwnerInquilinoAccepted(params: {
  ownerPhone: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTextMessage(
    params.ownerPhone,
    `El inquilino aceptó tu propuesta. Recibirás a tu futuro inquilino el ${params.dayLabel} a las ${params.time}. Suerte mostrando la propiedad!`,
  );
}

/** Owner: inquilino rejected */
export async function sendOwnerRejectionByInquilino(params: {
  ownerPhone: string;
  address: string;
}): Promise<void> {
  await sendTextMessage(
    params.ownerPhone,
    `Lamentablemente el inquilino calificado rechazó este horario. Cuando haya otro interesado te contactaremos!`,
  );
}

/** Owner: prompt for new date/time */
export async function sendOwnerDatePrompt(ownerPhone: string): Promise<void> {
  await sendTextMessage(ownerPhone, 'Ok, cuándo podes? Decime día y horario. Ej: mañana a las 14, 15/04 10:30, el viernes a las 3 de la tarde. Solo horarios en punto o y media.');
}

/** Owner: their suggestion was forwarded to inquilino */
export async function sendOwnerSuggestionSent(ownerPhone: string): Promise<void> {
  await sendTextMessage(ownerPhone, 'Ok, muchas gracias. ya enviamos tu propuesta al inquilino, te confirmaremos luego!');
}

/** Owner: they rejected the visit */
export async function sendOwnerRejectionAck(ownerPhone: string): Promise<void> {
  await sendTextMessage(ownerPhone, 'Ok, lamentamos que rechaces este inquilino calificado. Cuando haya otro te contactaremos!');
}

/** Inquilino: visita confirmed by owner */
export async function sendInquilinoConfirmation(params: {
  inquilinoPhone: string;
  inquilinoName: string;
  address: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTextMessage(
    params.inquilinoPhone,
    `Hola ${params.inquilinoName}, El propietario confirmó tu visita para el departamento en ${params.address}.\n\n🗓️ ${params.dayLabel}\n⏰ ${params.time}\n\nSuerte en tu futura casa!`,
  );
}

/** Inquilino: they confirmed — ack */
export async function sendInquilinoConfirmationAck(params: {
  inquilinoPhone: string;
}): Promise<void> {
  await sendTextMessage(params.inquilinoPhone, 'Ok, ya enviamos tu confirmación al propietario. Suerte en la visita!');
}

/** Inquilino: visita rejected by owner */
export async function sendInquilinoRejected(params: {
  inquilinoPhone: string;
  address: string;
}): Promise<void> {
  await sendTextMessage(
    params.inquilinoPhone,
    `El propietario de la propiedad en ${params.address}, rechazó tu visita. Te invitamos a ver más propiedades en mob.ar`,
  );
}

/** Inquilino: they rejected owner's counter */
export async function sendInquilinoRejectionAck(params: {
  inquilinoPhone: string;
}): Promise<void> {
  await sendTextMessage(params.inquilinoPhone, 'Ok, lamentamos que rechaces este horario. Podés seguir buscando propiedades en mob.ar');
}

/** Inquilino: owner sent a counter-proposal */
export async function sendInquilinoCounterProposal(params: {
  inquilinoPhone: string;
  inquilinoName: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTemplateWithButtons(
    params.inquilinoPhone,
    'mob_contrapropuesta_inquilino_momentaneo',
    [params.inquilinoName, params.dayLabel, params.time],
  );
}

/** Inquilino: prompt for new date/time */
export async function sendInquilinoDatePrompt(inquilinoPhone: string): Promise<void> {
  await sendTextMessage(inquilinoPhone, 'Ok, cuándo podes? Decime día y horario. Ej: mañana a las 14, 15/04 10:30, el viernes a las 3 de la tarde. Solo horarios en punto o y media.');
}

/** Inquilino: their suggestion was forwarded to owner */
export async function sendInquilinoSuggestionSent(inquilinoPhone: string): Promise<void> {
  await sendTextMessage(inquilinoPhone, 'Ok, enviamos tu propuesta al propietario, te confirmaremos');
}

// ─── Reminder & post-visit functions ─────────────────────────────────────────

/**
 * Send a template with 2 quick-reply buttons (Quiero avanzar / No quiero avanzar).
 */
async function sendPostVisitTemplate(
  to: string,
  templateName: string,
  bodyParams: string[],
): Promise<void> {
  const components: object[] = [];

  if (bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParams.map((v) => ({ type: 'text', text: v })),
    });
  }

  components.push(
    { type: 'button', sub_type: 'quick_reply', index: '0', parameters: [{ type: 'payload', payload: BTN.ADVANCE }] },
    { type: 'button', sub_type: 'quick_reply', index: '1', parameters: [{ type: 'payload', payload: BTN.DECLINE }] },
  );

  await sendWhatsApp(to, {
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'es_AR' },
      components,
    },
  });
}

/** Owner: reminder before visit */
export async function sendOwnerReminder(params: {
  ownerPhone: string;
  ownerName: string;
  address: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTemplateWithButtons(
    params.ownerPhone,
    'mob_recordatorio_visita_owner',
    [params.ownerName, params.address, params.dayLabel, params.time],
  );
}

/** Inquilino: reminder before visit */
export async function sendInquilinoReminder(params: {
  inquilinoPhone: string;
  inquilinoName: string;
  address: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTemplateWithButtons(
    params.inquilinoPhone,
    'mob_recordatorio_visita_inquilino',
    [params.inquilinoName, params.address, params.dayLabel, params.time],
  );
}

/** Owner: post-visit feedback */
export async function sendOwnerPostVisitFeedback(params: {
  ownerPhone: string;
  ownerName: string;
  address: string;
}): Promise<void> {
  await sendPostVisitTemplate(
    params.ownerPhone,
    'mob_postvisita_feedback',
    [params.ownerName, params.address],
  );
}

/** Inquilino: post-visit feedback */
export async function sendInquilinoPostVisitFeedback(params: {
  inquilinoPhone: string;
  inquilinoName: string;
  address: string;
}): Promise<void> {
  await sendPostVisitTemplate(
    params.inquilinoPhone,
    'mob_postvisita_feedback',
    [params.inquilinoName, params.address],
  );
}

/** Post-visit: user wants to advance — ack */
export async function sendPostVisitAdvanceAck(phone: string): Promise<void> {
  await sendTextMessage(phone, 'Gracias por tu respuesta! Te contactaremos pronto para coordinar los próximos pasos.');
}

/** Post-visit: user doesn't want to advance — ack */
export async function sendPostVisitDeclineAck(phone: string): Promise<void> {
  await sendTextMessage(phone, 'Gracias por tu respuesta. Te invitamos a seguir buscando propiedades en mob.ar');
}
