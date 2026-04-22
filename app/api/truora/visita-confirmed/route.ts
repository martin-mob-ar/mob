import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { truoraVisitaConfirmedSchema } from '@/lib/validations/truora-visita-confirmed';
import { createVisita } from '@/lib/visitas/create';
import { findUserByPhone } from '@/lib/truora/find-user-by-phone';

function verifyWebhookSecret(request: Request): boolean {
  const webhookSecret = process.env.TRUORA_WEBHOOK_SECRET;
  if (!webhookSecret) return false;
  const header = request.headers.get('x-webhook-secret') || '';
  try {
    const a = Buffer.from(header);
    const b = Buffer.from(webhookSecret);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  // Verify shared secret header (timing-safe)
  if (!process.env.TRUORA_WEBHOOK_SECRET) {
    console.error('[VisitaConfirmed] TRUORA_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = truoraVisitaConfirmedSchema.safeParse(body);

    if (!parsed.success) {
      console.error('[VisitaConfirmed] Invalid payload:', parsed.error.flatten());
      // Return 200 so Truora flow doesn't break
      return NextResponse.json({ success: false, error: 'Datos inválidos' });
    }

    const { phone, property_id, visit_date, visit_time } = parsed.data;

    // Look up user by phone
    const user = await findUserByPhone(phone);

    if (!user) {
      console.error(`[VisitaConfirmed] User not found for phone: ${phone}`);
      console.error(`[VisitaConfirmed] SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
      // Return success=false with 200 so Truora doesn't break
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado',
        debug: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          phoneReceived: phone,
        },
      });
    }

    const propertyId = parseInt(property_id, 10);
    if (isNaN(propertyId)) {
      console.error(`[VisitaConfirmed] Invalid property_id: ${property_id}`);
      return NextResponse.json({ success: false, error: 'property_id inválido' });
    }

    // Create visita in DB
    const result = await createVisita({
      propertyId,
      proposedDate: visit_date,
      proposedTime: visit_time,
      requesterUserId: user.id,
      requesterName: user.name ?? '',
      requesterEmail: user.email,
      requesterPhone: user.telefono,
      requesterCountryCode: user.telefono_country_code ?? undefined,
    });

    return NextResponse.json({ success: true, visitaId: result.visitaId });
  } catch (error) {
    console.error('[VisitaConfirmed] Unexpected error:', error);
    // Return 200 so Truora doesn't break the flow
    return NextResponse.json({
      success: false,
      error: 'Error interno',
    });
  }
}
