import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";
import type { Database } from "@/types/database";

/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Reads/writes the auth cookie via Next's cookies() API.
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component (read-only context). Safe to ignore.
        }
      },
    },
  });
}
