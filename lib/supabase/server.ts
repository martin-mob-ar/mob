import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Server-side Supabase client with service role key for admin operations
// This bypasses RLS and should ONLY be used server-side
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Resolve a user identifier to the database user UUID.
 * Accepts either a user UUID (direct lookup on public.users.id, which now
 * equals auth.users.id) or a raw Tokko API key (hashed lookup).
 */
export async function resolveUserId(input: string): Promise<string> {
  // Direct UUID lookup on users.id (which = auth.users.id since the unification migration)
  const { data: directUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', input)
    .maybeSingle();

  if (directUser) return directUser.id;

  // Fall back to hashing as Tokko API key
  const apiKeyHash = createHash('sha256').update(input).digest('hex');
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('tokko_api_hash', apiKeyHash)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  return user.id;
}

/**
 * Return the public.users.id for a given auth user ID.
 *
 * Since the ID unification migration, `public.users.id = auth.users.id`, so
 * `authId` IS the public user id. We still verify the row exists (and create
 * it if the `on_auth_user_created` trigger raced).
 */
export async function getOrCreateUserFromAuth(authId: string): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', authId)
    .maybeSingle();

  if (existing) return authId;

  // Fallback: trigger didn't fire yet (race) — create manually.
  const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(authId);
  if (authError || !authUser) {
    throw new Error('Auth user not found');
  }

  const { error } = await supabaseAdmin
    .from('users')
    .upsert({
      id: authId,
      email: authUser.email || '',
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
    }, { onConflict: 'id' });

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return authId;
}

// Client-side Supabase client (for read operations if needed)
// Uses anon key which respects RLS policies
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined');
}
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
    },
  }
);
