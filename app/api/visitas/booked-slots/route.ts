import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');

  if (!propertyId || isNaN(Number(propertyId))) {
    return NextResponse.json({ error: 'propertyId requerido' }, { status: 400 });
  }

  // Accepted visitas with confirmed date/time
  const { data: acceptedData, error: acceptedError } = await supabaseAdmin
    .from('visitas')
    .select('confirmed_date, confirmed_time')
    .eq('property_id', Number(propertyId))
    .eq('status', 'accepted')
    .not('confirmed_date', 'is', null)
    .not('confirmed_time', 'is', null);

  // Pending visitas via their active proposals
  const { data: pendingData, error: pendingError } = await supabaseAdmin
    .from('visita_proposals')
    .select('proposed_date, proposed_time, visitas!inner(id)')
    .eq('visitas.property_id', Number(propertyId))
    .eq('visitas.status', 'pending')
    .eq('status', 'pending');

  if (acceptedError || pendingError) {
    console.error('[booked-slots] Query error:', acceptedError || pendingError);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }

  const slots = [
    ...(acceptedData ?? []).map((v) => ({ date: v.confirmed_date!, time: v.confirmed_time! })),
    ...(pendingData ?? []).map((v) => ({ date: v.proposed_date, time: v.proposed_time })),
  ];

  return NextResponse.json({ slots });
}
