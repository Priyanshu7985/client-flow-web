import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Handles the redirect back from Supabase for:
 *  - email confirmation (signup)
 *  - password recovery links
 *  - magic links / OAuth (PKCE `code` exchange)
 *
 * Configure this URL in Supabase → Authentication → URL Configuration →
 * Redirect URLs:  {SITE_URL}/auth/callback
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeNext(url.searchParams.get("next"));

  const redirectTo = new URL(next, url.origin);
  const errorRedirect = new URL("/login", url.origin);

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      errorRedirect.searchParams.set("error", "auth_callback");
      return NextResponse.redirect(errorRedirect);
    }
    return NextResponse.redirect(redirectTo);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "recovery" | "email" | "invite" | "magiclink" | "email_change",
      token_hash: tokenHash,
    });
    if (error) {
      errorRedirect.searchParams.set("error", "auth_callback");
      return NextResponse.redirect(errorRedirect);
    }
    return NextResponse.redirect(redirectTo);
  }

  errorRedirect.searchParams.set("error", "auth_callback");
  return NextResponse.redirect(errorRedirect);
}

/** Only allow same-site relative paths as the post-auth destination. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}
