import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { truoraDocumentValidationSchema } from '@/lib/validations/truora-document-validation';
import { findUserByPhone } from '@/lib/truora/find-user-by-phone';

export async function POST(request: Request) {
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
    const documentVerified = payload.status === 'success';

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

    return NextResponse.json({
      success: true,
      userId: user.id,
      truora_document_verified: documentVerified,
    });
  } catch (error) {
    console.error('[TruoraDocValidation] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
