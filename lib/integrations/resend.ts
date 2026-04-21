import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mob.ar';

interface LeadEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  type: 'visita' | 'reserva';
  propertyPlan?: string;
  inquilinoVerified?: boolean;
}

interface PropertyInfo {
  address: string;
  propertyId: number;
}

// ── Shared lead-email building blocks ─────────────────────────────────────────

function buildLeadEmailShell(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nueva consulta por tu propiedad</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f2f5;">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

        <!-- Accent bar -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#5170FF 0%,#7B93FF 100%);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- White card -->
        <tr>
          <td style="background-color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding:32px 40px 0;">
                  <a href="${APP_URL}" target="_blank" style="text-decoration:none;">
                    <img src="${APP_URL}/assets/mob-logo-new.png" alt="mob" width="88" style="display:block;width:88px;height:auto;" />
                  </a>
                </td>
              </tr>

              ${bodyContent}

              <!-- Divider -->
              <tr>
                <td style="padding:28px 40px 0;">
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding:20px 40px 12px;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,Helvetica,sans-serif;line-height:1.6;">
                    <a href="${APP_URL}/terminos-de-servicio" style="color:#9ca3af;text-decoration:underline;">Términos de Servicio</a>
                    &nbsp;&#183;&nbsp;
                    <a href="${APP_URL}/terminos-y-condiciones" style="color:#9ca3af;text-decoration:underline;">Términos y Condiciones</a>
                    &nbsp;&#183;&nbsp;
                    <a href="${APP_URL}/politica-de-privacidad" style="color:#9ca3af;text-decoration:underline;">Política de Privacidad</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:0 40px 28px;">
                  <p style="margin:0;font-size:11px;color:#c4c8d0;font-family:Arial,Helvetica,sans-serif;">
                    &#169; ${new Date().getFullYear()} Mob Systems LLC
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function buildLeadInfoCard(fields: { label: string; value: string }[]): string {
  const rows = fields.map((f, i) => {
    const isLast = i === fields.length - 1;
    return `<tr>
      <td style="padding:12px 0;${isLast ? '' : 'border-bottom:1px solid #eef0f3;'}">
        <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;font-family:Arial,Helvetica,sans-serif;font-weight:700;">${f.label}</p>
        <p style="margin:0;font-size:16px;color:#1a1f36;font-family:Arial,Helvetica,sans-serif;line-height:1.4;">${f.value}</p>
      </td>
    </tr>`;
  }).join('');

  return `<!-- Lead info card -->
              <tr>
                <td style="padding:24px 40px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8f9fc;border-radius:10px;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="padding:8px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          ${rows}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;
}

function buildWhatsAppCta(phone: string): string {
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
  return `<!-- WhatsApp CTA -->
              <tr>
                <td align="center" style="padding:24px 40px 0;">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="border-radius:8px;background-color:#25D366;">
                        <a href="${whatsappUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;line-height:1.2;">
                          Contactar por WhatsApp
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;
}

function buildLeadFields(lead: { name: string; email: string; phone?: string; message?: string }): { label: string; value: string }[] {
  const fields: { label: string; value: string }[] = [
    { label: 'Nombre', value: lead.name },
    {
      label: 'Email',
      value: `<a href="mailto:${lead.email}" style="color:#2563eb;text-decoration:none;">${lead.email}</a>`,
    },
    {
      label: 'Teléfono',
      value: lead.phone
        ? `<a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" style="color:#25D366;text-decoration:none;">${lead.phone}</a>`
        : '<span style="color:#9ca3af;">No informado</span>',
    },
  ];
  if (lead.message) {
    fields.push({ label: 'Mensaje', value: lead.message });
  }
  return fields;
}

// ── Lead notification email (owner) ──────────────────────────────────────────

/**
 * Send a lead notification email via Resend to the property owner.
 * For basico plan: simpler email with lead info + plan upgrade CTA.
 * For acompanado/experiencia: detailed email with verification status block.
 */
export async function sendLeadEmail(
  to: string,
  cc: string | undefined,
  lead: LeadEmailData,
  property: PropertyInfo
): Promise<{ success: boolean; error?: string }> {
  const typeLabel = lead.type === 'visita' ? 'Agendar visita' : 'Quiero reservar';
  const propertyUrl = `${APP_URL}/propiedad/${property.propertyId}`;
  const isBasico = !lead.propertyPlan || lead.propertyPlan === 'basico';

  const fields = buildLeadFields(lead);

  let subject: string;
  let extraContent: string;

  if (isBasico) {
    subject = 'Nueva consulta por tu propiedad';
    extraContent = `
              <!-- Plan upgrade -->
              <tr>
                <td style="padding:24px 40px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#eff6ff;border-radius:8px;border-left:4px solid #5170FF;">
                    <tr>
                      <td style="padding:16px 20px;">
                        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1e40af;font-family:Arial,Helvetica,sans-serif;">
                          ¿Querés recibir inquilinos verificados y coordinar visitas automáticamente?
                        </p>
                        <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#1e40af;font-family:Arial,Helvetica,sans-serif;">
                          Con el plan Acompañado o Experiencia accedés a: coordinación de visitas, inquilinos verificados, contrato digital con firma electrónica y descuento en garantía.
                        </p>
                        <a href="${APP_URL}/planes" style="color:#5170FF;font-weight:700;font-size:14px;font-family:Arial,Helvetica,sans-serif;text-decoration:none;">Conocé los planes &#8594;</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;
  } else {
    subject = `Nueva consulta: ${typeLabel}`;
    extraContent = lead.inquilinoVerified
      ? `
              <!-- Verified badge -->
              <tr>
                <td style="padding:24px 40px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0fdf4;border-radius:8px;border-left:4px solid #22c55e;">
                    <tr>
                      <td style="padding:14px 18px;">
                        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#15803d;font-family:Arial,Helvetica,sans-serif;">&#10003; Inquilino Verificado por Mob</p>
                        <p style="margin:0;font-size:14px;line-height:1.5;color:#166534;font-family:Arial,Helvetica,sans-serif;">
                          Este inquilino completó la verificación de identidad y scoring financiero.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
      : `
              <!-- Not verified -->
              <tr>
                <td style="padding:24px 40px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f9fafb;border-radius:8px;border-left:4px solid #d1d5db;">
                    <tr>
                      <td style="padding:14px 18px;">
                        <p style="margin:0;font-size:14px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">
                          Este inquilino aún no completó su verificación de perfil.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;
  }

  const bodyContent = `
              <!-- Heading -->
              <tr>
                <td align="center" style="padding:28px 40px 0;">
                  <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1f36;font-family:Arial,Helvetica,sans-serif;line-height:1.3;">
                    Nueva consulta por tu propiedad
                  </h1>
                </td>
              </tr>

              <!-- Intro -->
              <tr>
                <td style="padding:16px 40px 0;">
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#60697b;font-family:Arial,Helvetica,sans-serif;text-align:center;">
                    Recibiste una consulta para
                    <a href="${propertyUrl}" style="color:#5170FF;font-weight:600;text-decoration:none;">${property.address}</a>
                  </p>
                </td>
              </tr>

              ${buildLeadInfoCard(fields)}

              ${lead.phone ? buildWhatsAppCta(lead.phone) : ''}

              ${extraContent}

              <!-- Source -->
              <tr>
                <td style="padding:24px 40px 0;">
                  <p style="margin:0;font-size:13px;color:#9ca3af;font-family:Arial,Helvetica,sans-serif;text-align:center;">
                    Esta consulta fue generada a través de <strong>mob.ar</strong>
                  </p>
                </td>
              </tr>`;

  const html = buildLeadEmailShell(bodyContent);

  try {
    const fromEmail = process.env.LEAD_FROM_EMAIL || 'onboarding@resend.dev';
    console.log(`[Resend] Sending to: ${to}, cc: ${cc || 'none'}, from: ${fromEmail}`);
    const result = await getResend().emails.send({
      from: `mob <${fromEmail}>`,
      to,
      ...(cc ? { cc } : {}),
      subject,
      html,
    });

    if (result.error) {
      console.error('[Resend] Error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Resend] Exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ── Welcome email helpers ────────────────────────────────────────────────────

interface WelcomePlanConfig {
  subject: string;
  planLabel: string;
  planTagColor: string;
  planTagBg: string;
  benefits: string[];
  pricingNote: string;
  closingNote: string;
}

function getWelcomePlanConfig(plan: 'basico' | 'acompanado' | 'experiencia'): WelcomePlanConfig {
  const configs: Record<string, WelcomePlanConfig> = {
    experiencia: {
      subject: 'Tu propiedad ya está publicada',
      planLabel: 'Experiencia mob',
      planTagColor: '#5170FF',
      planTagBg: '#EEF1FF',
      benefits: [
        'Publicación destacada en mob y en redes sociales',
        'Fotógrafo profesional para las fotos de tu propiedad',
        'Precio sugerido basado en el mercado',
        'Verificación de propietario y propiedad',
        'Aviso mejorado con IA',
        'Interesados verificados y calificados\u2009—\u2009solo te llegan personas que pasaron por identidad, scoring financiero y garantía aprobada',
        'Coordinación y seguimiento completo de visitas',
        'Confección del contrato',
        'Firma electrónica incluida',
        '50% de descuento en la garantía para tu inquilino',
      ],
      pricingNote: 'El costo de USD\u00A0299 se cobra únicamente cuando el alquiler se concreta. No hay ningún cargo inicial de ningún tipo.',
      closingNote: 'Cuando haya novedades, te avisamos.',
    },
    acompanado: {
      subject: 'Tu propiedad ya está publicada',
      planLabel: 'Acompañado',
      planTagColor: '#5170FF',
      planTagBg: '#EEF1FF',
      benefits: [
        'Publicación destacada en mob',
        'Verificación de propietario',
        'Aviso mejorado con IA',
        'Interesados verificados y calificados\u2009—\u2009solo te llegan personas que pasaron el scoring financiero',
        'Coordinación y seguimiento de visitas',
        'Plantilla de contrato',
        'Firma electrónica incluida',
        '30% de descuento en la garantía para tu inquilino',
      ],
      pricingNote: 'El costo de USD\u00A099 se cobra únicamente cuando el alquiler se concreta. No hay ningún cargo inicial.',
      closingNote: 'Cuando haya un interesado calificado, te avisamos y coordinamos la visita.',
    },
    basico: {
      subject: 'Tu propiedad ya está en mob',
      planLabel: 'Básico',
      planTagColor: '#60697b',
      planTagBg: '#f3f4f6',
      benefits: [
        'Publicación básica en mob',
        'Verificación de propietario',
        'Aviso mejorado con IA',
        '20% de descuento en la garantía para tu inquilino',
      ],
      pricingNote: '',
      closingNote: 'Cuando alguien se interese, te vamos a avisar por email. Si en algún momento querés más visibilidad o que mob gestione las visitas y el contrato por vos, podés contactarnos para cambiar tu plan.',
    },
  };
  return configs[plan] || configs.basico;
}

function buildBenefitRow(text: string): string {
  return `<tr>
  <td width="28" valign="top" style="padding:0 0 10px 0;">
    <div style="width:20px;height:20px;border-radius:50%;background-color:#EEF1FF;text-align:center;line-height:20px;font-size:12px;color:#5170FF;">&#10003;</div>
  </td>
  <td style="padding:0 0 10px 8px;font-size:14px;line-height:1.5;color:#1a1f36;font-family:Arial,Helvetica,sans-serif;">${text}</td>
</tr>`;
}

function buildWelcomeEmailHtml(
  displayName: string,
  config: WelcomePlanConfig
): string {
  const tosUrl = `${APP_URL}/terminos-de-servicio`;
  const whatsappUrl = 'https://wa.me/5492236000055';
  const benefitsRows = config.benefits.map(buildBenefitRow).join('\n');

  const pricingBlock = config.pricingNote
    ? `<!-- Pricing note -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#FFFBEB;border-radius:8px;border:1px solid #FDE68A;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0;font-size:13px;line-height:1.5;color:#92400E;font-family:Arial,Helvetica,sans-serif;">
                    <strong style="color:#78350F;">&#128176;</strong>&nbsp; ${config.pricingNote}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.subject}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f2f5;">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

        <!-- Blue accent bar -->
        <tr>
          <td style="height:4px;background:linear-gradient(90deg, #5170FF 0%, #7B93FF 100%);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- White card body -->
        <tr>
          <td style="background-color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

              <!-- Logo -->
              <tr>
                <td align="center" style="padding:32px 40px 0;">
                  <a href="${APP_URL}" target="_blank" style="text-decoration:none;">
                    <img src="${APP_URL}/assets/mob-logo-new.png" alt="mob" width="88" style="display:block;width:88px;height:auto;" />
                  </a>
                </td>
              </tr>

              <!-- Heading -->
              <tr>
                <td align="center" style="padding:28px 40px 0;">
                  <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1f36;font-family:Arial,Helvetica,sans-serif;line-height:1.3;">
                    ${config.subject === 'Tu propiedad ya está en mob' ? '&#127968; Tu propiedad ya está en mob' : '&#127968; Tu propiedad ya está publicada'}
                  </h1>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding:24px 40px 0;">
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1f36;font-family:Arial,Helvetica,sans-serif;">
                    Hola ${displayName}, te habla Iñaki de mob.
                  </p>
                  <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#60697b;font-family:Arial,Helvetica,sans-serif;">
                    Muchas gracias por publicar tu propiedad. Todo está listo.
                  </p>
                </td>
              </tr>

              <!-- Plan badge + benefits card -->
              <tr>
                <td style="padding:24px 40px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8f9fc;border-radius:10px;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="padding:20px 24px 4px;">
                        <!-- Plan tag -->
                        <span style="display:inline-block;background-color:${config.planTagBg};color:${config.planTagColor};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:4px 12px;border-radius:20px;font-family:Arial,Helvetica,sans-serif;">
                          Plan ${config.planLabel}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 24px 20px;">
                        <p style="margin:0 0 14px;font-size:14px;font-weight:600;color:#1a1f36;font-family:Arial,Helvetica,sans-serif;">
                          Lo que incluye tu plan:
                        </p>
                        <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                          ${benefitsRows}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Spacing -->
              <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>

              ${pricingBlock}

              <!-- Closing note -->
              <tr>
                <td style="padding:0 40px;">
                  <p style="margin:0;font-size:14px;line-height:1.6;color:#60697b;font-family:Arial,Helvetica,sans-serif;">
                    ${config.closingNote}
                  </p>
                </td>
              </tr>

              <!-- WhatsApp CTA button -->
              <tr>
                <td align="center" style="padding:28px 40px 0;">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="border-radius:8px;background-color:#25D366;">
                        <a href="${whatsappUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;line-height:1.2;">
                          Escribinos por WhatsApp
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Signature -->
              <tr>
                <td style="padding:28px 40px 0;">
                  <p style="margin:0;font-size:15px;line-height:1.5;color:#1a1f36;font-family:Arial,Helvetica,sans-serif;">
                    Saludos,<br/><strong>Iñaki</strong>
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding:28px 40px 0;">
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding:20px 40px 12px;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,Helvetica,sans-serif;line-height:1.6;">
                    <a href="${tosUrl}" style="color:#9ca3af;text-decoration:underline;">Términos de Servicio</a>
                    &nbsp;&#183;&nbsp;
                    <a href="${APP_URL}/terminos-y-condiciones" style="color:#9ca3af;text-decoration:underline;">Términos y Condiciones</a>
                    &nbsp;&#183;&nbsp;
                    <a href="${APP_URL}/politica-de-privacidad" style="color:#9ca3af;text-decoration:underline;">Política de Privacidad</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:0 40px 28px;">
                  <p style="margin:0;font-size:11px;color:#c4c8d0;font-family:Arial,Helvetica,sans-serif;">
                    &#169; ${new Date().getFullYear()} Mob Systems LLC
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * Send a welcome email to the property owner after they publish a property.
 * Content varies by selected plan (basico, acompanado, experiencia).
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  plan: 'basico' | 'acompanado' | 'experiencia'
): Promise<{ success: boolean; error?: string }> {
  const displayName = userName || 'propietario';
  const config = getWelcomePlanConfig(plan);
  const html = buildWelcomeEmailHtml(displayName, config);

  try {
    const fromEmail = process.env.LEAD_FROM_EMAIL || 'onboarding@resend.dev';
    console.log(`[Resend] Sending welcome email to: ${to}, plan: ${plan}`);
    const result = await getResend().emails.send({
      from: `mob <${fromEmail}>`,
      to,
      subject: config.subject,
      html,
    });

    if (result.error) {
      console.error('[Resend] Welcome email error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Resend] Welcome email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ── Inmobiliaria lead notification ───────────────────────────────────────────

interface InmobiliariaLeadEmailData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyAddress: string;
}

/**
 * Send a lead notification email to an inmobiliaria producer (or company fallback).
 * Includes Mob/Hoggax marketing copy.
 */
export async function sendInmobiliariaLeadEmail(
  to: string,
  cc: string | undefined,
  lead: InmobiliariaLeadEmailData
): Promise<{ success: boolean; error?: string }> {
  const fields = buildLeadFields(lead);

  const bodyContent = `
              <!-- Heading -->
              <tr>
                <td align="center" style="padding:28px 40px 0;">
                  <h1 style="margin:0;font-size:22px;font-weight:700;color:#1a1f36;font-family:Arial,Helvetica,sans-serif;line-height:1.3;">
                    Nueva consulta por tu propiedad
                  </h1>
                </td>
              </tr>

              <!-- Intro -->
              <tr>
                <td style="padding:16px 40px 0;">
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#60697b;font-family:Arial,Helvetica,sans-serif;text-align:center;">
                    Recibiste una consulta para
                    <strong style="color:#1a1f36;">${lead.propertyAddress}</strong>
                  </p>
                </td>
              </tr>

              ${buildLeadInfoCard(fields)}

              ${lead.phone ? buildWhatsAppCta(lead.phone) : ''}

              <!-- Mob/Hoggax info -->
              <tr>
                <td style="padding:24px 40px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8f9fc;border-radius:8px;">
                    <tr>
                      <td style="padding:16px 20px;">
                        <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#60697b;font-family:Arial,Helvetica,sans-serif;">
                          Esta consulta fue generada a través de <a href="${APP_URL}" style="color:#5170FF;font-weight:600;text-decoration:none;">mob.ar</a>, plataforma asociada con Hoggax.
                        </p>
                        <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#60697b;font-family:Arial,Helvetica,sans-serif;">
                          En Mob podés recibir consultas únicamente de inquilinos calificados para alquilar y aprobados para una garantía de Hoggax con 50% de descuento (exclusivo para inmobiliarias asociadas).
                        </p>
                        <p style="margin:0;font-size:14px;line-height:1.6;color:#60697b;font-family:Arial,Helvetica,sans-serif;">
                          Además, simplificás todo el proceso: coordinación visitas, gestión de documentación y contratos con firma electrónica.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA link -->
              <tr>
                <td align="center" style="padding:20px 40px 0;">
                  <a href="${APP_URL}/inmobiliarias" style="color:#5170FF;font-weight:700;font-size:14px;font-family:Arial,Helvetica,sans-serif;text-decoration:none;">Conocer más sobre Mob para inmobiliarias &#8594;</a>
                </td>
              </tr>`;

  const html = buildLeadEmailShell(bodyContent);

  try {
    const fromEmail = process.env.LEAD_FROM_EMAIL || 'onboarding@resend.dev';
    console.log(`[Resend] Sending inmobiliaria lead email to: ${to}, cc: ${cc || 'none'}`);
    const result = await getResend().emails.send({
      from: `mob <${fromEmail}>`,
      to,
      ...(cc ? { cc } : {}),
      subject: 'Nueva consulta por tu propiedad',
      html,
    });

    if (result.error) {
      console.error('[Resend] Inmobiliaria email error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Resend] Inmobiliaria email exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
