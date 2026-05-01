import { supabaseAdmin } from '@/lib/supabase/server';
import { sendOwnerNewVisitaRequest, toKapsoPhone, formatVisitDateTime } from '@/lib/kapso/client';

export interface CreateVisitaParams {
  propertyId: number;
  proposedDate: string; // yyyy-MM-dd
  proposedTime: string; // HH:mm
  requesterUserId?: string | null;
  requesterName: string;
  requesterEmail?: string | null;
  requesterPhone?: string | null;
  requesterCountryCode?: string;
}

export interface CreateVisitaResult {
  visitaId: number;
  ownerUserId: string;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerCountryCode: string | null;
  propertyAddress: string | null;
}

export async function createVisita(params: CreateVisitaParams): Promise<CreateVisitaResult> {
  const {
    propertyId,
    proposedDate,
    proposedTime,
    requesterUserId,
    requesterName,
    requesterEmail,
    requesterPhone,
    requesterCountryCode,
  } = params;

  // 1. Fetch property → owner user_id + address
  const { data: property, error: propError } = await supabaseAdmin
    .from('properties')
    .select('id, user_id, address')
    .eq('id', propertyId)
    .single();

  if (propError || !property) {
    throw new Error(`Property ${propertyId} not found`);
  }

  // 2a. Check for existing visita at the same date+time (accepted or pending)
  const { data: acceptedConflict } = await supabaseAdmin
    .from('visitas')
    .select('id')
    .eq('property_id', propertyId)
    .eq('status', 'accepted')
    .eq('confirmed_date', proposedDate)
    .eq('confirmed_time', proposedTime)
    .limit(1)
    .maybeSingle();

  if (acceptedConflict) {
    throw new Error('Ya hay una visita confirmada en ese horario');
  }

  const { data: pendingConflict } = await supabaseAdmin
    .from('visita_proposals')
    .select('id, visitas!inner(id)')
    .eq('visitas.property_id', propertyId)
    .eq('visitas.status', 'pending')
    .eq('status', 'pending')
    .eq('proposed_date', proposedDate)
    .eq('proposed_time', proposedTime)
    .limit(1)
    .maybeSingle();

  if (pendingConflict) {
    throw new Error('Ya hay una visita pendiente en ese horario');
  }

  // 2b. Check for duplicate submission from the same requester (pending or accepted)
  if (requesterUserId) {
    const { data: duplicate } = await supabaseAdmin
      .from('visitas')
      .select('id')
      .eq('property_id', propertyId)
      .eq('requester_user_id', requesterUserId)
      .in('status', ['pending', 'accepted'])
      .limit(1)
      .maybeSingle();

    if (duplicate) {
      throw new Error('Ya tenés una visita pendiente o confirmada para esta propiedad');
    }
  }

  // 3. Fetch active operacion for this property
  const { data: operacion } = await supabaseAdmin
    .from('operaciones')
    .select('id')
    .eq('property_id', propertyId)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 4. Insert visita
  const { data: visita, error: visitaError } = await supabaseAdmin
    .from('visitas')
    .insert({
      property_id: propertyId,
      operacion_id: operacion?.id ?? null,
      requester_user_id: requesterUserId ?? null,
      requester_name: requesterName,
      requester_email: requesterEmail ?? null,
      requester_phone: requesterPhone ?? null,
      requester_country_code: requesterCountryCode ?? null,
      owner_user_id: property.user_id,
      status: 'pending',
      whatsapp_state: 'owner_responding',
    })
    .select('id')
    .single();

  if (visitaError || !visita) {
    throw new Error(`Failed to create visita: ${visitaError?.message}`);
  }

  // 5. Insert first proposal (requester proposes the date/time)
  const { data: proposal, error: proposalError } = await supabaseAdmin
    .from('visita_proposals')
    .insert({
      visita_id: visita.id,
      proposed_by: 'requester',
      proposed_date: proposedDate,
      proposed_time: proposedTime,
      status: 'pending',
    })
    .select('id')
    .single();

  if (proposalError || !proposal) {
    // Clean up visita if proposal fails
    await supabaseAdmin.from('visitas').delete().eq('id', visita.id);
    throw new Error(`Failed to create visita_proposal: ${proposalError?.message}`);
  }

  // 6. Update visita with pending_proposal_id
  await supabaseAdmin
    .from('visitas')
    .update({ whatsapp_pending_proposal_id: proposal.id })
    .eq('id', visita.id);

  // 7. Fetch owner details
  const { data: owner } = await supabaseAdmin
    .from('users')
    .select('name, telefono, telefono_country_code')
    .eq('id', property.user_id)
    .single();

  const result: CreateVisitaResult = {
    visitaId: visita.id,
    ownerUserId: property.user_id,
    ownerName: owner?.name ?? null,
    ownerPhone: owner?.telefono ?? null,
    ownerCountryCode: owner?.telefono_country_code ?? null,
    propertyAddress: property.address ?? null,
  };

  // 8. Fire-and-forget Kapso notification to owner
  if (result.ownerPhone) {
    const ownerKapsoPhone = toKapsoPhone(result.ownerCountryCode ?? '', result.ownerPhone);
    const { dayLabel, time: formattedTime } = formatVisitDateTime(proposedDate, proposedTime);
    sendOwnerNewVisitaRequest({
      ownerPhone: ownerKapsoPhone,
      ownerName: result.ownerName ?? 'Propietario',
      address: result.propertyAddress ?? '',
      dayLabel,
      time: formattedTime,
    }).catch((err) => console.error('[createVisita] Kapso notify failed:', err));
  } else {
    console.warn(`[createVisita] Owner has no phone, skipping Kapso notify for visita ${result.visitaId}`);
  }

  return result;
}
