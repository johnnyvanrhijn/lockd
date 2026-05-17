import { getSupabaseClient } from "@/lib/supabase/client";
import type { MoodId } from "./options";

export async function logMood(
  moodId: MoodId,
  logDate: string,
  note?: string | null,
): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("log_mood", {
    p_mood: moodId,
    p_log_date: logDate,
    p_note: note ?? null,
  });
  if (error) throw error;
  if (!data) throw new Error("log_mood returned no id");
  return data as string;
}

export async function updateMoodNote(
  id: string,
  note: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("update_mood_note", {
    p_id: id,
    p_note: note,
  });
  if (error) throw error;
}

export type TodayMood = {
  id: string;
  mood: MoodId;
  loggedAt: string;
  note: string | null;
} | null;

export async function getTodayMood(logDate: string): Promise<TodayMood> {
  const supabase = getSupabaseClient();
  // get_today_mood RPC returns only mood + logged_at; fetch the full row
  // directly so we also get id + note for the inline note editor.
  const { data, error } = await supabase
    .from("mood_logs")
    .select("id, mood, logged_at, note")
    .eq("log_date", logDate)
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    mood: data.mood as MoodId,
    loggedAt: data.logged_at,
    note: data.note,
  };
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
