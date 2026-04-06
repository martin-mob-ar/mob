import { NextResponse } from 'next/server';
import { visitaApiSchema } from '@/lib/validations/visita';
import { createVisita } from '@/lib/visitas/create';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'visitas', 5, 60_000);
    if (!rl.success) return rateLimitResponse(rl.resetIn);

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
    const rawMessage = error instanceof Error ? error.message : '';
    const isConflict = rawMessage.includes('visita confirmada');
    console.error('[Visitas] Unexpected error:', error);
    return NextResponse.json(
      { error: isConflict ? 'Ya existe una visita confirmada para esta propiedad' : 'Error interno' },
      { status: isConflict ? 409 : 500 }
    );
  }
}
