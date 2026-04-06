import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { supabaseAdmin, getOrCreateUserFromAuth } from "@/lib/supabase/server";
import { sanitizeRedirect } from "@/lib/utils/sanitize-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Parse redirect destination from state (sanitized to prevent open redirects)
  const next = sanitizeRedirect(state ? decodeURIComponent(state) : "/");

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

    // Invalidate all RSC cached pages so they re-render with new auth state
    revalidatePath("/", "layout");

    // Check if this user needs to select an account type.
    // Use getOrCreateUserFromAuth to handle DB trigger race condition
    // for brand-new Google signups (trigger may not have fired yet).
    const authId = data.user?.id;
    if (authId) {
      const publicUserId = await getOrCreateUserFromAuth(authId);
      const { data: publicUser } = await supabaseAdmin
        .from("users")
        .select("account_type")
        .eq("id", publicUserId)
        .maybeSingle();

      if (!publicUser || publicUser.account_type === null) {
        // If redirect destination is /verificate, auto-set as inquilino
        if (next.startsWith("/verificate")) {
          await supabaseAdmin
            .from("users")
            .update({ account_type: 1 })
            .eq("id", publicUserId);
          return NextResponse.redirect(`${origin}${next}`);
        }

        // If redirect destination is /subir-propiedad, auto-set as propietario
        if (next.startsWith("/subir-propiedad")) {
          await supabaseAdmin
            .from("users")
            .update({ account_type: 2 })
            .eq("id", publicUserId);
          return NextResponse.redirect(`${origin}${next}`);
        }

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
