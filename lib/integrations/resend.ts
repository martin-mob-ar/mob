import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface LeadEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  type: 'visita' | 'reserva';
}

interface PropertyInfo {
  address: string;
  propertyId: number;
}

/**
 * Send a lead notification email via Resend to the property owner.
 */
export async function sendLeadEmail(
  to: string,
  cc: string | undefined,
  lead: LeadEmailData,
  property: PropertyInfo
): Promise<{ success: boolean; error?: string }> {
  const typeLabel = lead.type === 'visita' ? 'Agendar Visita' : 'Reservar';
  const propertyUrl = `https://mob.com.ar/propiedad/${property.propertyId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Nueva consulta: ${typeLabel}</h2>
      <p style="color: #666;">Se recibió una consulta desde <strong>mob.com.ar</strong></p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold; width: 120px;">Nombre</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${lead.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold;">Email</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${lead.email}</td>
        </tr>
        ${lead.phone ? `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold;">Teléfono</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">
            <a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" style="color: #25D366; text-decoration: none;">${lead.phone}</a>
          </td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold;">Tipo</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">${typeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #eee; font-weight: bold;">Propiedad</td>
          <td style="padding: 8px 12px; border: 1px solid #eee;">
            <a href="${propertyUrl}">${property.address}</a>
          </td>
        </tr>
      </table>

      <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 4px 0; font-weight: bold; color: #333;">Mensaje:</p>
        <p style="margin: 0; color: #555;">${lead.message}</p>
      </div>
    </div>
  `;

  try {
    const fromEmail = process.env.LEAD_FROM_EMAIL || 'onboarding@resend.dev';
    console.log(`[Resend] Sending to: ${to}, cc: ${cc || 'none'}, from: ${fromEmail}`);
    const result = await resend.emails.send({
      from: `mob <${fromEmail}>`,
      to,
      ...(cc ? { cc } : {}),
      subject: `Nueva consulta: ${typeLabel} - ${property.address}`,
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
