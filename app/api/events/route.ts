import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server-component';
import { supabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

const CLIENT_EVENT_TYPES = [
  'property_view',
  'agendar_visita_click',
  'agendar_visita_submit_started',
] as const;

type ClientEventType = (typeof CLIENT_EVENT_TYPES)[number];

function isValidEventType(t: unknown): t is ClientEventType {
  return typeof t === 'string' && (CLIENT_EVENT_TYPES as readonly string[]).includes(t);
}

async function getPublicUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** Daily salt for IP hashing — rotates each UTC day. */
function dailySalt(): string {
  return `mob:${new Date().toISOString().slice(0, 10)}`;
}

export async function POST(request: Request) {
  try {
    // 1. Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'events', 120, 60_000);
    if (!rl.success) return rateLimitResponse(rl.resetIn);

    // 2. Parse & validate
    const body = await request.json();
    const propertyId = Number(body.propertyId);
    if (!propertyId || isNaN(propertyId)) {
      return NextResponse.json({ error: 'propertyId inválido' }, { status: 400 });
    }
    if (!isValidEventType(body.eventType)) {
      return NextResponse.json({ error: 'eventType inválido' }, { status: 400 });
    }

    // 3. Auth (optional — anonymous is OK)
    const userId = await getPublicUserId();

    // 4. Cookie: canonical anon identity
    const cookieStore = await cookies();
    let anonId = cookieStore.get('mob_anon_id')?.value;
    if (!anonId) {
      anonId = (typeof body.sessionId === 'string' && body.sessionId) || crypto.randomUUID();
      cookieStore.set('mob_anon_id', anonId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }

    // 5. IP hash (GDPR-friendly — can't reverse to IP)
    const ipHash = createHash('sha256').update(`${ip}:${dailySalt()}`).digest('hex');

    // 6. Insert (fire-and-forget — don't fail the response)
    supabaseAdmin
      .from('property_events')
      .insert({
        property_id: propertyId,
        event_type: body.eventType,
        user_id: userId,
        session_id: anonId,
        ip_hash: ipHash,
        user_agent: request.headers.get('user-agent') || null,
        metadata: body.metadata ?? null,
      })
      .then(({ error }) => {
        if (error) console.error('[Events] Insert error:', error.message);
      });

    // 7. 204 No Content
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('[Events] Unexpected error:', error);
    return new Response(null, { status: 204 }); // Don't expose errors for analytics
  }
}
