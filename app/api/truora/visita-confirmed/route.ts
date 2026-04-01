import { NextResponse } from 'next/server';
import { truoraVisitaConfirmedSchema } from '@/lib/validations/truora-visita-confirmed';
import { createVisita } from '@/lib/visitas/create';
import { findUserByPhone } from '@/lib/truora/find-user-by-phone';

export async function POST(request: Request) {
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
      // Return success=false with 200 so Truora doesn't break
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' });
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
      error: error instanceof Error ? error.message : 'Error interno',
    });
  }
}
