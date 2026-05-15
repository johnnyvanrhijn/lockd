import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Given a profile (possibly null right after sign-up before trigger
 * runs), returns the path the user should land on.
 *
 * - No profile yet (race vs. trigger): /onboarding to start fresh.
 * - Profile without onboarded_at: /onboarding to finish setup.
 * - Profile with onboarded_at: /dashboard.
 */
export function getRouteAfterLogin(profile: Profile | null): string {
  if (!profile || !profile.onboarded_at) return "/onboarding";
  return "/dashboard";
}
