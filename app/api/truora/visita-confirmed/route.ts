import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { truoraVisitaConfirmedSchema } from '@/lib/validations/truora-visita-confirmed';
import { createVisita } from '@/lib/visitas/create';
import { sendOwnerNewVisitaRequest, toKapsoPhone } from '@/lib/kapso/client';

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

    // Look up user by phone (strip to digits, match country_code + telefono)
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, name, email, telefono, telefono_country_code')
      .not('telefono', 'is', null);

    let userId: string | null = null;
    let userName: string | null = null;
    let userEmail: string | null = null;
    let userPhone: string | null = null;
    let userCountryCode: string | null = null;

    if (users) {
      const match = users.find((u) => {
        const codeDigits = (u.telefono_country_code || '').replace(/[^0-9]/g, '');
        const full = codeDigits + (u.telefono || '');
        return full === cleanPhone || u.telefono === cleanPhone;
      });
      if (match) {
        userId = match.id;
        userName = match.name;
        userEmail = match.email;
        userPhone = match.telefono;
        userCountryCode = match.telefono_country_code;
      }
    }

    if (!userId) {
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
      requesterUserId: userId,
      requesterName: userName ?? '',
      requesterEmail: userEmail,
      requesterPhone: userPhone,
      requesterCountryCode: userCountryCode ?? undefined,
    });

    // Fire-and-forget Kapso notification to owner
    if (result.ownerPhone) {
      const ownerKapsoPhone = toKapsoPhone(result.ownerCountryCode ?? '', result.ownerPhone);
      sendOwnerNewVisitaRequest(ownerKapsoPhone)
        .catch((err) => console.error('[VisitaConfirmed] Kapso notify failed:', err));
    } else {
      console.warn(`[VisitaConfirmed] Owner has no phone for visita ${result.visitaId}`);
    }

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
