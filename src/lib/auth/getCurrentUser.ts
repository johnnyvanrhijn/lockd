import type { User } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type CurrentUser = {
  user: User;
  profile: Profile | null;
};

/**
 * Server-side: returns the currently authenticated user plus their profile
 * row, or `null` if no session is active. Use in Server Components and
 * Route Handlers.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await getServerSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}
