import { NextResponse } from 'next/server';
import { visitaApiSchema } from '@/lib/validations/visita';
import { createVisita } from '@/lib/visitas/create';
import { sendOwnerNewVisitaRequest, toKapsoPhone } from '@/lib/kapso/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = visitaApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      propertyId,
      proposedDate,
      proposedTime,
      name,
      email,
      phone,
      country_code,
      submitterUserId,
    } = parsed.data;

    const result = await createVisita({
      propertyId,
      proposedDate,
      proposedTime,
      requesterUserId: submitterUserId ?? null,
      requesterName: name,
      requesterEmail: email ?? null,
      requesterPhone: phone ?? null,
      requesterCountryCode: country_code,
    });

    // Fire-and-forget Kapso notification to owner
    if (result.ownerPhone) {
      const ownerKapsoPhone = toKapsoPhone(result.ownerCountryCode ?? '', result.ownerPhone);
      sendOwnerNewVisitaRequest(ownerKapsoPhone)
        .catch((err) => console.error('[Visitas] Kapso notify failed:', err));
    }

    return NextResponse.json({ success: true, visitaId: result.visitaId });
  } catch (error) {
    console.error('[Visitas] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
