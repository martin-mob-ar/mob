import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { leadApiSchema } from '@/lib/validations/lead';
import { createTokkoWebContact } from '@/lib/integrations/tokko-contact';
import { sendLeadEmail } from '@/lib/integrations/resend';
import { createNotionLead } from '@/lib/integrations/notion';
import { decryptApiKey } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { propertyId, type, name, email, phone, country_code, message, source, submitterUserId } = parsed.data;

    // Fetch property details
    const { data: property, error: propError } = await supabaseAdmin
      .from('properties')
      .select('id, tokko, tokko_id, user_id, address')
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
      .select('name, email, tokko_email, telefono, tokko_api_key_enc')
      .eq('id', property.user_id)
      .single();

    // Dispatch to external services in parallel (non-blocking for response)
    const dispatches: Promise<void>[] = [];

    // 1. Tokko or Email
    if (property.tokko && property.tokko_id) {
      dispatches.push(
        (async () => {
          let status: 'sent' | 'failed' | 'skipped' = 'skipped';
          try {
            if (!owner?.tokko_api_key_enc) {
              console.warn('[Leads] No encrypted Tokko API key for user, skipping webcontact');
              status = 'skipped';
            } else {
              const rawApiKey = decryptApiKey(owner.tokko_api_key_enc);
              const result = await createTokkoWebContact(rawApiKey, property.tokko_id!, {
                name,
                email,
                phone: fullPhone,
                message,
              });
              status = result.success ? 'sent' : 'failed';
            }
          } catch (err) {
            console.error('[Leads] Tokko dispatch error:', err);
            status = 'failed';
          }
          await supabaseAdmin
            .from('leads')
            .update({ tokko_status: status, email_status: 'skipped' })
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
            ownerName: owner?.name || undefined,
            ownerEmail: owner?.email || owner?.tokko_email || undefined,
            ownerPhone: owner?.telefono || undefined,
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

    return NextResponse.json({ success: true, leadId });
  } catch (error) {
    console.error('[Leads] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
