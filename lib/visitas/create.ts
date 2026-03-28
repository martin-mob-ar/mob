import { supabaseAdmin } from '@/lib/supabase/server';

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

  // 2. Fetch active operacion for this property
  const { data: operacion } = await supabaseAdmin
    .from('operaciones')
    .select('id')
    .eq('property_id', propertyId)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 3. Insert visita
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
      whatsapp_state: 'owner_viewing_details',
    })
    .select('id')
    .single();

  if (visitaError || !visita) {
    throw new Error(`Failed to create visita: ${visitaError?.message}`);
  }

  // 4. Insert first proposal (requester proposes the date/time)
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

  // 5. Update visita with pending_proposal_id
  await supabaseAdmin
    .from('visitas')
    .update({ whatsapp_pending_proposal_id: proposal.id })
    .eq('id', visita.id);

  // 6. Fetch owner details
  const { data: owner } = await supabaseAdmin
    .from('users')
    .select('name, telefono, telefono_country_code')
    .eq('id', property.user_id)
    .single();

  return {
    visitaId: visita.id,
    ownerUserId: property.user_id,
    ownerName: owner?.name ?? null,
    ownerPhone: owner?.telefono ?? null,
    ownerCountryCode: owner?.telefono_country_code ?? null,
    propertyAddress: property.address ?? null,
  };
}
