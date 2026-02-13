import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('[Tokko Account Delete] POST /api/tokko/account/delete received');
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      console.warn('[Tokko Account Delete] Rejected: userId missing or empty');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, name')
      .eq('id', userId.trim())
      .single();

    if (fetchError || !user) {
      console.warn('[Tokko Account Delete] User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user (CASCADE will remove all related data: properties, branches, users, owners, etc.)
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId.trim());

    if (deleteError) {
      console.error('[Tokko Account Delete] Delete failed:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account', message: deleteError.message },
        { status: 500 }
      );
    }

    console.log('[Tokko Account Delete] Account deleted:', userId, user.name || '');
    return NextResponse.json({ success: true, message: 'Account and all associated data deleted' });
  } catch (error) {
    console.error('[Tokko Account Delete] Error:', error);
    return NextResponse.json(
      {
        error: 'Delete failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
