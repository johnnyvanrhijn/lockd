import type { Database } from "@/types/database";
import type { InterventionId } from "./copy";

export type StruggleSession = Database["public"]["Tables"]["struggle_sessions"]["Row"];

export type StruggleStep =
  | "entry"
  | "triggers"
  | "need"
  | "urge_before"
  | "identity"
  | "intervention"
  | "timer"
  | "urge_after"
  | "result"
  | "reflection"
  | "summary";

export type StruggleFlowState = {
  sessionId: string | null;
  habitId: string | null;
  goalId: string | null;
  step: StruggleStep;
  triggerStates: string[];
  underlyingNeed: string | null;
  urgeScoreBefore: number | null;
  urgeScoreAfter: number | null;
  selectedIntervention: InterventionId | null;
  interventionCompleted: boolean;
  interventionDurationSeconds: number | null;
  reflectionText: string;
  reflectionTags: string[];
  protectedHabitName: string | null;
  protectedGoalTitle: string | null;
  reflectOnly: boolean;
};

export type StruggleContext = {
  habitId: string | null;
  goalId: string | null;
  protectedHabitName: string | null;
  protectedGoalTitle: string | null;
};
