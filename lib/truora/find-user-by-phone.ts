import { supabaseAdmin } from '@/lib/supabase/server';

export interface FoundUser {
  id: string;
  name: string | null;
  email: string;
  telefono: string | null;
  telefono_country_code: string | null;
}

/**
 * Look up a user by phone number using a database function that handles
 * multiple formats: digits-only, with country code, and Argentina mobile prefix (9).
 */
export async function findUserByPhone(phone: string): Promise<FoundUser | null> {
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const { data, error } = await supabaseAdmin.rpc('find_user_by_phone', {
    p_phone: cleanPhone,
  });

  if (error) {
    console.error('[findUserByPhone] RPC error:', error);
    return null;
  }

  if (!data || data.length === 0) return null;

  return data[0] as FoundUser;
}
