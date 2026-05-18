import { getSupabaseClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/types/database";
import type { StruggleSession, StruggleStep } from "./types";

export async function startStruggleSession(args: {
  habitId?: string | null;
  goalId?: string | null;
  protectedHabitName?: string | null;
  protectedGoalTitle?: string | null;
}): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("start_struggle_session", {
    p_habit_id: args.habitId ?? null,
    p_goal_id: args.goalId ?? null,
    p_protected_habit_name: args.protectedHabitName ?? null,
    p_protected_goal_title: args.protectedGoalTitle ?? null,
  });
  if (error) throw error;
  if (!data) throw new Error("start_struggle_session returned no id");
  return data as string;
}

export type StepPayload = Partial<{
  trigger_states: string[];
  underlying_need: string;
  urge_score_before: number;
  urge_score_after: number;
  selected_intervention: string;
  intervention_completed: boolean;
  intervention_duration_seconds: number;
  reflection_text: string;
  reflection_tags: string[];
  protected_habit_name: string;
  protected_goal_title: string;
}>;

export async function updateStruggleStep(
  sessionId: string,
  step: StruggleStep,
  payload: StepPayload,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("update_struggle_step", {
    p_session_id: sessionId,
    p_step: step,
    p_payload: payload as unknown as Json,
  });
  if (error) throw error;
}

export async function completeStruggleSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("complete_struggle_session", {
    p_session_id: sessionId,
  });
  if (error) throw error;
}

export async function closeStruggleSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("close_struggle_session", {
    p_session_id: sessionId,
  });
  if (error) throw error;
}

export async function getRecentStruggle(): Promise<StruggleSession | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_recent_struggle");
  if (error) throw error;
  return (data as StruggleSession | null) ?? null;
}

export type StrugglePattern = {
  total: number;
  completed: number;
  passedCount: number;
  avgDrop: number | null;
  topTrigger: string | null;
  topNeed: string | null;
  bestIntervention: string | null;
  bestInterventionDrop: number | null;
  peakHour: number | null;
};

export async function getStrugglePattern(): Promise<StrugglePattern> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_struggle_pattern");
  if (error) throw error;
  const raw = (data as {
    total?: number;
    completed?: number;
    passed_count?: number;
    avg_drop?: number | string | null;
    top_trigger?: string | null;
    top_need?: string | null;
    best_intervention?: string | null;
    best_intervention_drop?: number | string | null;
    peak_hour?: number | null;
  }) ?? {};
  return {
    total: raw.total ?? 0,
    completed: raw.completed ?? 0,
    passedCount: raw.passed_count ?? 0,
    avgDrop: raw.avg_drop !== null && raw.avg_drop !== undefined ? Number(raw.avg_drop) : null,
    topTrigger: raw.top_trigger ?? null,
    topNeed: raw.top_need ?? null,
    bestIntervention: raw.best_intervention ?? null,
    bestInterventionDrop: raw.best_intervention_drop !== null && raw.best_intervention_drop !== undefined
      ? Number(raw.best_intervention_drop)
      : null,
    peakHour: raw.peak_hour ?? null,
  };
}

/**
 * Resolve the best protected target for a struggle session when no specific
 * habit was passed in. Priority:
 *  1) Active goal (title used; goal_id stored)
 *  2) Highest-risk habit (most fails in the last 7 days)
 *  3) Generic fallback
 */
export async function resolveProtectedTarget(): Promise<{
  habitId: string | null;
  goalId: string | null;
  protectedHabitName: string | null;
  protectedGoalTitle: string | null;
  protectedGoalWhy: string | null;
}> {
  const supabase = getSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      habitId: null,
      goalId: null,
      protectedHabitName: null,
      protectedGoalTitle: null,
      protectedGoalWhy: null,
    };
  }

  // 1) Active goal
  const { data: goalRows } = await supabase.rpc("get_active_goal");
  const activeGoal = (goalRows as Database["public"]["Tables"]["goals"]["Row"][])?.[0] ?? null;

  // 2) Highest-risk habit (most recent fails)
  const today = new Date();
  const since = new Date(today.getTime() - 7 * 86400000);
  const sinceStr = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, "0")}-${String(since.getDate()).padStart(2, "0")}`;
  const { data: failRows } = await supabase
    .from("habit_logs")
    .select("habit_id, bad_habits_master!inner(name)")
    .eq("user_id", userData.user.id)
    .eq("status", "fail")
    .gte("log_date", sinceStr);

  type FailRow = { habit_id: string; bad_habits_master?: { name: string } | null };
  const failCounts = new Map<string, { name: string; count: number }>();
  for (const r of (failRows ?? []) as FailRow[]) {
    const existing = failCounts.get(r.habit_id);
    failCounts.set(r.habit_id, {
      name: r.bad_habits_master?.name ?? "",
      count: (existing?.count ?? 0) + 1,
    });
  }
  let topHabitId: string | null = null;
  let topHabitName: string | null = null;
  let topCount = 0;
  for (const [hid, info] of failCounts) {
    if (info.count > topCount) {
      topCount = info.count;
      topHabitId = hid;
      topHabitName = info.name;
    }
  }

  if (activeGoal) {
    return {
      habitId: topHabitId,
      goalId: activeGoal.id,
      protectedHabitName: topHabitName,
      protectedGoalTitle: activeGoal.title,
      protectedGoalWhy: activeGoal.why ?? null,
    };
  }

  if (topHabitId) {
    return {
      habitId: topHabitId,
      goalId: null,
      protectedHabitName: topHabitName,
      protectedGoalTitle: null,
      protectedGoalWhy: null,
    };
  }

  return {
    habitId: null,
    goalId: null,
    protectedHabitName: null,
    protectedGoalTitle: null,
    protectedGoalWhy: null,
  };
}
