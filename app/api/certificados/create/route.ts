import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { createCertificadoInquilino } from '@/lib/certificados/create';

const bodySchema = z.object({
  userId: z.string().uuid('userId debe ser un UUID válido'),
});

function verifyWebhookSecret(request: Request): boolean {
  const secret = process.env.TRUORA_WEBHOOK_SECRET;
  if (!secret) return false;
  const header = request.headers.get('x-webhook-secret') || '';
  try {
    const a = Buffer.from(header);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!process.env.TRUORA_WEBHOOK_SECRET) {
    console.error('[certificados.create] TRUORA_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 503 }
    );
  }
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createCertificadoInquilino({
      userId: parsed.data.userId,
    });

    if (!result) {
      return NextResponse.json(
        {
          error:
            'No se pudo crear el certificado. El usuario puede no estar verificado o no tener aprobación de Hoggax.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      url: result.url,
      reused: result.reused,
    });
  } catch (error) {
    console.error('[certificados.create] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
