import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

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
 * Accepts either a user UUID (direct lookup) or a raw API key (hashed lookup).
 */
export async function resolveUserId(input: string): Promise<string> {
  // First try direct UUID lookup
  const { data: directUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', input)
    .maybeSingle();

  if (directUser) return directUser.id;

  // Fall back to hashing as API key
  const apiKeyHash = CryptoJS.SHA256(input).toString();
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

// Client-side Supabase client (for read operations if needed)
// Uses anon key which respects RLS policies
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
    },
  }
);
