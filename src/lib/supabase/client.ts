import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Reads a required public Supabase env var.
 *
 * NEXT_PUBLIC_* vars are inlined at build time by Next.js, so a missing
 * value here surfaces as a clear startup error instead of an opaque
 * `fetch` failure inside the SDK later.
 */
function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(
      `[supabase] Missing required env var "${name}". ` +
        `Add it to .env.local (see .env.local.example). ` +
        `Never commit real keys — only the public anon key is allowed in client code.`,
    );
  }

  return value;
}

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Returns a singleton Supabase client suitable for use from Client
 * Components and other browser contexts.
 *
 * Uses the public anon key only. The service role key must never be used
 * here — it would be shipped to every browser.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  browserClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

export type { Database };
