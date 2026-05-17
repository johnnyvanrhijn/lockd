import { getSupabaseClient } from "@/lib/supabase/client";

export type PingType = "hou_scherp" | "goed_bezig";

export type CircleSignal = {
  buddyId: string;
  displayName: string;
  streakDays: number;
  hasRecentStruggle: boolean;
  unreadPingsCount: number;
  houScherpCooldown: boolean;
  goedBezigCooldown: boolean;
};

export async function getCircleSignals(): Promise<CircleSignal[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_circle_signals");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    buddyId: r.buddy_id,
    displayName: r.display_name ?? "Buddy",
    streakDays: r.streak_days ?? 0,
    hasRecentStruggle: r.has_recent_struggle ?? false,
    unreadPingsCount: r.unread_pings_count ?? 0,
    houScherpCooldown: r.hou_scherp_cooldown ?? false,
    goedBezigCooldown: r.goed_bezig_cooldown ?? false,
  }));
}

export async function sendBuddyPing(
  receiverId: string,
  type: PingType,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("send_buddy_ping", {
    p_receiver_id: receiverId,
    p_ping_type: type,
  });
  if (error) throw error;
}

export async function ensureInviteCode(): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("ensure_my_invite_code");
  if (error) throw error;
  return data ?? null;
}
