import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const location = searchParams.get("location");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const rooms = searchParams.get("rooms");
  const bathrooms = searchParams.get("bathrooms");
  const parking = searchParams.get("parking");
  const minSurface = searchParams.get("minSurface");
  const maxSurface = searchParams.get("maxSurface");
  const propertyType = searchParams.get("propertyType"); // "inmobiliaria" | "dueno"
  const propertyTypeNames = searchParams.get("propertyTypeNames"); // comma-separated: "Apartment,House"
  const sort = searchParams.get("sort") || "recent";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("properties_read")
    .select("*", { count: "exact" });

  // Apply filters
  if (location) {
    query = query.or(
      `location_name.ilike.%${location}%,address.ilike.%${location}%,state_name.ilike.%${location}%`
    );
  }

  if (minPrice) {
    query = query.gte("valor_total_primary", parseInt(minPrice));
  }

  if (maxPrice) {
    query = query.lte("valor_total_primary", parseInt(maxPrice));
  }

  if (rooms) {
    query = query.gte("room_amount", parseInt(rooms));
  }

  if (bathrooms) {
    query = query.gte("bathroom_amount", parseInt(bathrooms));
  }

  if (parking) {
    query = query.gte("parking_lot_amount", parseInt(parking));
  }

  if (minSurface) {
    query = query.gte("total_surface", parseInt(minSurface));
  }

  if (maxSurface) {
    query = query.lte("total_surface", parseInt(maxSurface));
  }

  if (propertyType === "inmobiliaria") {
    query = query.eq("tokko", true);
  } else if (propertyType === "dueno") {
    query = query.eq("tokko", false);
  }

  if (propertyTypeNames) {
    const names = propertyTypeNames.split(",").map((n) => n.trim()).filter(Boolean);
    if (names.length > 0) {
      query = query.in("property_type_name", names);
    }
  }

  // Apply sort
  switch (sort) {
    case "price-low":
      query = query.order("valor_total_primary", { ascending: true, nullsFirst: false });
      break;
    case "price-high":
      query = query.order("valor_total_primary", { ascending: false, nullsFirst: false });
      break;
    case "recent":
      query = query.order("property_created_at", { ascending: false });
      break;
    default:
      query = query.order("listing_updated_at", { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
  });
}
