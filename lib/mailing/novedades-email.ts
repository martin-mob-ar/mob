import { Resend } from 'resend';
import { createHmac, timingSafeEqual } from 'crypto';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mob.ar';
const LOGO_URL = 'https://www.mob.ar/assets/mob-logo-new.png';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// ── Unsubscribe tokens ──────────────────────────────────────────────────────

export function generateUnsubscribeToken(userId: string): string {
  const secret = process.env.MAILING_UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error('MAILING_UNSUBSCRIBE_SECRET not set');
  return createHmac('sha256', secret).update(userId).digest('hex');
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  try {
    const expected = generateUnsubscribeToken(userId);
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ── Property card types ─────────────────────────────────────────────────────

export interface NovedadesProperty {
  property_id: number;
  slug: string | null;
  cover_photo_url: string | null;
  address: string | null;
  property_type_name: string | null;
  location_name: string | null;
  parent_location_name: string | null;
  price: number | null;
  currency: string | null;
  expenses: number | null;
  room_amount: number | null;
  suite_amount: number | null;
  total_surface: number | null;
  bathroom_amount: number | null;
  parking_lot_amount: number | null;
  tokko_id: number | null;
  company_name: string | null;
  mob_plan: string | null;
}

// ── Formatting helpers ──────────────────────────────────────────────────────

function formatAddress(address: string): string {
  if (!address) return '';
  return address.charAt(0).toUpperCase() + address.slice(1).toLowerCase();
}

function buildLocationLine(p: NovedadesProperty): string {
  return [p.location_name, p.parent_location_name].filter(Boolean).join(', ');
}

function buildFeaturesLine(p: NovedadesProperty): string {
  const parts: string[] = [];
  if (p.suite_amount != null && p.suite_amount > 0) {
    parts.push(`${p.suite_amount} dorm`);
  } else if (p.room_amount != null && p.room_amount > 0) {
    parts.push(`${p.room_amount} amb`);
  }
  if (p.bathroom_amount != null && p.bathroom_amount > 0) parts.push(`${p.bathroom_amount} ba\u00F1o`);
  if (p.parking_lot_amount != null && p.parking_lot_amount > 0) parts.push(`${p.parking_lot_amount} coch`);
  if (p.total_surface) parts.push(`${Math.round(Number(p.total_surface))} m\u00B2`);
  return parts.join(' \u00B7 ');
}

function deriveBadgeLabel(p: NovedadesProperty): string {
  if (p.company_name) {
    return p.tokko_id != null ? 'Inmobiliaria recomendada' : 'Inmobiliaria asociada';
  }
  return p.mob_plan && p.mob_plan !== 'basico' ? 'Due\u00F1o verificado' : 'Due\u00F1o directo';
}

// ── Price HTML (matches PropertyCard logic) ─────────────────────────────────

function buildPriceHtml(p: NovedadesProperty): string {
  const price = p.price ? Number(p.price) : 0;
  const expenses = p.expenses ? Number(p.expenses) : 0;

  if (p.currency === 'USD') {
    const totalDisplay = `USD ${price.toLocaleString('es-AR')}`;
    const breakdownHtml = expenses > 0
      ? `<p style="margin:2px 0 0;font-size:10px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;line-height:1.4;">USD ${price.toLocaleString('es-AR')} Alquiler<br/>$${expenses.toLocaleString('es-AR')} Expensas</p>`
      : `<p style="margin:2px 0 0;font-size:10px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Sin expensas</p>`;
    return `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;line-height:1.3;"><span style="font-size:13px;font-weight:700;color:#1a1f36;">${totalDisplay}</span> <span style="font-size:10px;color:#6b7280;">Total</span></p>${breakdownHtml}`;
  }

  // ARS
  const total = price + expenses;
  const totalDisplay = `$${total.toLocaleString('es-AR')}`;
  const breakdownHtml = expenses > 0
    ? `<p style="margin:2px 0 0;font-size:10px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">$${price.toLocaleString('es-AR')} Alq + $${expenses.toLocaleString('es-AR')} Exp</p>`
    : `<p style="margin:2px 0 0;font-size:10px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Sin expensas</p>`;
  return `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;line-height:1.3;"><span style="font-size:13px;font-weight:700;color:#1a1f36;">${totalDisplay}</span> <span style="font-size:10px;color:#6b7280;">Total</span></p>${breakdownHtml}`;
}

// ── Property card HTML ──────────────────────────────────────────────────────

function buildPropertyCardHtml(p: NovedadesProperty): string {
  const url = `${APP_URL}/propiedad/${p.slug || p.property_id}`;
  const image = p.cover_photo_url || `${APP_URL}/assets/property-new-1.png`;
  const location = buildLocationLine(p);
  const features = buildFeaturesLine(p);
  const altText = [p.property_type_name, p.room_amount ? `${p.room_amount} ambientes` : '', 'en', location].filter(Boolean).join(' ');
  const badge = deriveBadgeLabel(p);
  const address = formatAddress(p.address || location);
  const priceHtml = buildPriceHtml(p);

  // Fixed 160px image height — reliable across all email clients.
  // object-fit:cover works in Gmail/Apple Mail/Yahoo; Outlook falls back to stretch.
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #e2e5ea;border-radius:12px;overflow:hidden;" bgcolor="#ffffff">
  <tr>
    <td height="160" style="height:160px;overflow:hidden;font-size:0;line-height:0;">
      <a href="${url}" target="_blank" style="text-decoration:none;">
        <img src="${image}" alt="${altText}" width="260" height="160" style="display:block;width:100%;height:160px;object-fit:cover;" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 10px 0;" bgcolor="#ffffff">
      <table cellpadding="0" cellspacing="0" role="presentation"><tr><td>
        <span style="display:inline-block;background-color:#eef2ff;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:600;color:#4D7CFF;font-family:Arial,Helvetica,sans-serif;line-height:1.5;">${badge}</span>
      </td></tr></table>
    </td>
  </tr>
  <tr>
    <td style="padding:6px 10px 0;" bgcolor="#ffffff">
      <a href="${url}" target="_blank" style="text-decoration:none;color:inherit;">
        <p style="margin:0 0 1px;font-size:12px;font-weight:600;color:#1a1f36;font-family:Arial,Helvetica,sans-serif;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${address}</p>
        <p style="margin:0 0 6px;font-size:11px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${location}</p>
        ${priceHtml}
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:4px 10px 0;" bgcolor="#ffffff">
      <p style="margin:0;font-size:10px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${features || '&nbsp;'}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:8px 10px 10px;" bgcolor="#ffffff">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td width="50%" style="padding-right:3px;">
            <a href="${url}#contacto" target="_blank" style="display:block;text-align:center;background-color:#4D7CFF;color:#ffffff;padding:8px 2px;border-radius:6px;text-decoration:none;font-size:11px;font-weight:600;font-family:Arial,Helvetica,sans-serif;line-height:1;">Agendar visita</a>
          </td>
          <td width="50%" style="padding-left:3px;">
            <a href="${url}" target="_blank" style="display:block;text-align:center;background-color:#ffffff;color:#374151;padding:7px 2px;border-radius:6px;border:1px solid #d1d5db;text-decoration:none;font-size:11px;font-weight:600;font-family:Arial,Helvetica,sans-serif;line-height:1;">Ver m\u00E1s</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// ── Property grid (3 rows x 2 cols) ────────────────────────────────────────

function buildPropertyGridHtml(properties: NovedadesProperty[]): string {
  const rows: string[] = [];

  for (let i = 0; i < properties.length; i += 2) {
    const card1 = buildPropertyCardHtml(properties[i]);
    const card2 = i + 1 < properties.length ? buildPropertyCardHtml(properties[i + 1]) : '';

    if (i > 0) {
      rows.push('<tr><td colspan="3" height="12" style="font-size:0;line-height:0;">&nbsp;</td></tr>');
    }

    rows.push(`<tr>
  <td width="48%" valign="top" style="vertical-align:top;">${card1}</td>
  <td width="4%" style="font-size:0;line-height:0;">&nbsp;</td>
  <td width="48%" valign="top" style="vertical-align:top;">${card2}</td>
</tr>`);
  }

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
${rows.join('\n')}
</table>`;
}

// ── Full email HTML ─────────────────────────────────────────────────────────

function buildEmailHtml(
  userName: string | null,
  properties: NovedadesProperty[],
  unsubUrl: string
): string {
  const displayName = userName || '';
  const greeting = displayName ? `Hola ${displayName},` : 'Hola,';
  const gridHtml = buildPropertyGridHtml(properties);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Nuevas propiedades para vos</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f3f4f6;">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;" bgcolor="#ffffff">

        <!-- Header: Logo -->
        <tr>
          <td align="center" style="padding:32px 24px 20px;" bgcolor="#ffffff">
            <a href="${APP_URL}" target="_blank" style="text-decoration:none;">
              <img src="${LOGO_URL}" alt="mob" width="100" height="36" style="display:block;width:100px;height:auto;" />
            </a>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:0 24px 20px;" bgcolor="#ffffff">
            <p style="font-size:20px;font-weight:700;color:#1a1f36;margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;line-height:1.3;">
              ${greeting}
            </p>
            <p style="font-size:14px;color:#6b7280;margin:0;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
              Encontramos nuevas propiedades que pueden interesarte
            </p>
          </td>
        </tr>

        <!-- Property Grid -->
        <tr>
          <td style="padding:0 20px;" bgcolor="#ffffff">
            ${gridHtml}
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding:28px 24px 32px;" bgcolor="#ffffff">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center" bgcolor="#4D7CFF" style="border-radius:8px;">
                  <a href="${APP_URL}/alquileres" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:14px;font-weight:600;font-family:Arial,Helvetica,sans-serif;text-decoration:none;line-height:1.2;">
                    Ver todas las propiedades
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 24px;" bgcolor="#ffffff">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr><td style="border-top:1px solid #e5e7eb;font-size:0;line-height:0;" height="1">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:20px 24px 24px;" bgcolor="#ffffff">
            <p style="font-size:12px;color:#9ca3af;margin:0 0 12px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
              Recibiste este email porque interactuaste con propiedades en mob.ar
            </p>
            <p style="margin:0 0 16px;">
              <a href="${unsubUrl}" style="font-size:12px;color:#9ca3af;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">
                Desuscribirme de estos emails
              </a>
            </p>
            <p style="font-size:11px;color:#9ca3af;margin:0;font-family:Arial,Helvetica,sans-serif;">
              <a href="${APP_URL}/terminos-y-condiciones" style="color:#9ca3af;text-decoration:underline;">T\u00E9rminos y Condiciones</a>
              &nbsp;\u00B7&nbsp;
              <a href="${APP_URL}/politica-de-privacidad" style="color:#9ca3af;text-decoration:underline;">Pol\u00EDtica de Privacidad</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ── Send email ──────────────────────────────────────────────────────────────

export async function sendNovedadesEmail(
  to: string,
  userName: string | null,
  properties: NovedadesProperty[],
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const unsubToken = generateUnsubscribeToken(userId);
  const unsubUrl = `${APP_URL}/api/mailing/unsubscribe?uid=${encodeURIComponent(userId)}&token=${encodeURIComponent(unsubToken)}`;

  const html = buildEmailHtml(userName, properties, unsubUrl);

  try {
    const fromEmail = process.env.LEAD_FROM_EMAIL || 'onboarding@resend.dev';
    const result = await getResend().emails.send({
      from: `mob <${fromEmail}>`,
      to,
      subject: 'Nuevas propiedades para vos',
      html,
    });

    if (result.error) {
      console.error('[Mailing Novedades] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Mailing Novedades] Exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
