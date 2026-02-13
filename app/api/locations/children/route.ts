import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parent_id');

  if (!parentId || isNaN(Number(parentId))) {
    return NextResponse.json(
      { error: 'parent_id is required and must be a number' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('tokko_location')
    .select('id, name')
    .eq('parent_location_id', Number(parentId))
    .order('name');

  if (error) {
    console.error('[locations/children]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch children' },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}
