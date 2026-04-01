import { supabaseAdmin } from '@/lib/supabase/server';

export interface FoundUser {
  id: string;
  name: string | null;
  email: string;
  telefono: string | null;
  telefono_country_code: string | null;
}

/**
 * Look up a user by phone number across multiple formats.
 * Handles: digits-only, with country code, and Argentina WhatsApp mobile prefix (9).
 */
export async function findUserByPhone(phone: string): Promise<FoundUser | null> {
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name, email, telefono, telefono_country_code')
    .not('telefono', 'is', null);

  if (!users) return null;

  const match = users.find((u) => {
    const codeDigits = (u.telefono_country_code || '').replace(/[^0-9]/g, '');
    const userPhone = u.telefono || '';
    const full = codeDigits + userPhone;
    // Also try with '9' inserted after country code (Argentina WhatsApp mobile prefix)
    const fullWithMobile9 = codeDigits + '9' + userPhone;
    return full === cleanPhone || fullWithMobile9 === cleanPhone || userPhone === cleanPhone;
  });

  return match ?? null;
}
