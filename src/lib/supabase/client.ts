import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";
import type { Database } from "@/types/database";

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Singleton browser Supabase client. Uses @supabase/ssr's cookie-based
 * session so the same session is visible to middleware and server components.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  return browserClient;
}

export type { Database };
