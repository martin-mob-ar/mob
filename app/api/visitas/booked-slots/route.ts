import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');

  if (!propertyId || isNaN(Number(propertyId))) {
    return NextResponse.json({ error: 'propertyId requerido' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('visitas')
    .select('confirmed_date, confirmed_time')
    .eq('property_id', Number(propertyId))
    .eq('status', 'accepted')
    .not('confirmed_date', 'is', null)
    .not('confirmed_time', 'is', null);

  if (error) {
    console.error('[booked-slots] Query error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }

  const slots = (data ?? []).map((v) => ({
    date: v.confirmed_date!,
    time: v.confirmed_time!,
  }));

  return NextResponse.json({ slots });
}
