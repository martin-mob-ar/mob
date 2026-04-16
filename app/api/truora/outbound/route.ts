import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { truoraOutboundSchema } from '@/lib/validations/truora-outbound';
import { sendOutbound } from '@/lib/truora/outbound';
import { getAuthUser } from '@/lib/supabase/auth';

const TRUORA_OUTBOUND_ID = process.env.TRUORA_OUTBOUND_ID ?? '';
const TRUORA_OUTBOUND_ID_NO_PROPERTY = process.env.TRUORA_OUTBOUND_ID_NO_PROPERTY ?? '';
const TRUORA_OUTBOUND_ID_CERTIFICADO = process.env.TRUORA_OUTBOUND_ID_CERTIFICADO ?? '';
const TRUORA_FLOW_ID = process.env.TRUORA_FLOW_ID ?? '';
const TRUORA_FLOW_ID_NO_PROPERTY = process.env.TRUORA_FLOW_ID_NO_PROPERTY ?? '';

// Format number with dot separators, no currency symbol (template adds its own $)
function formatPrice(price: number | null): string {
  if (price == null) return '';
  return Math.round(price).toLocaleString('es-AR');
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = truoraOutboundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { phone, country_code, name, propertyId, date, time, accountType, certificado } = parsed.data;
    // Certificate flow: only when explicitly requested AND no property is involved
    const isCertificadoFlow = certificado === true && !propertyId;

    // Build the phone number for Truora (digits only, with country code)
    // Argentine mobile numbers need '9' after country code for WhatsApp
    // Strip leading '0' (national trunk prefix) and '15' (old mobile prefix) for AR numbers
    const codeDigits = country_code.replace(/[^0-9]/g, '');
    let rawPhone = phone.replace(/[^0-9]/g, '');
    if (codeDigits === '54') {
      rawPhone = rawPhone.replace(/^0/, '').replace(/^(\d{2,4})15(\d{8})$/, '$1$2');
    }
    const phoneDigits = codeDigits === '54' && !rawPhone.startsWith('9')
      ? codeDigits + '9' + rawPhone
      : codeDigits + rawPhone;

    // Build variables for the Truora template
    // Variable names must match the outbound template placeholders
    const ACCOUNT_TYPE_LABELS: Record<number, string> = {
      1: 'inquilino',
      2: 'dueño directo',
    };

    const variables: Record<string, string> = { nombre_usuario: name };

    // In the certificate flow the user is always a tenant (the certificate is for
    // inquilinos). Regardless of the user's current accountType, the Truora flow
    // treats them as tenant so the WhatsApp copy matches the landing page.
    if (isCertificadoFlow) {
      variables.tipo_usuario = 'inquilino';
    } else if (accountType != null && ACCOUNT_TYPE_LABELS[accountType]) {
      variables.tipo_usuario = ACCOUNT_TYPE_LABELS[accountType];
    }

    if (date) {
      // Convert yyyy-MM-dd to dd/MM/yyyy
      const [y, m, d] = date.split('-');
      variables.dia_visita = `${d}/${m}/${y}`;
      variables.raw_date = date; // yyyy-MM-dd for Truora flow passthrough
    }
    if (time) {
      variables.hora_visita = time;
      variables.raw_time = time; // HH:mm for Truora flow passthrough
    }

    // Fetch property data if propertyId is provided
    if (propertyId) {
      const { data: property } = await supabaseAdmin
        .from('properties_read')
        .select('address, location_name, parent_location_name, price, expenses, currency')
        .eq('property_id', propertyId)
        .maybeSingle();

      if (property) {
        variables.property_id = String(propertyId); // for Truora flow passthrough to visita-confirmed
        if (property.address) {
          variables.direccion_propiedad = property.address;
        }
        const locationParts = [property.location_name, property.parent_location_name].filter(Boolean);
        if (locationParts.length > 0) {
          variables.ciudad_propiedad = locationParts.join(', ');
        }
        const priceStr = formatPrice(property.price ? Number(property.price) : null);
        if (priceStr) {
          variables.precio_alquiler = priceStr;
        }
        if (property.expenses != null) {
          variables.precio_expensas = formatPrice(property.expenses);
        } else {
          variables.precio_expensas = 'Sin expensas';
        }

        // Raw numeric values for the webhook action (rent + expenses calculation)
        if (property.price != null) {
          variables.rent = String(Math.round(Number(property.price)));
        }
        variables.expenses = String(property.expenses ?? 0);
      } else {
        console.warn(`[TruoraOutbound] Property ${propertyId} not found in properties_read`);
      }
    }

    // Pick the right outbound template:
    //   - certificate flow (no property, certificado=true) → CERTIFICADO template
    //   - with property → property template
    //   - plain verification (no property) → NO_PROPERTY template
    // Flow IDs: certificate reuses NO_PROPERTY (same underlying inquilino flow,
    // only the WhatsApp intro message differs).
    const outboundId = isCertificadoFlow
      ? TRUORA_OUTBOUND_ID_CERTIFICADO
      : propertyId
        ? TRUORA_OUTBOUND_ID
        : TRUORA_OUTBOUND_ID_NO_PROPERTY;
    const flowId = propertyId ? TRUORA_FLOW_ID : TRUORA_FLOW_ID_NO_PROPERTY;

    const result = await sendOutbound({
      phone: phoneDigits,
      outboundId,
      flowId,
      variables,
    });

    return NextResponse.json({ success: true, truora: result });
  } catch (error) {
    console.error('[TruoraOutbound] Error:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
