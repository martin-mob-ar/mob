import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server-component';

export async function POST(request: NextRequest) {
  try {
    // ── Auth: require authenticated user ──
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists and belongs to the authenticated user
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId.trim())
      .eq('auth_id', authUser.id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'User not found or access denied' },
        { status: 403 }
      );
    }

    // Delete user (CASCADE will remove all related data)
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId.trim())
      .eq('auth_id', authUser.id);

    if (deleteError) {
      console.error('[Tokko Account Delete] Delete failed:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Account and all associated data deleted' });
  } catch (error) {
    console.error('[Tokko Account Delete] Error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
