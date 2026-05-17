/**
 * Goals engine: deterministic helpers for progress, behavior signal, and
 * next-mission recommendation. No external dependencies.
 */

export type BehaviorSignal = "strong" | "neutral" | "risk" | "insufficient_data";

export type GoalSummary = {
  startDate: string;
  durationDays: number;
};

export function computeCurrentDay(
  startDate: string,
  durationDays: number,
  today = new Date(),
): number {
  const start = new Date(startDate);
  const days = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
  return Math.max(1, Math.min(durationDays, days));
}

export function computeTimeProgress(
  startDate: string,
  durationDays: number,
  today = new Date(),
): number {
  const elapsed = computeCurrentDay(startDate, durationDays, today);
  if (durationDays <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((100 * elapsed) / durationDays)));
}

export function computeRemainingDays(
  targetEndDate: string,
  today = new Date(),
): number {
  const end = new Date(targetEndDate);
  const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  return Math.max(0, days);
}

export function isCompletionEligible(
  targetEndDate: string,
  today = new Date(),
): boolean {
  const end = new Date(targetEndDate);
  end.setHours(23, 59, 59, 999);
  return today.getTime() >= end.getTime();
}

/**
 * Behavior signal from sabotage fail counts.
 *   0 fails on linked sabotage → strong
 *   1–2 fails → neutral
 *   3+ fails → risk
 *   no linked sabotage habits → insufficient_data
 */
export function computeBehaviorSignal(args: {
  linkedSabotageCount: number;
  sabotageFailCount: number;
}): BehaviorSignal {
  if (args.linkedSabotageCount === 0) return "insufficient_data";
  if (args.sabotageFailCount === 0) return "strong";
  if (args.sabotageFailCount <= 2) return "neutral";
  return "risk";
}

export type StatusLabel = "op_schema" | "loopt_risico" | "achter_op_schema";

export function deriveStatusLabel(signal: BehaviorSignal): StatusLabel {
  if (signal === "risk") return "achter_op_schema";
  if (signal === "neutral") return "loopt_risico";
  return "op_schema";
}

export const STATUS_LABEL_TEXT: Record<StatusLabel, string> = {
  op_schema: "Op schema",
  loopt_risico: "Loopt risico",
  achter_op_schema: "Achter op schema",
};

export const SIGNAL_LABEL_TEXT: Record<BehaviorSignal, string> = {
  strong: "Sterk",
  neutral: "Neutraal",
  risk: "Risico",
  insufficient_data: "Onvoldoende data",
};

/**
 * Project the projected outcome sentence shown on /goals/[id].
 */
export function projectionSentence(args: {
  signal: BehaviorSignal;
  remainingDays: number;
}): string {
  const { signal, remainingDays } = args;
  if (signal === "risk") {
    return "Je missie loopt risico door meerdere gemiste dagen.";
  }
  if (signal === "neutral") {
    return remainingDays === 0
      ? "Je hebt je missie afgerond. Reflecteer voor de volgende stap."
      : `Nog ${remainingDays} ${remainingDays === 1 ? "dag" : "dagen"} te beschermen.`;
  }
  if (signal === "strong") {
    return remainingDays === 0
      ? "Je bereikte je doel. Goed werk."
      : `Op dit tempo bereik je je doel. Nog ${remainingDays} ${remainingDays === 1 ? "dag" : "dagen"}.`;
  }
  return `Nog ${remainingDays} ${remainingDays === 1 ? "dag" : "dagen"} te beschermen.`;
}

/**
 * Next-mission recommendation based on the most recent goal's final_result.
 */
export type NextMissionHint = {
  copy: string;
  /** Suggested duration in days, optional. */
  suggestedDurationDays?: number;
};

export function nextMissionRecommendation(
  lastResult: "achieved" | "partially_achieved" | "not_achieved" | null,
): NextMissionHint | null {
  if (!lastResult) return null;
  if (lastResult === "achieved") {
    return {
      copy: "Je vorige missie is behaald. Je kunt nu opschalen naar 14 of 30 dagen.",
      suggestedDurationDays: 14,
    };
  }
  if (lastResult === "partially_achieved") {
    return {
      copy: "Probeer een 7-dagen versie. Focus op één concrete gewoonte.",
      suggestedDurationDays: 7,
    };
  }
  return {
    copy: "Maak je volgende missie kleiner. Kies 7 dagen en bescherm één concrete gewoonte.",
    suggestedDurationDays: 7,
  };
}

export function computeTargetEndDate(
  startDate: string,
  durationDays: number,
): string {
  const start = new Date(startDate);
  start.setDate(start.getDate() + (durationDays - 1));
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, "0");
  const d = String(start.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatGoalDate(iso: string): string {
  const dt = new Date(iso);
  return dt.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
  });
}
