import { getSupabaseClient } from "@/lib/supabase/client";

type SendMagicLinkOptions = {
  /** Path the magic link returns to after exchange (e.g. "/invite/abc"). */
  redirectTo?: string;
};

/**
 * Client-side: requests a magic-link / OTP email via Supabase Auth.
 *
 * The same call sends both a 6-digit code (in the email body) and a
 * one-tap magic link. The /login page lets the user verify by typing the
 * code; clicking the link is the equivalent fallback.
 *
 * Returns `{ ok: true }` on success or `{ ok: false, error }` on a
 * recoverable failure. Wraps the SDK call so a missing env var or
 * thrown construction error surfaces as a user-visible message instead
 * of hanging the UI.
 */
export async function sendMagicLink(
  email: string,
  options: SendMagicLinkOptions = {},
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseClient();
    const next = options.redirectTo ?? "";
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (next) callbackUrl.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
        shouldCreateUser: true,
      },
    });

    if (error) {
      return { ok: false, error: humanize(error.message) };
    }
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Onbekende fout. Probeer opnieuw.";
    return { ok: false, error: humanize(message) };
  }
}

/**
 * Client-side: verifies a 6-digit OTP code emailed to the user. On
 * success the Supabase session cookies are set and we resolve `ok: true`.
 */
export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) {
      return { ok: false, error: humanize(error.message) };
    }
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Onbekende fout. Probeer opnieuw.";
    return { ok: false, error: humanize(message) };
  }
}

function humanize(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("expired"))
    return "Deze code klopt niet meer. Vraag een nieuwe aan.";
  if (lower.includes("rate") && lower.includes("limit"))
    return "Te veel pogingen. Wacht een minuut en probeer opnieuw.";
  if (lower.includes("invalid email"))
    return "Dit lijkt geen geldig emailadres.";
  if (lower.includes("token has expired"))
    return "Deze code is verlopen. Vraag een nieuwe aan.";
  if (lower.includes("invalid token") || lower.includes("token is invalid"))
    return "Deze code is niet juist. Check je inbox of vraag een nieuwe.";
  if (lower.includes("missing required env var"))
    return "Configuratie ontbreekt. Neem contact op.";
  return message;
}
