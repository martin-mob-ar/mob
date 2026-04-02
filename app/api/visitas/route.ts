import { NextResponse } from 'next/server';
import { visitaApiSchema } from '@/lib/validations/visita';
import { createVisita } from '@/lib/visitas/create';

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

    return NextResponse.json({ success: true, visitaId: result.visitaId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    const isConflict = message.includes('visita confirmada');
    console.error('[Visitas] Unexpected error:', error);
    return NextResponse.json(
      { error: message },
      { status: isConflict ? 409 : 500 }
    );
  }
}
