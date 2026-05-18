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
  loopt_risico: "Vraagt aandacht",
  achter_op_schema: "Herstel-modus",
};

export const SIGNAL_LABEL_TEXT: Record<BehaviorSignal, string> = {
  strong: "Sterk",
  neutral: "Neutraal",
  risk: "Risico",
  insufficient_data: "Onvoldoende data",
};

/**
 * Project the projected outcome sentence shown on /goals/[id].
 * Risk signals are reframed as recovery opportunities, not failure.
 */
export function projectionSentence(args: {
  signal: BehaviorSignal;
  remainingDays: number;
}): string {
  const { signal, remainingDays } = args;
  if (signal === "risk") {
    return remainingDays === 0
      ? "Een paar slips, maar je hebt het volgehouden. Reflecteer voor de volgende stap."
      : `Een paar slips. Je missie loopt nog. Nog ${remainingDays} ${remainingDays === 1 ? "dag" : "dagen"} om te herstellen.`;
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
 * Optionally personalized with a concrete template suggestion when the user's
 * focus_habits or category can be matched to a known template.
 */
export type NextMissionHint = {
  copy: string;
  /** Suggested duration in days, optional. */
  suggestedDurationDays?: number;
  /** Suggested template key from GOAL_TEMPLATES, optional. */
  suggestedTemplateKey?: string;
};

export function nextMissionRecommendation(
  lastResult: "achieved" | "partially_achieved" | "not_achieved" | null,
  args?: {
    /** Previous goal's template key, for "scale up same family" logic. */
    previousTemplateKey?: string | null;
    /** User's onboarding focus_habits — used to pick a personalized template. */
    focusHabits?: ReadonlyArray<string>;
  },
): NextMissionHint | null {
  if (!lastResult) return null;

  if (lastResult === "achieved") {
    // Scale up: if previous template was 7d, suggest the 30d version of same family.
    const scaleUp = scaleUpTemplate(args?.previousTemplateKey ?? null);
    if (scaleUp) {
      return {
        copy: `Je vorige missie is behaald. Probeer ${scaleUp.label}.`,
        suggestedDurationDays: scaleUp.durationDays,
        suggestedTemplateKey: scaleUp.key,
      };
    }
    return {
      copy: "Je vorige missie is behaald. Je kunt nu opschalen naar 14 of 30 dagen.",
      suggestedDurationDays: 14,
    };
  }

  // partially_achieved or not_achieved: scale down to 7d, prefer a personalized template.
  const personal = pickFocusBasedTemplate(args?.focusHabits ?? []);
  if (personal) {
    return {
      copy:
        lastResult === "partially_achieved"
          ? `Houd het klein. Probeer ${personal.label} (7 dagen).`
          : `Kleiner én concreter. Probeer ${personal.label} (7 dagen).`,
      suggestedDurationDays: 7,
      suggestedTemplateKey: personal.key,
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

/** Map a previous template key to its 30-day big sibling (if one exists). */
function scaleUpTemplate(
  prev: string | null,
): { key: string; label: string; durationDays: number } | null {
  if (!prev) return null;
  const SCALE_MAP: Record<string, { key: string; label: string; durationDays: number }> = {
    "7d_niet_roken": { key: "30d_stoppen_roken", label: "30 dagen stoppen met roken", durationDays: 30 },
    "7d_niet_blowen": { key: "30d_niet_blowen", label: "30 dagen niet blowen", durationDays: 30 },
    "4x_trainen_week": { key: "x_keer_trainen_maand", label: "X keer trainen per maand", durationDays: 30 },
    "10000_stappen_dag": { key: "x_keer_trainen_maand", label: "X keer trainen per maand", durationDays: 30 },
  };
  return SCALE_MAP[prev] ?? null;
}

/** Pick a 7d "starter" template that matches one of the user's focus habits. */
function pickFocusBasedTemplate(
  focusHabits: ReadonlyArray<string>,
): { key: string; label: string } | null {
  if (focusHabits.length === 0) return null;
  // Prefer the first focus habit so the recommendation feels primary.
  const FOCUS_MAP: Record<string, { key: string; label: string }> = {
    smoking: { key: "7d_niet_roken", label: "7 dagen niet roken" },
    weed: { key: "7d_niet_blowen", label: "7 dagen niet blowen" },
    porn: { key: "14d_geen_porno", label: "14 dagen geen porno" },
    alcohol: { key: "30d_geen_alcohol", label: "30 dagen geen alcohol" },
    doomscroll: { key: "minder_schermtijd", label: "Minder schermtijd" },
    overspending: { key: "14d_geen_impulsaankopen", label: "14 dagen geen impulsaankopen" },
    social_media: { key: "minder_schermtijd", label: "Minder schermtijd" },
    unnecessary_snacking: { key: "5kg_afvallen", label: "5 kg afvallen" },
    emotional_eating: { key: "5kg_afvallen", label: "5 kg afvallen" },
    stress_eating: { key: "5kg_afvallen", label: "5 kg afvallen" },
    late_sleep: { key: "minder_schermtijd", label: "Minder schermtijd" },
  };
  for (const h of focusHabits) {
    const match = FOCUS_MAP[h];
    if (match) return match;
  }
  return null;
}

/**
 * Pick the best template to PRE-SELECT when the user opens /goals/new.
 * Returns the template key matching the user's primary focus_habit, or null.
 * Used by the smart-defaults wiring.
 */
export function suggestStartingTemplate(
  focusHabits: ReadonlyArray<string>,
): string | null {
  const m = pickFocusBasedTemplate(focusHabits);
  return m?.key ?? null;
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
