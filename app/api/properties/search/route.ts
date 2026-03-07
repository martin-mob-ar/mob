import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const location = searchParams.get("location");
  const locationId = searchParams.get("locationId");
  const stateId = searchParams.get("stateId");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRooms = searchParams.get("minRooms");     // dormitorios → suite_amount
  const maxRooms = searchParams.get("maxRooms");
  const minAmbientes = searchParams.get("minAmbientes"); // ambientes → room_amount
  const maxAmbientes = searchParams.get("maxAmbientes");
  const bathrooms = searchParams.get("bathrooms");
  const parking = searchParams.get("parking");
  const minSurface = searchParams.get("minSurface");
  const maxSurface = searchParams.get("maxSurface");
  const surfaceType = searchParams.get("surfaceType") || "total"; // "total" | "cubierta"
  const propertyType = searchParams.get("propertyType"); // "inmobiliaria" | "dueno"
  const propertyTypeNames = searchParams.get("propertyTypeNames"); // comma-separated: "Apartment,House"
  const tagIds = searchParams.get("tagIds"); // comma-separated tag IDs
  const maxAge = searchParams.get("maxAge"); // max property age (0 = a estrenar)
  const priceType = searchParams.get("priceType") || "total"; // "total" | "alquiler"
  const sort = searchParams.get("sort") || "recent";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("properties_read")
    .select("*", { count: "exact" });

  // Apply location filter - stateId for state-level, locationId for location-level
  if (stateId) {
    // State-level filter: look up state name and match against properties_read.state_name
    const stId = parseInt(stateId);
    const { data: state } = await supabaseAdmin
      .from("tokko_state")
      .select("name")
      .eq("id", stId)
      .single();

    if (state) {
      query = query.eq("state_name", state.name);
    }
  } else if (locationId) {
    const locId = parseInt(locationId);
    // Get the selected location's depth to decide if we need to include children
    const { data: loc } = await supabaseAdmin
      .from("tokko_location")
      .select("id, depth")
      .eq("id", locId)
      .single();

    if (loc && loc.depth <= 3) {
      // For depth 3 (partido/departamento), include the location itself + all direct children
      const { data: children } = await supabaseAdmin
        .from("tokko_location")
        .select("id")
        .eq("parent_location_id", locId);
      const ids = [locId, ...(children?.map((c) => c.id) || [])];
      query = query.in("location_id", ids);
    } else {
      query = query.eq("location_id", locId);
    }
  } else if (location) {
    query = query.or(
      `location_name.ilike.%${location}%,address.ilike.%${location}%,state_name.ilike.%${location}%`
    );
  }

  if (minPrice || maxPrice) {
    if (priceType === "alquiler") {
      // Alquiler: filter on raw `price` column (no expenses) using current exchange rate.
      // The frontend always sends values in ARS, so we derive the USD equivalent at query time
      // to correctly compare against properties stored in either currency.
      const { data: rateRow } = await supabaseAdmin
        .from("exchange_rates")
        .select("rate")
        .eq("currency_pair", "USD_ARS")
        .single();
      const rate = rateRow?.rate ?? 1;

      if (minPrice) {
        const minArs = parseInt(minPrice);
        const minUsd = Math.round(minArs / rate);
        query = query.or(
          `and(currency.eq.ARS,price.gte.${minArs}),and(currency.eq.USD,price.gte.${minUsd})`
        );
      }
      if (maxPrice) {
        const maxArs = parseInt(maxPrice);
        const maxUsd = Math.round(maxArs / rate);
        query = query.or(
          `and(currency.eq.ARS,price.lte.${maxArs}),and(currency.eq.USD,price.lte.${maxUsd})`
        );
      }
    } else {
      // Precio total: valor_total_primary = (price in ARS) + expenses, refreshed on rate updates
      if (minPrice) {
        query = query.gte("valor_total_primary", parseInt(minPrice));
      }
      if (maxPrice) {
        query = query.lte("valor_total_primary", parseInt(maxPrice));
      }
    }
  }

  // Dormitorios (bedrooms) → suite_amount
  if (minRooms) {
    query = query.gte("suite_amount", parseInt(minRooms));
  }
  if (maxRooms) {
    query = query.lte("suite_amount", parseInt(maxRooms));
  }

  // Ambientes (total rooms) → room_amount
  if (minAmbientes) {
    query = query.gte("room_amount", parseInt(minAmbientes));
  }
  if (maxAmbientes) {
    query = query.lte("room_amount", parseInt(maxAmbientes));
  }

  if (bathrooms) {
    query = query.gte("bathroom_amount", parseInt(bathrooms));
  }

  if (parking) {
    query = query.gte("parking_lot_amount", parseInt(parking));
  }

  const surfaceColumn = surfaceType === "cubierta" ? "roofed_surface" : "total_surface";
  if (minSurface) {
    query = query.gte(surfaceColumn, parseInt(minSurface));
  }

  if (maxSurface) {
    query = query.lte(surfaceColumn, parseInt(maxSurface));
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

  // Filter by age (antiguedad)
  if (maxAge !== null) {
    const ageVal = parseInt(maxAge);
    if (!isNaN(ageVal)) {
      query = query.not("age", "is", null).lte("age", ageVal);
    }
  }

  // Filter by tags — property must have ALL selected tags (contains operator)
  if (tagIds) {
    const ids = tagIds.split(",").map((n) => parseInt(n.trim())).filter((n) => !isNaN(n));
    if (ids.length > 0) {
      query = query.contains("all_tag_ids", ids);
    }
  }

  // Filter by availability date
  const availabilityFilter = searchParams.get("availabilityFilter");
  const availabilityDate = searchParams.get("availabilityDate");
  const today = new Date().toISOString().split("T")[0];

  if (availabilityFilter === "immediate") {
    query = query.or(`min_start_date.is.null,min_start_date.lte.${today}`);
  } else if (availabilityFilter === "next-month") {
    // Include properties available within the next 2 months (or null/past)
    const d = new Date();
    const cutoff = new Date(d.getFullYear(), d.getMonth() + 2, 1).toISOString().split("T")[0];
    query = query.or(`min_start_date.is.null,min_start_date.lt.${cutoff}`);
  } else if (availabilityFilter === "custom" && availabilityDate) {
    query = query.or(`min_start_date.is.null,min_start_date.lte.${availabilityDate}`);
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
