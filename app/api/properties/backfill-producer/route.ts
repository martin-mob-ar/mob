import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { TokkoClient } from '@/lib/tokko/client';
import { decryptApiKey } from '@/lib/crypto';

export const maxDuration = 300;

/**
 * One-time backfill: populate producer_email and producer_name on existing tokko properties.
 * Secured via CRON_SECRET. Delete this route after running.
 *
 * Usage: POST /api/properties/backfill-producer
 *   Headers: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let totalUpdated = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  try {
    // Get all companies with API keys
    const { data: companies, error: compError } = await supabaseAdmin
      .from('tokko_company')
      .select('id, name, tokko_key_enc, user_id')
      .not('tokko_key_enc', 'is', null);

    if (compError || !companies) {
      return NextResponse.json({ error: 'Failed to load companies', details: compError?.message }, { status: 500 });
    }

    console.log(`[Backfill] Processing ${companies.length} companies`);

    for (const company of companies) {
      try {
        const rawKey = decryptApiKey(company.tokko_key_enc!);
        const client = new TokkoClient(rawKey);
        let offset = 0;
        const limit = 500;
        let hasMore = true;

        while (hasMore) {
          const response = await client.fetchPropertyPage(offset, limit);

          for (const prop of response.objects) {
            const producerEmail = prop.producer?.email?.trim() || null;
            const producerName = prop.producer?.name?.trim() || null;

            if (!producerEmail && !producerName) {
              totalSkipped++;
              continue;
            }

            const { error: updateError } = await supabaseAdmin
              .from('properties')
              .update({ producer_email: producerEmail, producer_name: producerName })
              .eq('tokko_id', prop.id)
              .eq('user_id', company.user_id);

            if (updateError) {
              errors.push(`Company ${company.name}, prop ${prop.id}: ${updateError.message}`);
            } else {
              totalUpdated++;
            }
          }

          hasMore = !!response.meta.next && offset + limit < response.meta.total_count;
          offset += limit;
        }

        console.log(`[Backfill] Done: ${company.name}`);
      } catch (err) {
        const msg = `Company ${company.name}: ${err instanceof Error ? err.message : 'Unknown'}`;
        errors.push(msg);
        console.error(`[Backfill] ${msg}`);
      }
    }

    return NextResponse.json({
      success: true,
      updated: totalUpdated,
      skipped: totalSkipped,
      errors,
    });
  } catch (error) {
    console.error('[Backfill] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
