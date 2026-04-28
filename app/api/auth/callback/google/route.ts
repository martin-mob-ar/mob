import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getOrCreateUserFromAuth } from "@/lib/supabase/server";
import { sanitizeRedirect } from "@/lib/utils/sanitize-redirect";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Parse redirect destination from state (sanitized to prevent open redirects)
  const next = sanitizeRedirect(state ? decodeURIComponent(state) : "/");
  const errorUrl = `${origin}/login?error=auth&redirect=${encodeURIComponent(next)}`;

  if (error) {
    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    return NextResponse.redirect(errorUrl);
  }

  // Accumulate cookies from Supabase sign-in to apply on the final response
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

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
      return NextResponse.redirect(errorUrl);
    }

    // Use the Google ID token to sign in with Supabase.
    // Set cookies on the response object (not via cookies() from next/headers)
    // to ensure they survive the NextResponse.redirect().
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            pendingCookies.push(...cookiesToSet);
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
      return NextResponse.redirect(errorUrl);
    }

    // Invalidate all RSC cached pages so they re-render with new auth state
    revalidatePath("/", "layout");

    // Determine the final redirect URL based on account type
    let redirectUrl = `${origin}${next}`;

    const authId = data.user?.id;
    if (authId) {
      const publicUserId = await getOrCreateUserFromAuth(authId);
      const { data: publicUser } = await supabaseAdmin
        .from("users")
        .select("account_type")
        .eq("id", publicUserId)
        .maybeSingle();

      if (!publicUser || publicUser.account_type === null) {
        if (next.startsWith("/verificate")) {
          await supabaseAdmin
            .from("users")
            .update({ account_type: 1 })
            .eq("id", publicUserId);
        } else if (next.startsWith("/subir-propiedad")) {
          await supabaseAdmin
            .from("users")
            .update({ account_type: 2 })
            .eq("id", publicUserId);
        } else {
          // New user — redirect to account type selection
          const separator = next.includes("?") ? "&" : "?";
          redirectUrl = `${origin}${next}${separator}select_account_type=true`;
        }
      }
    }

    // Build the redirect response and apply all accumulated auth cookies
    const response = NextResponse.redirect(redirectUrl);
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }
    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    // Preserve redirect destination so the user can retry from the right page
    const response = NextResponse.redirect(errorUrl);
    // Still apply any cookies that were set before the error
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }
    return response;
  }
}
