import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Recompute mailing preferences for a subscriber (guest or registered user).
 *
 * Accepts email, userId, or both. Resolves whichever is missing:
 * - userId-only (favoritos case): looks up email from users table
 * - email-only (guest lead case): checks mailing_preferences for a linked user_id
 *
 * Interactions counted:
 * - Leads filtered by email (covers pre- and post-registration leads)
 * - Favoritos filtered by user_id (only if known; guests have none)
 *
 * Designed to be called via after() — fire-and-forget after lead/favorito events.
 */
export async function recomputeMailingPreferences(opts: {
  email?: string;
  userId?: string;
  name?: string;
}): Promise<void> {
  try {
    let { email, userId, name } = opts;

    // Resolve email when only userId is provided (favoritos case)
    if (!email && userId) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();
      if (!user?.email) return;
      email = user.email;
      if (!name) name = user.name ?? undefined;
    }

    if (!email) return;

    // Resolve userId from existing row when not provided (guest lead case)
    // — the guest may have registered since their first lead
    if (!userId) {
      const { data: existing } = await supabaseAdmin
        .from('mailing_preferences')
        .select('user_id')
        .eq('email', email)
        .maybeSingle();
      userId = existing?.user_id ?? undefined;
    }

    // Count interactions: leads by email + favoritos by userId (if known)
    const [leadsRes, favsRes] = await Promise.all([
      supabaseAdmin.from('leads').select('property_id').eq('email', email),
      userId
        ? supabaseAdmin.from('favoritos').select('property_id').eq('user_id', userId)
        : Promise.resolve({ data: [] as { property_id: number }[] }),
    ]);

    const allPropertyIds = [
      ...new Set([
        ...(leadsRes.data?.map((l) => l.property_id) ?? []),
        ...(favsRes.data?.map((f) => f.property_id) ?? []),
      ]),
    ];
    const interactionsCount =
      (leadsRes.data?.length ?? 0) + (favsRes.data?.length ?? 0);

    if (allPropertyIds.length === 0) return;

    // Compute avg price (ARS-normalized) and state_ids from properties_read
    const { data: properties } = await supabaseAdmin
      .from('properties_read')
      .select('property_id, valor_total_primary, state_id')
      .in('property_id', allPropertyIds);

    let totalArs = 0;
    let priceCount = 0;
    const stateIds = new Set<number>();

    for (const p of properties ?? []) {
      if (p.state_id) stateIds.add(p.state_id);
      const price = Number(p.valor_total_primary);
      if (price > 0) {
        totalArs += price;
        priceCount++;
      }
    }

    const avgPriceArs = priceCount > 0 ? Math.round(totalArs / priceCount) : null;

    await supabaseAdmin
      .from('mailing_preferences')
      .upsert(
        {
          email,
          ...(userId ? { user_id: userId } : {}),
          ...(name ? { name } : {}),
          avg_price_ars: avgPriceArs,
          state_ids: [...stateIds],
          interactions_count: interactionsCount,
          last_recomputed_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
  } catch (error) {
    console.error('[Mailing Preferences] Recompute error:', error);
  }
}
