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

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(redirectUrl);
}
