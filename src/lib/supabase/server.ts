import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

function requireEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY",
): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`[supabase] Missing required env var "${name}".`);
  }
  return value;
}

/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Reads/writes the auth cookie via Next's cookies() API.
 *
 * Note: in Server Components, cookie writes are no-ops (Next forbids
 * modifying cookies from rendering). The middleware handles session
 * refresh and writes the new cookie there; here we just read.
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
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
    },
  );
}
