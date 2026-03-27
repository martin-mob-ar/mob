import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { visitaApiSchema } from '@/lib/validations/visita';

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

    // Fetch property to get owner
    const { data: property, error: propError } = await supabaseAdmin
      .from('properties')
      .select('id, user_id')
      .eq('id', propertyId)
      .single();

    if (propError || !property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    // Get the latest active operacion for this property
    const { data: operacion } = await supabaseAdmin
      .from('operaciones')
      .select('id')
      .eq('property_id', propertyId)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Create the visita
    const { data: visita, error: visitaError } = await supabaseAdmin
      .from('visitas')
      .insert({
        property_id: propertyId,
        operacion_id: operacion?.id || null,
        requester_user_id: submitterUserId || null,
        requester_name: name,
        requester_email: email,
        requester_phone: phone || null,
        requester_country_code: country_code,
        owner_user_id: property.user_id,
        status: 'pending',
      })
      .select('id')
      .single();

    if (visitaError) {
      console.error('[Visitas] Insert error:', visitaError);
      return NextResponse.json({ error: 'Error al crear la solicitud de visita' }, { status: 500 });
    }

    // Create the first proposal
    const { error: proposalError } = await supabaseAdmin
      .from('visita_proposals')
      .insert({
        visita_id: visita.id,
        proposed_by: 'requester',
        proposed_date: proposedDate,
        proposed_time: proposedTime,
        status: 'pending',
      });

    if (proposalError) {
      console.error('[Visitas] Proposal insert error:', proposalError);
      // Clean up the visita if proposal fails
      await supabaseAdmin.from('visitas').delete().eq('id', visita.id);
      return NextResponse.json({ error: 'Error al crear la propuesta de visita' }, { status: 500 });
    }

    return NextResponse.json({ success: true, visitaId: visita.id });
  } catch (error) {
    console.error('[Visitas] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
