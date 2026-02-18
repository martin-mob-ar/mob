import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const apiKeyHash = request.nextUrl.searchParams.get('apiKeyHash');

  if (!apiKeyHash || apiKeyHash.length < 10) {
    return NextResponse.json({ error: 'apiKeyHash is required' }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('sync_status, sync_message, sync_properties_count')
    .eq('tokko_api_hash', apiKeyHash)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ status: 'idle', message: null, propertiesCount: null });
  }

  return NextResponse.json({
    status: user.sync_status,
    message: user.sync_message,
    propertiesCount: user.sync_properties_count,
  });
}
