import { getSupabaseClient } from "@/lib/supabase/client";
import type { MoodId } from "./options";

export async function logMood(moodId: MoodId, logDate: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("log_mood", {
    p_mood: moodId,
    p_log_date: logDate,
  });
  if (error) throw error;
}

export type TodayMood = { mood: MoodId; loggedAt: string } | null;

export async function getTodayMood(logDate: string): Promise<TodayMood> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_today_mood", {
    p_log_date: logDate,
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  return { mood: row.mood as MoodId, loggedAt: row.logged_at };
}

export type MoodPatternRow = {
  logDate: string;
  mood: MoodId;
  count: number;
};

export async function getMoodPattern(days = 30): Promise<MoodPatternRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_mood_pattern", {
    p_days: days,
  });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    logDate: r.log_date,
    mood: r.mood as MoodId,
    count: Number(r.count ?? 0),
  }));
}
