import { NextRequest, NextResponse } from 'next/server';
import { syncTokkoData } from '@/lib/sync/service';

export const maxDuration = 300; // 5 minutes for large syncs

export async function POST(request: NextRequest) {
  console.log('[Tokko Sync API] POST /api/tokko/sync received');
  try {
    const body = await request.json();
    const { apiKey, limit: rawLimit } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      console.warn('[Tokko Sync API] Rejected: API key missing or empty');
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
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

    const propertyLimit = typeof rawLimit === 'number' && rawLimit > 0
      ? Math.min(500, Math.max(1, Math.floor(rawLimit)))
      : typeof rawLimit === 'string' && rawLimit.trim() !== ''
        ? Math.min(500, Math.max(1, parseInt(rawLimit, 10) || 5))
        : 5;
    console.log('[Tokko Sync API] Starting sync (API key masked, property limit:', propertyLimit, ')');
    const result = await syncTokkoData(apiKey.trim(), propertyLimit);
    console.log('[Tokko Sync API] Sync completed:', {
      userId: result.userId,
      propertiesSynced: result.propertiesSynced,
      branchesSynced: result.branchesSynced,
      usersSynced: result.usersSynced,
      ownersSynced: result.ownersSynced,
      locationsSynced: result.locationsSynced,
      errorCount: result.errors.length,
    });
    if (result.errors.length > 0) {
      console.warn('[Tokko Sync API] Sync had errors:', result.errors);
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
