import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

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
  const propertyUrl = `https://mob.ar/propiedad/${property.propertyId}`;

  const isBasico = !lead.propertyPlan || lead.propertyPlan === 'basico';

  let subject: string;
  let html: string;

  if (isBasico) {
    // Basico plan: simpler email with lead info + upsell
    subject = 'Nueva consulta por tu propiedad';
    html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <p style="font-size: 16px; line-height: 1.6;">
        ¡Hola! Recibiste una nueva consulta por tu propiedad en <a href="${propertyUrl}" style="color: #2563eb; font-weight: bold;">${property.address}</a>.
      </p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 6px 0;"><strong>Nombre:</strong> ${lead.name}</p>
        <p style="margin: 6px 0;"><strong>Email:</strong> <a href="mailto:${lead.email}" style="color: #2563eb; text-decoration: none;">${lead.email}</a></p>
        <p style="margin: 6px 0;"><strong>Teléfono:</strong> ${lead.phone
          ? `<a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" style="color: #25D366; text-decoration: none;">${lead.phone}</a>`
          : '<span style="color: #9ca3af;">No informado</span>'}</p>
      </div>

      <div style="margin: 24px 0; padding: 16px 20px; background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: bold;">
          ¿Querés recibir inquilinos verificados y coordinar visitas automáticamente?
        </p>
        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
          Con el plan Acompañado o Experiencia de Mob accedés a: coordinación de visitas con agenda online, inquilinos verificados y calificados, contrato digital con firma electrónica y descuento en garantía.
        </p>
        <p style="margin: 12px 0 0 0;">
          <a href="https://mob.ar/planes" style="color: #2563eb; font-weight: bold; font-size: 14px;">Conocé los planes →</a>
        </p>
      </div>

      <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">
        Esta consulta fue generada a través de <strong>mob.ar</strong>
      </p>
    </div>
    `;
  } else {
    // Acompanado/Experiencia: detailed email with verification status
    const verificationBlock = lead.inquilinoVerified
      ? `
      <div style="margin: 24px 0 0 0; padding: 14px 16px; background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
        <p style="margin: 0 0 4px 0; color: #15803d; font-size: 13px; font-weight: bold;">✅ Inquilino Verificado por Mob</p>
        <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.5;">
          ¡Hola! Soy inquilino verificado y calificado para alquilar, quiero agendar una visita para la propiedad en ${property.address} que vi en mob.ar
        </p>
      </div>`
      : `
      <div style="margin: 24px 0 0 0; padding: 14px 16px; background: #f9fafb; border-left: 4px solid #9ca3af; border-radius: 4px;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Este inquilino aún no completó su verificación de perfil.
        </p>
      </div>`;

    subject = `Nueva consulta: ${typeLabel}`;
    html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; margin-bottom: 4px;">Nueva consulta: ${typeLabel}</h2>
      <p style="color: #666; margin-top: 0;">Se recibió una nueva consulta desde <strong>mob.ar</strong></p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold; width: 120px; background: #fafafa;">Nombre</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${lead.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold; background: #fafafa;">Email</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${lead.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold; background: #fafafa;">Teléfono</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">
            ${lead.phone
              ? `<a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" style="color: #25D366; text-decoration: none;">${lead.phone}</a>`
              : '<span style="color: #9ca3af;">No informado</span>'}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold; background: #fafafa;">Tipo</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${typeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold; background: #fafafa;">Propiedad</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">
            <a href="${propertyUrl}" style="color: #2563eb;">${property.address}</a>
          </td>
        </tr>
      </table>

      ${verificationBlock}
    </div>
    `;
  }

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

interface InmobiliariaLeadEmailData {
  name: string;
  email: string;
  phone?: string;
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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <p style="font-size: 16px; line-height: 1.6;">
        Hola! Recibiste una nueva consulta por tu propiedad:
      </p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 6px 0;"><strong>Propiedad:</strong> ${lead.propertyAddress}</p>
        <p style="margin: 6px 0;"><strong>Nombre:</strong> ${lead.name}</p>
        <p style="margin: 6px 0;"><strong>Teléfono:</strong> ${lead.phone
          ? `<a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" style="color: #25D366; text-decoration: none;">${lead.phone}</a>`
          : '<span style="color: #9ca3af;">No informado</span>'}</p>
        <p style="margin: 6px 0;"><strong>Email:</strong> <a href="mailto:${lead.email}" style="color: #2563eb; text-decoration: none;">${lead.email}</a></p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #555;">
        Esta consulta fue generada a través de <strong>mob.ar</strong>, plataforma asociada con Hoggax.
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #555;">
        En Mob podés recibir consultas únicamente de inquilinos calificados para alquilar y aprobados para una garantía de Hoggax con 50% de descuento (exclusivo para inmobiliarias asociadas).
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #555;">
        Además, simplificás todo el proceso: coordinación visitas, gestión de documentación y contratos con firma electrónica.
      </p>

      <p style="font-size: 14px; line-height: 1.6;">
        Te invitamos a conocer más en <a href="https://mob.ar/inmobiliarias" style="color: #2563eb; font-weight: bold;">mob.ar/inmobiliarias</a>
      </p>
    </div>
  `;

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
