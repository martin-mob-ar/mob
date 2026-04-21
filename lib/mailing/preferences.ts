import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Recompute mailing preferences for a user based on all their
 * leads (as submitter) and favoritos. Updates the running average
 * price (ARS-normalized) and set of state IDs.
 *
 * Designed to be called fire-and-forget after lead/favorito events.
 */
export async function recomputeMailingPreferences(userId: string): Promise<void> {
  try {
    // 1. Gather property IDs from leads + favoritos
    const [leadsRes, favsRes] = await Promise.all([
      supabaseAdmin
        .from('leads')
        .select('property_id')
        .eq('submitter_user_id', userId),
      supabaseAdmin
        .from('favoritos')
        .select('property_id')
        .eq('user_id', userId),
    ]);

    const leadPropertyIds = leadsRes.data?.map((l) => l.property_id) ?? [];
    const favPropertyIds = favsRes.data?.map((f) => f.property_id) ?? [];

    const allPropertyIds = [...new Set([...leadPropertyIds, ...favPropertyIds])];
    const interactionsCount = (leadsRes.data?.length ?? 0) + (favsRes.data?.length ?? 0);

    if (allPropertyIds.length === 0) {
      // No interactions — upsert with empty data
      await supabaseAdmin
        .from('user_mailing_preferences')
        .upsert(
          {
            user_id: userId,
            avg_price_ars: null,
            state_ids: [],
            interactions_count: interactionsCount,
            last_recomputed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      return;
    }

    // 2. Fetch price + state from properties_read (valor_total_primary is already ARS-normalized)
    const { data: properties } = await supabaseAdmin
      .from('properties_read')
      .select('property_id, valor_total_primary, state_id')
      .in('property_id', allPropertyIds);

    // 3. Compute averages
    let totalArs = 0;
    let priceCount = 0;
    const stateIds = new Set<number>();

    for (const p of properties ?? []) {
      if (p.state_id) stateIds.add(p.state_id);

      const price = Number(p.valor_total_primary);
      if (price && price > 0) {
        totalArs += price;
        priceCount++;
      }
    }

    const avgPriceArs = priceCount > 0 ? Math.round(totalArs / priceCount) : null;

    // 4. Upsert preferences
    await supabaseAdmin
      .from('user_mailing_preferences')
      .upsert(
        {
          user_id: userId,
          avg_price_ars: avgPriceArs,
          state_ids: [...stateIds],
          interactions_count: interactionsCount,
          last_recomputed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
  } catch (error) {
    console.error('[Mailing Preferences] Error recomputing for user', userId, error);
  }
}
