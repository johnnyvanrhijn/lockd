import { getSupabaseClient } from "@/lib/supabase/client";

type SendMagicLinkOptions = {
  /** Path the magic link returns to after exchange (e.g. "/invite/abc"). */
  redirectTo?: string;
};

/**
 * Client-side: sends a magic-link email via Supabase Auth.
 *
 * Returns `{ ok: true }` on success or `{ ok: false, error }` on a
 * recoverable failure (invalid email, rate limit, etc.). Throws only on
 * unexpected configuration errors.
 */
export async function sendMagicLink(
  email: string,
  options: SendMagicLinkOptions = {},
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseClient();
  const next = options.redirectTo ?? "";
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  if (next) callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
