/**
 * Risk engine — combines two signals:
 *
 *   1. Onboarding-seeded triggers (multi-choice answers like "evening",
 *      "stress", "alone"). Used as a cold-start signal for the first 14 days,
 *      and as a tie-breaker after that.
 *   2. Pattern-detection over `habit_logs` failures (timestamps of "Terugval"
 *      taps). Once there are >= 5 recorded failures, the engine prefers the
 *      observed peak window.
 *
 * The output is two consumer-facing values:
 *
 *   - windowLabel: a short string like "22:00–00:00" with a one-line reason.
 *   - scoreNow:   0..100, the chance-of-relapse estimate for *right now*.
 *
 * The scoring is deliberately rule-based and explainable, not ML.
 */

const TRIGGER_HOURS: Record<string, number[]> = {
  morning: [6, 7, 8, 9, 10, 11],
  afternoon: [12, 13, 14, 15, 16],
  evening: [19, 20, 21, 22, 23],
  night: [22, 23, 0, 1, 2, 3],
  alone: [21, 22, 23, 0, 1, 2],
  work: [9, 10, 11, 12, 13, 14, 15, 16, 17],
  stress: [10, 11, 12, 13, 14, 15, 16, 17],
  social: [18, 19, 20, 21, 22],
  relationship: [19, 20, 21, 22, 23],
  family: [17, 18, 19, 20],
  weekend: [],
  boredom: [],
  // "Wanneer stel je het meest uit?" mirrors morning/afternoon/evening labels.
};

export type RecentFail = {
  habitId: string;
  /** YYYY-MM-DD log_date (used for "X% within window" stats). */
  date: string;
  /** Local hour the user tapped Terugval (0-23). Null when unknown. */
  hour: number | null;
};

export type RiskInputs = {
  /** Onboarding multi-choice triggers per habit. */
  triggersByHabit: Record<string, string[]>;
  /** All failure events in the past ~30 days. */
  recentFails: RecentFail[];
  /** Approximate days the user has been tracking. */
  daysOfData: number;
  /** Consistency rolling average for last 7 days (0..100). 0 if no data. */
  recentConsistencyPct: number;
  /** Has at least one active habit. */
  hasActiveHabits: boolean;
  /** Now-time the assessment runs against. */
  now: Date;
};

export type RiskAssessment = {
  /** "22:00–00:00" or null when there's nothing actionable yet. */
  windowLabel: string | null;
  /** One sentence the UI can show next to the % score. */
  reason: string;
  /** 0..100 — chance of a relapse right now. */
  scoreNow: number;
  /** Which data source produced the windowLabel. */
  source: "onboarding" | "pattern" | "mixed" | "none";
  /** Fraction of past fails that fall inside the dominant window (0..1). */
  windowConcentration: number | null;
};

function bucketLabel(start: number, end: number): string {
  const fmt = (h: number) => `${String(((h % 24) + 24) % 24).padStart(2, "0")}:00`;
  return `${fmt(start)}–${fmt(end)}`;
}

/**
 * Group an array of hour numbers (0..23) into contiguous 2-hour buckets and
 * return the bucket(s) with the most occurrences. Handles wrap-around.
 */
function findPeakWindow(hours: number[]): {
  start: number;
  end: number;
  count: number;
} | null {
  if (hours.length === 0) return null;
  const counts = new Array(24).fill(0);
  for (const h of hours) counts[((h % 24) + 24) % 24] += 1;

  let bestStart = 0;
  let bestCount = -1;
  for (let s = 0; s < 24; s++) {
    const c = counts[s] + counts[(s + 1) % 24];
    if (c > bestCount) {
      bestCount = c;
      bestStart = s;
    }
  }
  return { start: bestStart, end: (bestStart + 2) % 24, count: bestCount };
}

function unionTriggerHours(triggersByHabit: Record<string, string[]>): number[] {
  const out: number[] = [];
  for (const triggers of Object.values(triggersByHabit)) {
    for (const t of triggers) {
      const hours = TRIGGER_HOURS[t];
      if (hours) out.push(...hours);
    }
  }
  return out;
}

export function assessRisk(input: RiskInputs): RiskAssessment {
  const {
    triggersByHabit,
    recentFails,
    daysOfData,
    recentConsistencyPct,
    hasActiveHabits,
    now,
  } = input;

  if (!hasActiveHabits) {
    return {
      windowLabel: null,
      reason: "Geen actieve gewoontes om over te waken.",
      scoreNow: 0,
      source: "none",
      windowConcentration: null,
    };
  }

  const currentHour = now.getHours();

  // ---------- 1. Decide the source for the window label ----------
  const usePattern = recentFails.length >= 5 && daysOfData >= 14;

  let windowLabel: string | null = null;
  let source: RiskAssessment["source"] = "none";
  let windowConcentration: number | null = null;
  let windowHours: number[] = [];

  if (usePattern) {
    const failHours = recentFails
      .map((f) => f.hour)
      .filter((h): h is number => h !== null);
    const peak = findPeakWindow(failHours);
    if (peak && peak.count > 0) {
      windowLabel = bucketLabel(peak.start, peak.end);
      source = "pattern";
      windowConcentration =
        failHours.length === 0 ? null : peak.count / failHours.length;
      windowHours = [peak.start, (peak.start + 1) % 24];
    }
  }

  if (!windowLabel) {
    const triggerHours = unionTriggerHours(triggersByHabit);
    const peak = findPeakWindow(triggerHours);
    if (peak && peak.count > 0) {
      windowLabel = bucketLabel(peak.start, peak.end);
      source = source === "pattern" ? "mixed" : "onboarding";
      windowHours = [peak.start, (peak.start + 1) % 24];
    }
  }

  // ---------- 2. Score 0..100 for the current moment ----------
  // baseline: hasActiveHabits gets you 20.
  let score = 20;

  // Inside the identified risk window → +35.
  if (windowHours.includes(currentHour)) {
    score += 35;
  }

  // Recent consistency below 80 → +25, between 80-90 → +10.
  if (recentConsistencyPct > 0) {
    if (recentConsistencyPct < 80) score += 25;
    else if (recentConsistencyPct < 90) score += 10;
  }

  // Anything failed in the last 3 days → +10.
  const today = new Date(now);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  const recentLast3 = recentFails.filter((f) => {
    const [y, m, d] = f.date.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt >= threeDaysAgo;
  });
  if (recentLast3.length > 0) score += 10;

  // Saturday/Sunday — small bump.
  const dow = now.getDay();
  if (dow === 0 || dow === 6) score += 5;

  // Clamp.
  score = Math.max(5, Math.min(95, score));

  // ---------- 3. Reason copy ----------
  let reason = "Hou je standaarden vast.";
  if (windowLabel && windowHours.includes(currentHour)) {
    reason = `Je risico-window is nu: ${windowLabel}.`;
  } else if (windowLabel) {
    reason = `Let op tussen ${windowLabel}.`;
  } else if (recentConsistencyPct > 0 && recentConsistencyPct < 80) {
    reason = "Je consistentie staat onder druk.";
  }

  return {
    windowLabel,
    reason,
    scoreNow: score,
    source,
    windowConcentration,
  };
}

/**
 * Build a "X% van jouw terugvallen gebeurt tussen Y" sentence if we have a
 * pattern-based window. Returns null otherwise.
 */
export function describeWindow(assessment: RiskAssessment): string | null {
  if (
    assessment.source !== "pattern" &&
    assessment.source !== "mixed"
  ) {
    return null;
  }
  if (!assessment.windowLabel || assessment.windowConcentration === null) {
    return null;
  }
  const pct = Math.round(assessment.windowConcentration * 100);
  if (pct < 30) return null;
  return `${pct}% van je terugvallen valt rond ${assessment.windowLabel}.`;
}
