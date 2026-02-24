import { cache } from "react";
import { createClient } from "@/lib/supabase/server-component";

/**
 * Cached auth user lookup — deduplicated per request via React cache().
 * Safe to call from both layout and page without extra network requests.
 */
export const getAuthUser = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});
