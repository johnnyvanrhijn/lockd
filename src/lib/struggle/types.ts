import type { Trigger } from "./copy";

export type StruggleStep =
  | "entry"
  | "habit_pick"
  | "trigger"
  | "intensity"
  | "mirror"
  | "action"
  | "timer"
  | "completion"
  | "reflection";

/**
 * In-memory state for an active intervention session. Persisted to Supabase
 * only at start (start_urge_event) and end (complete_urge_event /
 * abandon_urge_event) — the steps in between are local.
 */
export type StruggleSession = {
  step: StruggleStep;
  habitId: string | null;
  trigger: Trigger | null;
  intensity: number | null;
  /** The DB id of the urge_event row, set after Screen 3. */
  eventId: string | null;
  /** When the session opened (used to format duration in completion screen). */
  startedAt: number;
};

/** Minimal data the dashboard hands to the overlay. */
export type StruggleContext = {
  habits: ReadonlyArray<{ habit_id: string; name: string; streak: number }>;
  /** The active "log date" for completion's auto-success, respecting 03:00. */
  logDate: string;
  /** First-name only, for occasional second-person address. */
  displayName: string | null;
  /** Onboarding-derived facts the Reality Mirror can show on first use. */
  onboardingFacts: {
    desiredOutcomes: string[]; // labels
    triggers: string[]; // labels
  };
};

/** Reality Mirror data for the chosen habit. */
export type MirrorData = {
  /** "22:14" formatted; null when no previous event exists. */
  previousUrgeAt: string | null;
  /** Current streak in days for the chosen habit. */
  currentStreak: number;
  /** Best ever streak in days for the chosen habit. */
  bestStreak: number;
  /** True when the user has fewer than 5 lifetime urge_events. */
  isFirstFew: boolean;
  /** Pattern insight ("82% van je struggles ontstaan rond 22:00–00:00"). */
  patternSentence: string | null;
};
