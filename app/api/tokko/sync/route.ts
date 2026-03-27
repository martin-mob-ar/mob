import { NextRequest, NextResponse, after } from 'next/server';
import { syncTokkoData, triggerSyncContinuation } from '@/lib/sync/service';

export const maxDuration = 300; // 5 minutes for large syncs

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[Tokko Sync API] POST /api/tokko/sync received');
  try {
    const body = await request.json();
    const { apiKey, limit: rawLimit, authId, authEmail, resume } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      console.warn('[Tokko Sync API] Rejected: API key missing or empty');
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!authId || !authEmail) {
      console.warn('[Tokko Sync API] Rejected: authId or authEmail missing');
      return NextResponse.json(
        { error: 'Authentication required — authId and authEmail are required' },
        { status: 401 }
      );
    }

    // Validate API key format (basic check)
    if (apiKey.length < 10) {
      console.warn('[Tokko Sync API] Rejected: API key too short');
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 400 }
      );
    }

    const isResume = resume === true;
    if (isResume) {
      console.log('[Tokko Sync API] Self-chained resume call');
    }

    const propertyLimit = typeof rawLimit === 'number' && rawLimit > 0
      ? Math.min(500, Math.max(1, Math.floor(rawLimit)))
      : typeof rawLimit === 'string' && rawLimit.trim() !== ''
        ? Math.min(500, Math.max(1, parseInt(rawLimit, 10) || 5))
        : 5;
    console.log('[Tokko Sync API] Starting sync (API key masked, property limit:', propertyLimit, ', authId:', authId || 'none', ', resume:', isResume, ')');
    const result = await syncTokkoData(apiKey.trim(), propertyLimit, authId, authEmail, isResume, startTime);
    console.log('[Tokko Sync API] Sync completed:', {
      userId: result.userId,
      propertiesSynced: result.propertiesSynced,
      companiesSynced: result.companiesSynced,
      locationsSynced: result.locationsSynced,
      errorCount: result.errors.length,
      needsChain: result.needsChain ?? false,
    });
    if (result.errors.length > 0) {
      console.warn('[Tokko Sync API] Sync had errors:', result.errors);
    }

    // If the sync needs to continue, fire the chain call INLINE (before response)
    // so it's sent regardless of whether after() runs — on localhost, after() won't
    // fire for self-chained requests because the client disconnects after 10s.
    // after() is kept as a safety net to ensure Vercel keeps the container alive
    // long enough for the fetch to complete.
    if (result.needsChain && result.chainParams) {
      const { apiKey: chainKey, authId: chainAuthId, authEmail: chainAuthEmail } = result.chainParams;
      const chainPromise = triggerSyncContinuation(chainKey, chainAuthId, chainAuthEmail);
      after(() => chainPromise);
      console.log('[Tokko Sync API] Self-chain fired inline + after() safety net');
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[Tokko Sync API] Sync error:', error);

    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
