import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getRouteAfterLogin } from "@/lib/auth/getRouteAfterLogin";

/**
 * Magic-link callback. Supabase redirects here with `?code=...`; we
 * exchange the code for a session (which sets the auth cookies) and then
 * route the user based on their onboarding state.
 *
 * `?next=` lets us preserve a destination (e.g. /invite/[code]).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", errorDescription);
    return NextResponse.redirect(url);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", error.message);
    return NextResponse.redirect(url);
  }

  // Honor explicit next= redirect (invite acceptance, etc.) ahead of state routing.
  if (next && next.startsWith("/")) {
    return NextResponse.redirect(new URL(next, origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.redirect(new URL(getRouteAfterLogin(profile), origin));
}
