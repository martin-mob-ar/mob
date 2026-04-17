import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { leadApiSchema } from '@/lib/validations/lead';
import { createTokkoWebContact } from '@/lib/integrations/tokko-contact';
import { sendLeadEmail, sendInmobiliariaLeadEmail } from '@/lib/integrations/resend';
import { createNotionLead } from '@/lib/integrations/notion';
import { decryptApiKey } from '@/lib/crypto';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'leads', 5, 60_000);
    if (!rl.success) return rateLimitResponse(rl.resetIn);

    const body = await request.json();
    const parsed = leadApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { propertyId, type, name, email, phone, country_code, message, source, submitterUserId, analyticsContext, analyticsSessionId } = parsed.data;

    // Fetch property details (include company_id for webcontact key lookup)
    const { data: property, error: propError } = await supabaseAdmin
      .from('properties')
      .select('id, tokko, tokko_id, user_id, address, company_id, producer_email')
      .eq('id', propertyId)
      .single();

    if (propError || !property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    // Insert lead into database
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        property_id: propertyId,
        owner_id: property.user_id,
        type,
        name,
        email,
        phone: phone || null,
        country_code,
        message,
        source,
        submitter_user_id: submitterUserId || null,
      })
      .select('id')
      .single();

    if (leadError) {
      console.error('[Leads] Insert error:', leadError);
      return NextResponse.json({ error: 'Error al guardar la consulta' }, { status: 500 });
    }

    const leadId = lead.id;
    const fullPhone = phone ? `${country_code}${phone}` : undefined;

    // Fetch owner data once for all dispatches
    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('name, email, tokko_email, telefono, tokko_api_key_enc, account_type')
      .eq('id', property.user_id)
      .single();

    // For inmobiliaria accounts (type 3/4), fetch company data for owner fields
    let companyData: { name: string | null; email: string | null; phone: string | null } | null = null;
    if (owner?.account_type === 4 && property.company_id) {
      const { data: company } = await supabaseAdmin
        .from('tokko_company')
        .select('name, email, phone')
        .eq('id', property.company_id)
        .single();
      companyData = company;
    }

    // Determine if the submitter (inquilino) is verified (requires both Hoggax + Truora)
    let inquilinoVerified = false;
    if (submitterUserId) {
      const { data: submitter } = await supabaseAdmin
        .from('users')
        .select('hoggax_last_verification_date, truora_last_verification_date')
        .eq('id', submitterUserId)
        .single();
      inquilinoVerified = !!submitter?.hoggax_last_verification_date && !!submitter?.truora_last_verification_date;
    }

    // Get mob plan from the property's latest operacion
    const { data: operacion } = await supabaseAdmin
      .from('operaciones')
      .select('planMobElegido')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const propertyPlan = operacion?.planMobElegido || 'basico';

    // Dispatch to external services in parallel (non-blocking for response)
    const dispatches: Promise<void>[] = [];

    // 1. Inmobiliarias (tokko) → Tokko WebContact + Resend email, Dueños/inquilinos → Email only
    if (property.tokko && property.tokko_id) {
      dispatches.push(
        (async () => {
          let tokkoStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
          let emailStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
          let companyEmail: string | null = null;

          // A. Tokko WebContact
          try {
            let encryptedKey: string | null = null;

            if (property.company_id) {
              const { data: company } = await supabaseAdmin
                .from('tokko_company')
                .select('tokko_key_enc, email')
                .eq('id', property.company_id)
                .single();
              encryptedKey = company?.tokko_key_enc || null;
              companyEmail = company?.email || null;
            }

            if (!encryptedKey) {
              encryptedKey = owner?.tokko_api_key_enc || null;
            }

            if (!encryptedKey) {
              console.warn('[Leads] No encrypted Tokko API key found (company or user), skipping webcontact');
            } else {
              const rawApiKey = decryptApiKey(encryptedKey);
              const result = await createTokkoWebContact(rawApiKey, property.tokko_id!, {
                name,
                email,
                phone: fullPhone,
                message,
              }, inquilinoVerified);
              tokkoStatus = result.success ? 'sent' : 'failed';
            }
          } catch (err) {
            console.error('[Leads] Tokko dispatch error:', err);
            tokkoStatus = 'failed';
          }

          // B. Resend email to producer (fallback to company email)
          try {
            const recipientEmail = property.producer_email || companyEmail;
            if (!recipientEmail) {
              console.warn('[Leads] No producer or company email found, skipping inmobiliaria email');
            } else {
              const cc = process.env.LEAD_CC_EMAIL;
              const result = await sendInmobiliariaLeadEmail(recipientEmail, cc, {
                name,
                email,
                phone: fullPhone,
                propertyAddress: property.address || 'Dirección no disponible',
              });
              emailStatus = result.success ? 'sent' : 'failed';
            }
          } catch (err) {
            console.error('[Leads] Inmobiliaria email dispatch error:', err);
            emailStatus = 'failed';
          }

          await supabaseAdmin
            .from('leads')
            .update({ tokko_status: tokkoStatus, email_status: emailStatus })
            .eq('id', leadId);
        })()
      );
    } else {
      dispatches.push(
        (async () => {
          let status: 'sent' | 'failed' | 'skipped' = 'skipped';
          try {
            const ownerEmail = owner?.email || owner?.tokko_email;
            if (!ownerEmail) {
              console.warn('[Leads] No owner email found, skipping email');
              status = 'skipped';
            } else {
              const cc = process.env.LEAD_CC_EMAIL;
              const result = await sendLeadEmail(ownerEmail, cc, {
                name,
                email,
                phone: fullPhone,
                message,
                type,
                propertyPlan,
                inquilinoVerified,
              }, {
                address: property.address || 'Dirección no disponible',
                propertyId: property.id,
              });
              status = result.success ? 'sent' : 'failed';
            }
          } catch (err) {
            console.error('[Leads] Email dispatch error:', err);
            status = 'failed';
          }
          await supabaseAdmin
            .from('leads')
            .update({ email_status: status, tokko_status: 'skipped' })
            .eq('id', leadId);
        })()
      );
    }

    // 2. Notion
    dispatches.push(
      (async () => {
        let status: 'sent' | 'failed' | 'skipped' = 'skipped';
        try {
          const result = await createNotionLead({
            name,
            email,
            phone: fullPhone,
            message,
            type,
            source,
            propertyId: property.id,
            tokko: property.tokko ?? false,
            ownerName: companyData?.name || owner?.name || undefined,
            ownerEmail: property.producer_email || companyData?.email || owner?.email || owner?.tokko_email || undefined,
            ownerPhone: companyData?.phone || owner?.telefono || undefined,
          });
          status = result.success ? 'sent' : 'failed';
        } catch (err) {
          console.error('[Leads] Notion dispatch error:', err);
          status = 'failed';
        }
        await supabaseAdmin
          .from('leads')
          .update({ notion_status: status })
          .eq('id', leadId);
      })()
    );

    // Fire all dispatches but don't block the response
    Promise.allSettled(dispatches).catch((err) => {
      console.error('[Leads] Dispatch error:', err);
    });

    // Log agendar_visita_submit event when lead came from the visita CTA
    if (analyticsContext === 'agendar_visita') {
      try {
        const cookieStore = await cookies();
        const anonId = cookieStore.get('mob_anon_id')?.value ?? analyticsSessionId ?? null;
        const userId = submitterUserId ?? null;
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        let attributionStatus: 'recovered_via_user' | 'direct_session' | 'unattributed' = 'unattributed';
        let clickEventId: number | null = null;

        if (userId) {
          const { data } = await supabaseAdmin
            .from('property_events')
            .select('id')
            .eq('property_id', propertyId)
            .eq('event_type', 'agendar_visita_click')
            .eq('user_id', userId)
            .gte('created_at', cutoff)
            .order('created_at', { ascending: false })
            .limit(1);
          if (data?.[0]) { attributionStatus = 'recovered_via_user'; clickEventId = data[0].id; }
        }
        if (attributionStatus === 'unattributed' && anonId) {
          const { data } = await supabaseAdmin
            .from('property_events')
            .select('id')
            .eq('property_id', propertyId)
            .eq('event_type', 'agendar_visita_click')
            .eq('session_id', anonId)
            .gte('created_at', cutoff)
            .order('created_at', { ascending: false })
            .limit(1);
          if (data?.[0]) { attributionStatus = 'direct_session'; clickEventId = data[0].id; }
        }

        await supabaseAdmin.from('property_events').insert({
          property_id: propertyId,
          event_type: 'agendar_visita_submit',
          user_id: userId,
          session_id: anonId,
          metadata: { lead_id: leadId, source: 'lead_form', attribution_status: attributionStatus, click_event_id: clickEventId },
        });
      } catch (err) {
        console.error('[Leads] Analytics event insert error:', err);
      }
    }

    return NextResponse.json({ success: true, leadId });
  } catch (error) {
    console.error('[Leads] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
