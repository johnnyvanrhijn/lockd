import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function requireEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY",
): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `[supabase] Missing required env var "${name}". Add it to .env.local (see .env.local.example).`,
    );
  }
  return value;
}

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Singleton browser Supabase client. Uses @supabase/ssr's cookie-based
 * session so the same session is visible to middleware and server components.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
  return browserClient;
}

export type { Database };
