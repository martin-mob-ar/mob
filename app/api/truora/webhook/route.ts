import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { truoraWebhookSchema } from '@/lib/validations/truora-webhook';
import { qualify } from '@/lib/hoggax/client';
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
    console.error('[TruoraWebhook] TRUORA_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = truoraWebhookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    // --- Run user lookup and Hoggax call in parallel ---
    const [user, hoggaxResult] = await Promise.all([
      findUserByPhone(payload.phone),
      qualify(payload)
        .then(({ response, rawResponse }) => ({
          approved: response.approved ?? null,
          maxRent: typeof response.max_rent_plus_expenses === 'number'
            ? response.max_rent_plus_expenses
            : null,
          rawResponse: rawResponse as Record<string, unknown>,
        }))
        .catch((hoggaxError) => {
          console.error('[TruoraWebhook] Hoggax API call failed:', hoggaxError);
          return {
            approved: null as boolean | null,
            maxRent: null as number | null,
            rawResponse: {
              error: hoggaxError instanceof Error ? hoggaxError.message : 'Unknown error',
            } as Record<string, unknown>,
          };
        }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado para el teléfono proporcionado' },
        { status: 404 }
      );
    }

    const userId = user.id;
    const hoggaxApproved = hoggaxResult.approved;
    const hoggaxMaxRent = hoggaxResult.maxRent;
    const hoggaxRawResponse = hoggaxResult.rawResponse;

    // --- Extract reason_code and message from raw response ---
    const reasonCode = hoggaxRawResponse && 'body' in hoggaxRawResponse
      ? (hoggaxRawResponse.body as Record<string, unknown>)?.reason_code as string | null ?? null
      : null;
    const hoggaxMessage = hoggaxRawResponse?.message as string | null ?? null;

    // --- Calculate property_rent_plus_expenses and case ---
    const rent = payload.rent ?? null;
    const expenses = payload.expenses ?? null;
    const propertyRentPlusExpenses = rent != null || expenses != null
      ? (rent ?? 0) + (expenses ?? 0)
      : null;

    let verificationCase: number | null = null;
    if (hoggaxApproved === true && hoggaxMaxRent != null && propertyRentPlusExpenses != null) {
      verificationCase = hoggaxMaxRent >= propertyRentPlusExpenses ? 1 : 2;
    } else if (hoggaxApproved === false) {
      verificationCase = 3;
    }

    // --- Insert into verificaciones_hoggax ---
    const { error: insertError } = await supabaseAdmin
      .from('verificaciones_hoggax')
      .insert({
        user_id: userId,
        flow_name: 'verificacion_para_agendar_visita',
        hoggax_max_rent_plus_expenses: hoggaxMaxRent,
        hoggax_approved: hoggaxApproved,
        dni: payload.document_value,
        genero: payload.gender_id,
        situacion_laboral: payload.employment_situation_id,
        antiguedad: payload.antiquity_id ?? null,
        ingresos_mensuales: payload.monthly_income ?? null,
        hoggax_raw_response: hoggaxRawResponse,
        reason_code: reasonCode,
        message: hoggaxMessage,
        property_rent_plus_expenses: propertyRentPlusExpenses,
        case: verificationCase,
      });

    if (insertError) {
      console.error('[TruoraWebhook] Insert verificacion error:', insertError);
    }

    // --- Update users table ---
    const userUpdate: Record<string, unknown> = {
      hoggax_max_rent_plus_expenses: hoggaxMaxRent,
      hoggax_approved: hoggaxApproved,
      dni: payload.document_value,
    };

    // Set hoggax_last_verification_date only when approved
    if (hoggaxApproved === true) {
      userUpdate.hoggax_last_verification_date = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(userUpdate)
      .eq('id', userId);

    if (updateError) {
      console.error('[TruoraWebhook] Update user error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      hoggax_approved: hoggaxApproved,
      hoggax_max_rent_plus_expenses: hoggaxMaxRent,
      property_rent_plus_expenses: propertyRentPlusExpenses,
      case: verificationCase,
    });
  } catch (error) {
    console.error('[TruoraWebhook] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
