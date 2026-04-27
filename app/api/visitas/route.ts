import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { visitaApiSchema } from '@/lib/validations/visita';
import { createVisita } from '@/lib/visitas/create';
import { supabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { sendAlertNuevaVisita, formatVisitDateTime } from '@/lib/kapso/client';

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
      analyticsSessionId,
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

    // Log agendar_visita_submit event (non-blocking)
    try {
      const cookieStore = await cookies();
      const anonId = cookieStore.get('mob_anon_id')?.value ?? analyticsSessionId ?? null;
      const userId = submitterUserId ?? null;
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      let attributionStatus: 'recovered_via_user' | 'direct_session' | 'unattributed' = 'unattributed';
      let viewEventId: number | null = null;

      if (userId) {
        const { data } = await supabaseAdmin
          .from('property_events')
          .select('id')
          .eq('property_id', propertyId)
          .eq('event_type', 'property_view')
          .eq('user_id', userId)
          .gte('created_at', cutoff)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data?.[0]) { attributionStatus = 'recovered_via_user'; viewEventId = data[0].id; }
      }
      if (attributionStatus === 'unattributed' && anonId) {
        const { data } = await supabaseAdmin
          .from('property_events')
          .select('id')
          .eq('property_id', propertyId)
          .eq('event_type', 'property_view')
          .eq('session_id', anonId)
          .gte('created_at', cutoff)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data?.[0]) { attributionStatus = 'direct_session'; viewEventId = data[0].id; }
      }

      await supabaseAdmin.from('property_events').insert({
        property_id: propertyId,
        event_type: 'agendar_visita_submit',
        user_id: userId,
        session_id: anonId,
        metadata: { visita_id: result.visitaId, attribution_status: attributionStatus, view_event_id: viewEventId },
      });
    } catch (err) {
      console.error('[Visitas] Analytics event insert error:', err);
    }

    // Fire-and-forget internal alert
    const { dayLabel, time: formattedTime } = formatVisitDateTime(proposedDate, proposedTime);
    sendAlertNuevaVisita({
      address: result.propertyAddress ?? 'Sin dirección',
      requesterName: name,
      requesterEmail: email ?? null,
      requesterPhone: phone ?? null,
      requesterCountryCode: country_code ?? null,
      dayLabel,
      time: formattedTime,
    }).catch((err) => console.error('[Visitas] Alert send failed:', err));

    return NextResponse.json({ success: true, visitaId: result.visitaId });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : '';
    const isConflict = rawMessage.includes('visita confirmada') || rawMessage.includes('visita pendiente');
    console.error('[Visitas] Unexpected error:', error);
    return NextResponse.json(
      { error: isConflict ? rawMessage : 'Error interno' },
      { status: isConflict ? 409 : 500 }
    );
  }
}
