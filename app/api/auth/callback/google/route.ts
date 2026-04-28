import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getOrCreateUserFromAuth } from "@/lib/supabase/server";
import { sanitizeRedirect } from "@/lib/utils/sanitize-redirect";

function errorRedirect(origin: string, next: string, reason: string) {
  // Redirect directly to the original destination with an auth_error flag
  // instead of bouncing through /login (which loses wizard state).
  const separator = next.includes("?") ? "&" : "?";
  return NextResponse.redirect(
    `${origin}${next}${separator}auth_error=${encodeURIComponent(reason)}`
  );
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Parse redirect destination from state (sanitized to prevent open redirects)
  const next = sanitizeRedirect(state ? decodeURIComponent(state) : "/");

  if (error) {
    return errorRedirect(origin, next, `google_denied:${error}`);
  }

  if (!code) {
    return errorRedirect(origin, next, "no_code");
  }

  // Accumulate cookies from Supabase sign-in to apply on the final response
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  // Fall back to NEXT_PUBLIC_ variant (always available server-side) in case
  // the server-only GOOGLE_CLIENT_ID was not configured in this environment.
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return errorRedirect(origin, next, `missing_env:client_id=${!!clientId},secret=${!!clientSecret}`);
  }

  try {
    // Exchange Google auth code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.id_token) {
      return errorRedirect(origin, next, `token_exchange:${tokens.error || "no_id_token"}`);
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
      return errorRedirect(origin, next, `supabase_signin:${signInError.message}`);
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
    const msg = err instanceof Error ? err.message : String(err);
    return errorRedirect(origin, next, `catch:${msg}`);
  }
}
