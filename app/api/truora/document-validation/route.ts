import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { truoraDocumentValidationSchema } from '@/lib/validations/truora-document-validation';
import { findUserByPhone } from '@/lib/truora/find-user-by-phone';
import { createCertificadoInquilino } from '@/lib/certificados/create';

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
    console.error('[TruoraDocValidation] TRUORA_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = truoraDocumentValidationSchema.safeParse(body);

    if (!parsed.success) {
      console.error('[TruoraDocValidation] Invalid payload:', parsed.error.flatten());
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const documentVerified = payload.status === 'success' || payload.status === 'approved';

    // --- Look up user by phone ---
    const user = await findUserByPhone(payload.phone);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado para el teléfono proporcionado' },
        { status: 404 }
      );
    }

    // --- Insert into verificaciones_truora ---
    const { error: insertError } = await supabaseAdmin
      .from('verificaciones_truora')
      .insert({
        user_id: user.id,
        flow_name: 'document_validation',
        status: payload.status,
        truora_document_verified: documentVerified,
        validation_id: payload.validation_id ?? null,
        document_number: payload.document_number ?? null,
        name: payload.name ?? null,
        last_name: payload.last_name ?? null,
        gender: payload.gender ?? null,
        document_type: payload.document_type ?? null,
        date_of_birth: payload.date_of_birth ?? null,
        raw_response: body,
      });

    if (insertError) {
      console.error('[TruoraDocValidation] Insert error:', insertError);
    }

    // --- Update users table ---
    const userUpdate: Record<string, unknown> = {
      truora_document_verified: documentVerified,
    };

    if (documentVerified) {
      userUpdate.truora_last_verification_date = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(userUpdate)
      .eq('id', user.id);

    if (updateError) {
      console.error('[TruoraDocValidation] Update user error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    // --- Rebuild property listings if user just became document-verified ---
    if (documentVerified) {
      await supabaseAdmin.rpc('rebuild_user_property_listings', {
        p_user_id: user.id,
      });
    }

    // --- Issue/reuse tenant certificate if eligible (Hoggax + Truora both ok) ---
    // Fails soft: a certificate issue problem never breaks the webhook response.
    let certificado: { id: string; url: string; reused: boolean } | null = null;
    if (documentVerified) {
      try {
        certificado = await createCertificadoInquilino({ userId: user.id });
      } catch (err) {
        console.error('[TruoraDocValidation] Certificate issue failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      truora_document_verified: documentVerified,
      certificado_url: certificado?.url ?? null,
      certificado_id: certificado?.id ?? null,
    });
  } catch (error) {
    console.error('[TruoraDocValidation] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
