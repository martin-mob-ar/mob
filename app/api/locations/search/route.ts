import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  // Split query into tokens (each must be at least 2 chars)
  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length === 0) {
    return NextResponse.json({ data: [] });
  }

  // Build Supabase OR filter: name matches ANY token
  const orFilter = tokens.map((t) => `name.ilike.%${t}%`).join(',');

  // Query 1: Search locations matching any token
  const { data: locations, error } = await supabaseAdmin
    .from('tokko_location')
    .select('id, name, depth, state_id, parent_location_id')
    .or(orFilter)
    .order('id')
    .limit(limit + 40);

  if (error) {
    console.error('[locations/search]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!locations || locations.length === 0) {
    return NextResponse.json({ data: [] });
  }

  // Collect depth-3 IDs to check which have multiple children (2+)
  const depth3Ids = locations.filter((l) => l.depth === 3).map((l) => l.id);
  let depth3WithMultipleChildren = new Set<number>();

  if (depth3Ids.length > 0) {
    const { data: childRows } = await supabaseAdmin
      .from('tokko_location')
      .select('parent_location_id')
      .in('parent_location_id', depth3Ids)
      .limit(1000);

    if (childRows) {
      // Count children per parent
      const childrenCount = new Map<number, number>();
      for (const row of childRows) {
        const count = childrenCount.get(row.parent_location_id) || 0;
        childrenCount.set(row.parent_location_id, count + 1);
      }
      // Only include parents with 2+ children
      for (const [parentId, count] of childrenCount.entries()) {
        if (count >= 2) {
          depth3WithMultipleChildren.add(parentId);
        }
      }
    }
  }

  // Walk the full parent chain for all locations.
  // Collect all ancestor IDs iteratively until no new parent_location_ids are found.
  const ancestorMap = new Map<number, { name: string; parent_location_id: number | null; state_id: number | null }>();

  // Seed with parent_location_ids from the search results
  let idsToFetch = [...new Set(
    locations.map((l) => l.parent_location_id).filter(Boolean)
  )] as number[];

  while (idsToFetch.length > 0) {
    // Only fetch IDs we haven't fetched yet
    const newIds = idsToFetch.filter((id) => !ancestorMap.has(id));
    if (newIds.length === 0) break;

    const { data: ancestors } = await supabaseAdmin
      .from('tokko_location')
      .select('id, name, parent_location_id, state_id')
      .in('id', newIds);

    if (!ancestors || ancestors.length === 0) break;

    for (const a of ancestors) {
      ancestorMap.set(a.id, { name: a.name, parent_location_id: a.parent_location_id, state_id: a.state_id });
    }

    // Next round: fetch parents of the ancestors we just fetched
    idsToFetch = ancestors
      .map((a) => a.parent_location_id)
      .filter((id): id is number => id != null && !ancestorMap.has(id));
  }

  // Collect unique state_ids (from search results + ancestors) to fetch state + country names
  const allStateIds = new Set<number>();
  for (const l of locations) if (l.state_id) allStateIds.add(l.state_id);
  for (const a of ancestorMap.values()) if (a.state_id) allStateIds.add(a.state_id);

  const stateMap = new Map<number, { name: string; country_name: string | null }>();
  const stateIdArr = [...allStateIds];

  if (stateIdArr.length > 0) {
    const { data: states } = await supabaseAdmin
      .from('tokko_state')
      .select('id, name, country:tokko_country!country_id(name)')
      .in('id', stateIdArr);

    if (states) {
      for (const s of states) {
        const country = s.country as unknown as { name: string } | null;
        stateMap.set(s.id, { name: s.name, country_name: country?.name ?? null });
      }
    }
  }

  // Helper: walk full parent chain for a location, returning names bottom-up
  function getAncestorChain(parentId: number | null, stateId: number | null): string[] {
    const chain: string[] = [];
    let currentId = parentId;
    const seen = new Set<number>(); // guard against cycles

    while (currentId != null) {
      if (seen.has(currentId)) break;
      seen.add(currentId);
      const ancestor = ancestorMap.get(currentId);
      if (!ancestor) break;
      chain.push(ancestor.name);
      currentId = ancestor.parent_location_id;
    }

    // Append state + country (avoid duplicating if state name already in chain)
    const state = stateId ? stateMap.get(stateId) : null;
    if (state?.name && !chain.includes(state.name)) chain.push(state.name);
    if (state?.country_name) chain.push(state.country_name);

    return chain;
  }

  // Normalized tokens for multi-word matching
  const normalizedTokens = tokens.map(normalize);

  // Build results
  const results: {
    id: number;
    name: string;
    depth: number;
    display: string;
  }[] = [];

  for (const l of locations) {
    // Exclude depth-3 locations that have 2+ children
    if (l.depth === 3 && depth3WithMultipleChildren.has(l.id)) continue;

    const chain = getAncestorChain(l.parent_location_id, l.state_id);

    // Build full context for multi-token filtering
    const fullContext = normalize([l.name, ...chain].join(' '));
    if (!normalizedTokens.every((t) => fullContext.includes(t))) continue;

    results.push({
      id: l.id,
      name: l.name,
      depth: l.depth,
      display: chain.join(', '),
    });

    if (results.length >= limit) break;
  }

  return NextResponse.json({ data: results });
}
