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

    // Authorization: the submitted userId must match the authenticated user's id.
    // Since public.users.id = auth.users.id, authUser.id IS the public user id.
    if (userId.trim() !== authUser.id) {
      return NextResponse.json(
        { error: 'User not found or access denied' },
        { status: 403 }
      );
    }

    // Delete the auth user. The FK public.users.id -> auth.users(id)
    // ON DELETE CASCADE propagates to public.users and, from there,
    // through all user-owned FK tables (properties, favoritos, etc.).
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);

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
