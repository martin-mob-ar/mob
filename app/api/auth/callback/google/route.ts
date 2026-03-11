import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Parse redirect destination from state
  const next = state ? decodeURIComponent(state) : "/";

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  try {
    // Exchange Google auth code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.id_token) {
      console.error("Google token exchange failed:", tokens);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    // Use the Google ID token to sign in with Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error: signInError } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: tokens.id_token,
      access_token: tokens.access_token,
    });

    if (signInError) {
      console.error("Supabase signInWithIdToken failed:", signInError);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    // Check if this user needs to select an account type
    const authId = data.user?.id;
    if (authId) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { data: publicUser } = await supabaseAdmin
        .from("users")
        .select("account_type")
        .eq("auth_id", authId)
        .maybeSingle();

      if (!publicUser || publicUser.account_type === null) {
        // New user — redirect to account type selection
        const separator = next.includes("?") ? "&" : "?";
        return NextResponse.redirect(
          `${origin}${next}${separator}select_account_type=true`
        );
      }
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }
}
