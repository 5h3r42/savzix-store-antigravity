import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";
import { getSupabaseEnv } from "@/lib/supabase/env";

function withCopiedCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}

function buildRedirect(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  nextPath?: string,
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";

  if (nextPath) {
    redirectUrl.searchParams.set("next", nextPath);
  }

  return withCopiedCookies(response, NextResponse.redirect(redirectUrl));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/account") && !user) {
    return buildRedirect(request, response, "/login", pathname);
  }

  if (pathname.startsWith("/admin")) {
    const isAdminLoginPage = pathname === "/admin/login";

    if (!user) {
      if (isAdminLoginPage) {
        return response;
      }

      return buildRedirect(request, response, "/admin/login", pathname);
    }

    const { data: hasAdminAccessValue } = await supabase.rpc("is_admin");
    const hasAdminAccess = Boolean(hasAdminAccessValue);

    if (isAdminLoginPage && hasAdminAccess) {
      return buildRedirect(request, response, "/admin");
    }

    if (!isAdminLoginPage && !hasAdminAccess) {
      return buildRedirect(request, response, "/");
    }
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
