import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server-component';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/events/stitch
 *
 * Called from AuthModal after login/signup to backfill user_id onto
 * prior anonymous property_events that share the same mob_anon_id cookie.
 * This stitches pre-auth views/clicks to the now-authenticated user.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const anonId = cookieStore.get('mob_anon_id')?.value;
    if (!anonId) return NextResponse.json({ stitched: 0 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ stitched: 0 });

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data } = await supabaseAdmin
      .from('property_events')
      .update({ user_id: user.id })
      .is('user_id', null)
      .eq('session_id', anonId)
      .gte('created_at', cutoff)
      .select('id');

    return NextResponse.json({ stitched: data?.length ?? 0 });
  } catch (error) {
    console.error('[Events/stitch] Error:', error);
    return NextResponse.json({ stitched: 0 });
  }
}
