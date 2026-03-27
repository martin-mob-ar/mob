import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.rpc("check_email_exists", {
      email_input: email.trim().toLowerCase(),
    });

    if (error) {
      console.error("[Check Email] RPC error:", error);
      return NextResponse.json(
        { error: "Error al verificar email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    console.error("[Check Email] Unexpected error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
