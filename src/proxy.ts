import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getRouteAfterLogin } from "@/lib/auth/getRouteAfterLogin";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profiel",
  "/onboarding",
  "/geschiedenis",
  "/inzicht",
  "/reflectie",
  "/goals",
];
const AUTH_PUBLIC_PATHS = ["/", "/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user, supabase } = await updateSession(request);

  // Logged out: redirect protected paths to /login
  if (!user) {
    if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      if (pathname !== "/dashboard") {
        url.searchParams.set("next", pathname + request.nextUrl.search);
      }
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Logged in: redirect away from landing / login to the right destination
  if (AUTH_PUBLIC_PATHS.includes(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("id", user.id)
      .maybeSingle();
    const url = request.nextUrl.clone();
    url.pathname = getRouteAfterLogin(
      profile
        ? {
            id: user.id,
            email: user.email ?? "",
            display_name: null,
            onboarded_at: profile.onboarded_at,
            circle_privacy: {},
            created_at: "",
            updated_at: "",
          }
        : null,
    );
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Logged in but heading to a post-onboarding route without finishing onboarding
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profiel") ||
    pathname.startsWith("/geschiedenis") ||
    pathname.startsWith("/inzicht") ||
    pathname.startsWith("/reflectie") ||
    pathname.startsWith("/goals")
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.onboarded_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Match everything except static assets, image optimizations, the auth
  // callback route (which manages its own redirects), and the public
  // invite acceptance route.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|auth/callback|invite).*)",
  ],
};
