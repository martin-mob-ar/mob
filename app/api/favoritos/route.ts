import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-component';
import { supabaseAdmin } from '@/lib/supabase/server';

async function getPublicUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: publicUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    return publicUser?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const publicUserId = await getPublicUserId();
  if (!publicUserId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('favoritos')
    .select('property_id')
    .eq('user_id', publicUserId);

  if (error) {
    return NextResponse.json({ error: 'Error al obtener favoritos' }, { status: 500 });
  }

  return NextResponse.json({ propertyIds: data.map((f) => f.property_id) });
}

export async function POST(request: Request) {
  const publicUserId = await getPublicUserId();
  if (!publicUserId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const propertyId = Number(body.propertyId);
  if (!propertyId || isNaN(propertyId)) {
    return NextResponse.json({ error: 'propertyId inválido' }, { status: 400 });
  }

  // Check if already favorited
  const { data: existing } = await supabaseAdmin
    .from('favoritos')
    .select('id')
    .eq('user_id', publicUserId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (existing) {
    // Remove favorite
    await supabaseAdmin
      .from('favoritos')
      .delete()
      .eq('user_id', publicUserId)
      .eq('property_id', propertyId);
    return NextResponse.json({ action: 'removed' });
  } else {
    // Add favorite
    await supabaseAdmin
      .from('favoritos')
      .insert({ user_id: publicUserId, property_id: propertyId });
    return NextResponse.json({ action: 'added' });
  }
}
