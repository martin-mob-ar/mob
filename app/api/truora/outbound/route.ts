import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { truoraOutboundSchema } from '@/lib/validations/truora-outbound';
import { sendOutbound } from '@/lib/truora/outbound';

const TRUORA_OUTBOUND_ID = process.env.TRUORA_OUTBOUND_ID ?? '';
const TRUORA_OUTBOUND_ID_NO_PROPERTY = process.env.TRUORA_OUTBOUND_ID_NO_PROPERTY ?? '';
const TRUORA_FLOW_ID = process.env.TRUORA_FLOW_ID ?? '';
const TRUORA_FLOW_ID_NO_PROPERTY = process.env.TRUORA_FLOW_ID_NO_PROPERTY ?? '';

// Format number with dot separators, no currency symbol (template adds its own $)
function formatPrice(price: number | null): string {
  if (price == null) return '';
  return Math.round(price).toLocaleString('es-AR');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = truoraOutboundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { phone, country_code, name, propertyId, date, time, accountType } = parsed.data;

    // Build the phone number for Truora (digits only, with country code)
    const phoneDigits = country_code.replace(/[^0-9]/g, '') + phone.replace(/[^0-9]/g, '');

    // Build variables for the Truora template
    // Variable names must match the outbound template placeholders
    const ACCOUNT_TYPE_LABELS: Record<number, string> = {
      1: 'inquilino',
      2: 'dueño directo',
    };

    const variables: Record<string, string> = { nombre_usuario: name };

    if (accountType != null && ACCOUNT_TYPE_LABELS[accountType]) {
      variables.tipo_usuario = ACCOUNT_TYPE_LABELS[accountType];
    }

    if (date) {
      // Convert yyyy-MM-dd to dd/MM/yyyy
      const [y, m, d] = date.split('-');
      variables.dia_visita = `${d}/${m}/${y}`;
    }
    if (time) {
      variables.hora_visita = time;
    }

    // Fetch property data if propertyId is provided
    if (propertyId) {
      const { data: property } = await supabaseAdmin
        .from('properties_read')
        .select('address, location_name, parent_location_name, price, expenses, currency')
        .eq('property_id', propertyId)
        .maybeSingle();

      if (property) {
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

    const result = await sendOutbound({
      phone: phoneDigits,
      outboundId: propertyId ? TRUORA_OUTBOUND_ID : TRUORA_OUTBOUND_ID_NO_PROPERTY,
      flowId: propertyId ? TRUORA_FLOW_ID : TRUORA_FLOW_ID_NO_PROPERTY,
      variables,
    });

    return NextResponse.json({ success: true, truora: result });
  } catch (error) {
    console.error('[TruoraOutbound] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
