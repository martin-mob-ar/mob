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
  // First try direct UUID lookup on users.id
  const { data: directUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', input)
    .maybeSingle();

  if (directUser) return directUser.id;

  // Try lookup by auth_id (Supabase Auth UUID)
  const { data: authUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', input)
    .maybeSingle();

  if (authUser) return authUser.id;

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

/**
 * Verify an auth user ID and return the corresponding public users row,
 * creating one if it doesn't exist yet.
 * Works for all users — with or without a Tokko API key.
 */
export async function getOrCreateUserFromAuth(authId: string): Promise<string> {
  // Verify the auth user exists
  const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(authId);

  if (authError || !authUser) {
    throw new Error('Auth user not found');
  }

  // Try to find existing public users row by auth_id
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .maybeSingle();

  if (existing) return existing.id;

  // Create a new public users row linked to this auth user
  const { data: newUser, error } = await supabaseAdmin
    .from('users')
    .insert({
      auth_id: authId,
      email: authUser.email!,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
    })
    .select('id')
    .single();

  if (error || !newUser) {
    throw new Error(`Failed to create user: ${error?.message || 'Unknown error'}`);
  }

  return newUser.id;
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
