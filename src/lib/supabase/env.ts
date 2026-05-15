/**
 * Resolved Supabase project URL and publishable (anon) key.
 *
 * These values are PUBLIC by design — they ship in every browser
 * bundle that talks to Supabase. The anon key is protected by RLS,
 * not by secrecy. We treat them as hardcoded constants so an
 * environment misconfiguration on Vercel can never break the
 * authentication flow at runtime.
 *
 * To override (e.g. for a staging Supabase project), set the
 * corresponding NEXT_PUBLIC_ env var on the build environment.
 */

const DEFAULT_SUPABASE_URL = "https://lbezyjstbgwahpsideoo.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "sb_publishable_Bd5xBvpT1hn5b_k9D1oFUQ_PPz8Nlcf";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
