import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ error: "ids parameter required" }, { status: 400 });
  }

  const ids = idsParam
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id));

  if (ids.length === 0) {
    return NextResponse.json({ data: {} });
  }

  // Cap at 50 property IDs per request
  const cappedIds = ids.slice(0, 50);

  const { data, error } = await supabaseAdmin
    .from("tokko_property_photo")
    .select("property_id, thumb, order")
    .in("property_id", cappedIds)
    .eq("is_front_cover", false)
    .eq("is_blueprint", false)
    .order("order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by property_id, limit to 4 per property (cover + 4 = 5 total)
  const grouped: Record<string, string[]> = {};
  for (const row of data || []) {
    const key = String(row.property_id);
    if (!grouped[key]) grouped[key] = [];
    if (grouped[key].length < 4) {
      grouped[key].push(row.thumb);
    }
  }

  return NextResponse.json({ data: grouped });
}
