/**
 * Rule-based insights engine. Combines risk windows, mood patterns, mission
 * status and impact aggregates into 1–3 short, identity-framed Insight cards.
 *
 * No ML, no LLM calls. All correlations are deterministic. Future versions
 * can layer on correlation thresholds; for v1 we expose obvious wins.
 */

import type { RiskAssessment } from "@/lib/badHabits/risk";
import type { AggregatedImpact } from "@/lib/badHabits/impact";
import type { MoodId } from "@/lib/mood/options";
import type { MoodPatternRow } from "@/lib/mood/client";
import type { StrugglePattern } from "@/lib/struggle/client";
import { TRIGGER_OPTIONS, NEED_OPTIONS, getIntervention } from "@/lib/struggle/copy";

export type InsightTone = "neutral" | "purple" | "warning" | "success";

export type Insight = {
  id: string;
  tone: InsightTone;
  eyebrow: string;
  title: string;
  body: string;
};

export type InsightsInput = {
  /** Risk engine output. */
  risk: RiskAssessment;
  /** Window-derived sentence if available. */
  riskSentence: string | null;
  /** Aggregated impact across active habits. */
  impact: AggregatedImpact;
  /** Recent 7-day consistency average (0..100). */
  recentConsistencyPct: number;
  /** Mood pattern rows for the last 30 days. */
  moodPattern: MoodPatternRow[];
  /** Recent fails — used for mood × fail correlation. */
  recentFailDates: string[];
  /** Active mission summary, if any. */
  activeMission: {
    title: string;
    currentDay: number;
    durationDays: number;
    statusLabel: "op_schema" | "loopt_risico" | "achter_op_schema" | null;
  } | null;
  /** Active habits count. */
  activeHabitsCount: number;
  /** Aggregated struggle pattern (null when user has 0 sessions). */
  strugglePattern?: StrugglePattern | null;
  /** Most-recent struggle (used when <5 total sessions). */
  recentStruggle?: {
    urgeReduction: number | null;
    topTrigger: string | null;
    selectedIntervention: string | null;
    createdAt: string;
  } | null;
};

const MOOD_LABEL: Record<MoodId, string> = {
  prima: "kalme",
  gestrest: "gestreste",
  moe: "vermoeide",
  geirriteerd: "geïrriteerde",
  somber: "sombere",
};

const STATUS_LABEL: Record<
  NonNullable<InsightsInput["activeMission"]>["statusLabel"] & string,
  { tone: InsightTone; sentence: (mission: { title: string; currentDay: number; durationDays: number }) => string }
> = {
  op_schema: {
    tone: "success",
    sentence: (m) =>
      `Je missie "${m.title}" loopt op schema. Dag ${m.currentDay} van ${m.durationDays}.`,
  },
  loopt_risico: {
    tone: "warning",
    sentence: (m) =>
      `Je missie "${m.title}" loopt risico. Bescherm deze ${m.durationDays - m.currentDay} dagen scherp.`,
  },
  achter_op_schema: {
    tone: "warning",
    sentence: (m) =>
      `Je missie "${m.title}" raakt achter. Een kleinere herstart kan helpen.`,
  },
};

function lookupTriggerLabel(id: string): string {
  return TRIGGER_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

function lookupNeedLabel(id: string): string {
  return NEED_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

function lookupInterventionTitle(id: string): string {
  return getIntervention(id)?.title ?? id;
}

function struggleInsights(input: InsightsInput): Insight[] {
  const out: Insight[] = [];
  const pattern = input.strugglePattern;
  if (!pattern || pattern.total === 0) return out;

  // ≥5 sessions: aggregated insights
  if (pattern.total >= 5) {
    if (pattern.topTrigger) {
      out.push({
        id: "struggle-top-trigger",
        tone: "purple",
        eyebrow: "Patroon",
        title: "Je grootste trigger",
        body: `${lookupTriggerLabel(pattern.topTrigger)} komt het vaakst terug in jouw struggle-momenten.`,
      });
    }
    if (pattern.bestIntervention && pattern.bestInterventionDrop !== null) {
      const pct = Math.round(pattern.bestInterventionDrop);
      out.push({
        id: "struggle-best-intervention",
        tone: "success",
        eyebrow: "Werkt voor jou",
        title: lookupInterventionTitle(pattern.bestIntervention),
        body: `Verlaagt je drang gemiddeld met ${pct}%.`,
      });
    }
    if (pattern.passedCount > 0 && pattern.completed >= 2) {
      out.push({
        id: "struggle-consciousness",
        tone: "success",
        eyebrow: "Bewijs",
        title: "Bewust doorgekomen",
        body: `Je bent ${pattern.passedCount} van de ${pattern.completed} struggles bewust doorgekomen.`,
      });
    }
    if (pattern.peakHour !== null) {
      const range = `${String(pattern.peakHour).padStart(2, "0")}:00`;
      out.push({
        id: "struggle-peak-hour",
        tone: "warning",
        eyebrow: "Tijd",
        title: "Risico-moment",
        body: `Je struggles starten het vaakst rond ${range}.`,
      });
    }
    return out;
  }

  // <5 sessions: build-up message + latest snapshot
  out.push({
    id: "struggle-build-up",
    tone: "neutral",
    eyebrow: "Patroon",
    title: "LOCKD bouwt je patroon op",
    body: `Na ${5 - pattern.total} ${5 - pattern.total === 1 ? "struggle" : "struggles"} zie je hier je sterkste interventie en je grootste trigger.`,
  });
  return out;
}

export function generateInsights(input: InsightsInput): Insight[] {
  const out: Insight[] = [];

  // 1) Mission status — high priority if active
  if (input.activeMission && input.activeMission.statusLabel) {
    const cfg = STATUS_LABEL[input.activeMission.statusLabel];
    if (cfg) {
      out.push({
        id: "mission-status",
        tone: cfg.tone,
        eyebrow: "Missie",
        title:
          input.activeMission.statusLabel === "op_schema"
            ? "Je standaard houdt stand"
            : "Bescherm wat je hebt opgebouwd",
        body: cfg.sentence(input.activeMission),
      });
    }
  }

  // 2) Risk window — when we have data
  if (input.riskSentence) {
    out.push({
      id: "risk-window",
      tone: input.risk.scoreNow >= 50 ? "warning" : "purple",
      eyebrow: "Patroon",
      title: "Je risico-window",
      body: input.riskSentence,
    });
  }

  // 3) Mood × fail correlation
  const moodFailHint = correlateMoodWithFails(
    input.moodPattern,
    input.recentFailDates,
  );
  if (moodFailHint) {
    out.push({
      id: "mood-correlation",
      tone: "purple",
      eyebrow: "Inzicht",
      title: "Wat jouw stemming voorspelt",
      body: moodFailHint,
    });
  }

  // 4) Consistency encouragement (if no mission has eaten the slot yet)
  if (
    out.length < 3 &&
    input.activeHabitsCount > 0 &&
    input.recentConsistencyPct >= 80
  ) {
    out.push({
      id: "consistency-strong",
      tone: "success",
      eyebrow: "Bewijs",
      title: "Je consistentie houdt stand",
      body: `Laatste 7 dagen ${input.recentConsistencyPct}% standaarden gehouden. Dit is wie je aan het worden bent.`,
    });
  }

  // 5) Struggle pattern (top trigger / best intervention / etc.)
  if (out.length < 3) {
    const sIns = struggleInsights(input);
    for (const ins of sIns) {
      if (out.length >= 3) break;
      out.push(ins);
    }
  }

  // 6) Dominant impact tile — only if no other strong card filled the slot
  if (out.length < 3) {
    const top = pickDominantImpact(input.impact);
    if (top) {
      out.push({
        id: `impact-${top.kind}`,
        tone: "neutral",
        eyebrow: "Wat je terugwint",
        title: top.headline,
        body: top.body,
      });
    }
  }

  return out.slice(0, 3);
}

// Re-export label helpers so callers can render struggle pattern data
// (e.g. struggle widget) using the same canonical labels.
export {
  lookupTriggerLabel as triggerLabel,
  lookupNeedLabel as needLabel,
  lookupInterventionTitle as interventionTitle,
};

function correlateMoodWithFails(
  pattern: MoodPatternRow[],
  recentFailDates: string[],
): string | null {
  if (pattern.length === 0 || recentFailDates.length < 3) return null;

  // Count fails per mood across overlapping dates.
  const failSet = new Set(recentFailDates);
  const failsByMood = new Map<MoodId, number>();
  const totalByMood = new Map<MoodId, number>();

  // For each mood row, capture totals + fails on same log_date.
  for (const row of pattern) {
    const isFail = failSet.has(row.logDate);
    totalByMood.set(row.mood, (totalByMood.get(row.mood) ?? 0) + 1);
    if (isFail) {
      failsByMood.set(row.mood, (failsByMood.get(row.mood) ?? 0) + 1);
    }
  }

  // Find the mood with highest fail rate AND >= 3 occurrences.
  let bestMood: MoodId | null = null;
  let bestRate = 0;
  for (const [mood, total] of totalByMood) {
    if (total < 3) continue;
    const fails = failsByMood.get(mood) ?? 0;
    const rate = fails / total;
    if (rate > bestRate) {
      bestRate = rate;
      bestMood = mood;
    }
  }

  if (!bestMood || bestRate < 0.4) return null;
  const pct = Math.round(bestRate * 100);
  return `Terugval valt ${pct}% van de tijd op ${MOOD_LABEL[bestMood]} dagen. Plan iets dat jou daar doorheen helpt.`;
}

function pickDominantImpact(impact: AggregatedImpact): {
  kind: "money" | "hours" | "kcal" | "fat";
  headline: string;
  body: string;
} | null {
  if (impact.money >= 10) {
    return {
      kind: "money",
      headline: `€${Math.round(impact.money)} bespaard`,
      body: "Door keuzes die je vooruit helpen.",
    };
  }
  if (impact.hours >= 1) {
    return {
      kind: "hours",
      headline: `${formatHoursShort(impact.hours)} teruggewonnen`,
      body: "Tijd die niet naar oude patronen ging.",
    };
  }
  if (impact.kcal >= 500) {
    return {
      kind: "kcal",
      headline: `${Math.round(impact.kcal)} kcal vermeden`,
      body: "Door bewuste keuzes.",
    };
  }
  if (impact.fatKg >= 0.3) {
    return {
      kind: "fat",
      headline: `${impact.fatKg.toFixed(1)} kg lichter`,
      body: "Geprojecteerd op basis van je vermeden kcal.",
    };
  }
  return null;
}

function formatHoursShort(h: number): string {
  if (h >= 10) return `${Math.round(h)} uur`;
  return `${h.toFixed(1).replace(/\.0$/, "")} uur`;
}
