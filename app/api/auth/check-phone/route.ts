import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const phones = request.nextUrl.searchParams.get("phones");
    const countryCode = request.nextUrl.searchParams.get("country_code") || "+54";

    if (!phones) {
      return NextResponse.json({ error: "phones parameter required" }, { status: 400 });
    }

    const phoneList = phones.split(",").filter(Boolean);

    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .in("telefono", phoneList)
      .eq("telefono_country_code", countryCode)
      .limit(1);

    return NextResponse.json({ exists: !!(existing && existing.length > 0) });
  } catch (error) {
    console.error("[Check Phone] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
