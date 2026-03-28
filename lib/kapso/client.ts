const BASE = process.env.KAPSO_API_BASE_URL ?? '';
const KEY = process.env.KAPSO_API_KEY ?? '';
const PHONE = process.env.KAPSO_PHONE_NUMBER_ID ?? '';
const GRAPH = process.env.META_GRAPH_VERSION ?? 'v24.0';

export const BTN = {
  CONFIRM: 'confirm_visita',
  SUGGEST: 'suggest_date',
  REJECT: 'reject_visita',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip everything but digits — Kapso expects "5491140462010" format */
export function toKapsoPhone(countryCode: string, phone: string): string {
  return (countryCode + phone).replace(/[^0-9]/g, '');
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
    body: JSON.stringify({ to, ...payload }),
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

async function sendTemplateWithButtons(
  to: string,
  templateName: string,
  headerParams: string[],
  bodyParams: string[],
): Promise<void> {
  const components: object[] = [];

  if (headerParams.length > 0) {
    components.push({
      type: 'header',
      parameters: headerParams.map((v) => ({ type: 'text', text: v })),
    });
  }

  if (bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParams.map((v) => ({ type: 'text', text: v })),
    });
  }

  // Quick reply buttons (no parameters needed — button text is fixed in template)
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

/** Owner: first contact — new visita request (template with 3 buttons) */
export async function sendOwnerNewVisitaRequest(params: {
  ownerPhone: string;
  ownerName: string;
  address: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTemplateWithButtons(
    params.ownerPhone,
    'mob_solicitud_visita_owner',
    [],
    [params.ownerName, params.address, params.dayLabel, params.time],
  );
}

/** Owner: inquilino sent a counter-proposal (template with 3 buttons) */
export async function sendOwnerCounterProposal(params: {
  ownerPhone: string;
  ownerName: string;
  address: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTemplateWithButtons(
    params.ownerPhone,
    'mob_contrapropuesta_owner',
    [],
    [params.ownerName, params.dayLabel, params.time],
  );
}

/** Owner: visita confirmed — thank you message */
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

/** Owner: inquilino rejected this visit */
export async function sendOwnerRejectionByInquilino(params: {
  ownerPhone: string;
  address: string;
}): Promise<void> {
  await sendTextMessage(
    params.ownerPhone,
    `Lamentablemente el inquilino calificado rechazó este horario. Cuando haya otro interesado te contactaremos!`,
  );
}

/** Owner: prompt for a new date/time */
export async function sendOwnerDatePrompt(ownerPhone: string): Promise<void> {
  await sendTextMessage(
    ownerPhone,
    'Ok, cuándo podes? Decime día y horario (ej: 15/04 14:00)',
  );
}

/** Owner: their suggestion was forwarded to inquilino */
export async function sendOwnerSuggestionSent(ownerPhone: string): Promise<void> {
  await sendTextMessage(
    ownerPhone,
    'Ok, muchas gracias. ya enviamos tu propuesta al inquilino, te confirmaremos luego!',
  );
}

/** Owner: they rejected the visit */
export async function sendOwnerRejectionAck(ownerPhone: string): Promise<void> {
  await sendTextMessage(
    ownerPhone,
    'Ok, lamentamos que rechaces este inquilino calificado. Cuando haya otro te contactaremos!',
  );
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

/** Inquilino: visita confirmed — they accepted owner's counter */
export async function sendInquilinoConfirmationAck(params: {
  inquilinoPhone: string;
}): Promise<void> {
  await sendTextMessage(
    params.inquilinoPhone,
    'Ok, ya enviamos tu confirmación al propietario. Suerte en la visita!',
  );
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
  await sendTextMessage(
    params.inquilinoPhone,
    'Ok, lamentamos que rechaces este horario. Podés seguir buscando propiedades en mob.ar',
  );
}

/** Inquilino: owner sent a counter-proposal (template with 3 buttons) */
export async function sendInquilinoCounterProposal(params: {
  inquilinoPhone: string;
  inquilinoName: string;
  address: string;
  dayLabel: string;
  time: string;
}): Promise<void> {
  await sendTemplateWithButtons(
    params.inquilinoPhone,
    'mob_contrapropuesta_inquilino',
    [],
    [params.inquilinoName, params.dayLabel, params.time],
  );
}

/** Inquilino: prompt for a new date/time */
export async function sendInquilinoDatePrompt(inquilinoPhone: string): Promise<void> {
  await sendTextMessage(
    inquilinoPhone,
    'Ok, cuándo podes? Decime día y horario (ej: 15/04 14:00)',
  );
}

/** Inquilino: their suggestion was forwarded to owner */
export async function sendInquilinoSuggestionSent(inquilinoPhone: string): Promise<void> {
  await sendTextMessage(
    inquilinoPhone,
    'Ok, enviamos tu propuesta al propietario, te confirmaremos',
  );
}
