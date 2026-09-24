import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getSafeRedirect(nextPath: string | null, fallback: string) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return fallback;
  }

  return nextPath;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeRedirect(requestUrl.searchParams.get("next"), "/account");
  const redirectUrl = new URL(nextPath, requestUrl.origin);
  const loginRedirectUrl = new URL("/login", requestUrl.origin);
  loginRedirectUrl.searchParams.set("next", nextPath);

  if (!code) {
    loginRedirectUrl.searchParams.set("error", "link-expired");
    return NextResponse.redirect(loginRedirectUrl);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    loginRedirectUrl.searchParams.set("error", "link-expired");
    return NextResponse.redirect(loginRedirectUrl);
  }

  return NextResponse.redirect(redirectUrl);
}
