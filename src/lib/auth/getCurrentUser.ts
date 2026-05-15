import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Returns the currently authenticated Supabase user, or `null` if no
 * session is active.
 *
 * Placeholder helper — once auth UI exists this will be the canonical
 * way for client components to ask "who is signed in right now?". Server
 * Components will eventually need an SSR-aware variant.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    // AuthSessionMissingError is the expected "not signed in" path —
    // treat it as a normal null instead of bubbling an error to callers.
    if (error.name === "AuthSessionMissingError") {
      return null;
    }

    throw error;
  }

  return data.user;
}
