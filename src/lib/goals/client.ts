import { getSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { SuggestedHabit } from "./templates";

export type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
export type GoalHabitRow = Database["public"]["Tables"]["goal_habits"]["Row"];

export type CreateGoalInput = {
  title: string;
  category: string | null;
  why: string;
  durationDays: number;
  startDate?: string;
  goalTemplateKey?: string | null;
  customGoal?: boolean;
  supporting: SuggestedHabit[];
  sabotage: SuggestedHabit[];
};

export async function createGoal(input: CreateGoalInput): Promise<string> {
  const supabase = getSupabaseClient();
  const payload = {
    title: input.title,
    category: input.category,
    why: input.why,
    duration_days: input.durationDays,
    start_date: input.startDate,
    goal_template_key: input.goalTemplateKey ?? null,
    custom_goal: input.customGoal ?? false,
    supporting: input.supporting.map((h) => ({
      habit_id: h.habitId ?? "",
      habit_name: h.name,
    })),
    sabotage: input.sabotage.map((h) => ({
      habit_id: h.habitId ?? "",
      habit_name: h.name,
    })),
  };
  const { data, error } = await supabase.rpc("create_goal", {
    p_payload: payload,
  });
  if (error) throw error;
  if (!data) throw new Error("create_goal returned no id");
  return data;
}

export async function getActiveGoal(): Promise<GoalRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_active_goal");
  if (error) throw error;
  return (data as GoalRow[])?.[0] ?? null;
}

export type GoalDetail = {
  goal: GoalRow;
  habits: Array<{
    id: string;
    habit_id: string | null;
    habit_name: string;
    relation_type: "support" | "sabotage";
    is_selected: boolean;
  }>;
  sabotageFailCounts: Record<string, number>;
};

export async function getGoalDetail(goalId: string): Promise<GoalDetail> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_goal_detail", {
    p_goal_id: goalId,
  });
  if (error) throw error;
  const parsed = data as unknown as {
    goal: GoalRow;
    habits: Array<{
      id: string;
      habit_id: string | null;
      habit_name: string;
      relation_type: "support" | "sabotage";
      is_selected: boolean;
    }>;
    sabotage_fail_counts: Record<string, number>;
  };
  return {
    goal: parsed.goal,
    habits: parsed.habits ?? [],
    sabotageFailCounts: parsed.sabotage_fail_counts ?? {},
  };
}

export async function upsertGoalSnapshot(goalId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("upsert_goal_snapshot", {
    p_goal_id: goalId,
  });
  if (error) throw error;
}

export type ReflectionPayload = {
  result: "achieved" | "not_achieved" | "partially_achieved";
  what_helped?: string[];
  what_made_it_hard?: string[];
  feeling?: string;
  reflection_text?: string;
  next_recommendation?: string;
};

export async function completeGoal(
  goalId: string,
  reflection: ReflectionPayload,
  status: "completed" | "failed" | "partial" = "completed",
): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("complete_goal", {
    p_goal_id: goalId,
    p_reflection: reflection,
    p_status: status,
  });
  if (error) throw error;
  return data as string;
}

export async function abandonGoal(
  goalId: string,
  withReflection: boolean,
  reflection?: ReflectionPayload,
): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("abandon_goal", {
    p_goal_id: goalId,
    p_with_reflection: withReflection,
    p_reflection: reflection ?? null,
  });
  if (error) throw error;
  return (data as string | null) ?? null;
}

export async function listGoalsHistory(limit = 20): Promise<GoalRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("list_goals_history", {
    p_limit: limit,
  });
  if (error) throw error;
  return (data as GoalRow[]) ?? [];
}
