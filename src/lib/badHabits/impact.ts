/**
 * Impact engine: turns the user's stored answers into per-day "what their
 * standard saves them" numbers, then multiplies by clean-day counts to
 * produce running totals for the dashboard, history, and profile screens.
 *
 * Per product decision (calendar-day minus relapse model):
 *   cleanDays(habit) = max(0, daysSinceAdded - failDaysLogged)
 *
 * Assumptions live inline so a future "stel impact aannames bij" editor can
 * surface them. Whenever a per-habit formula needs a constant (e.g. kcal per
 * snack, 20 cigarettes per pack), it is named and documented next to the
 * formula it feeds.
 */

import {
  type AnswersByQuestion,
  type AnswerValue,
  type Question,
  getQuestionsForHabit,
  resolveSingleValue,
} from "./questions";

export type ImpactKind = "money" | "kcal" | "hours" | "count";

export type ImpactMetric = {
  kind: ImpactKind;
  /** Short user-facing label, e.g. "Bespaard". */
  label: string;
  /** Numeric per-day amount (positive = saved/avoided/regained). */
  perDay: number;
  /** Unit shown next to value, e.g. "€", "uur", "kcal", "x". */
  unit: string;
  /** Optional descriptor for the assumption used, shown in tooltips/profile. */
  assumption?: string;
};

/** Read a flat metric_key → numeric / array / string map from the answers. */
export function answersToMetrics(
  habitId: string,
  answers: AnswersByQuestion,
): Record<string, AnswerValue | number> {
  const out: Record<string, AnswerValue | number> = {};
  const questions = getQuestionsForHabit(habitId);
  for (const q of questions) {
    const a = answers[q.id] ?? q.defaultAnswer;
    if (q.type === "single") {
      const v = resolveSingleValue(q, a);
      out[q.metricKey] = v ?? a;
    } else if (q.type === "slider") {
      out[q.metricKey] = typeof a === "number" ? a : q.defaultAnswer;
    } else {
      out[q.metricKey] = a;
    }
  }
  return out;
}

/** Helper: read a metric as a number, fallback if missing/non-numeric. */
function num(
  m: Record<string, AnswerValue | number>,
  key: string,
  fallback = 0,
): number {
  const v = m[key];
  return typeof v === "number" ? v : fallback;
}

/**
 * Per-habit impact spec. Returns the per-day metrics the habit avoids.
 * Empty array means this habit doesn't quantify into a numeric impact.
 */
export function getHabitImpact(
  habitId: string,
  answers: AnswersByQuestion,
): ImpactMetric[] {
  const m = answersToMetrics(habitId, answers);

  switch (habitId) {
    case "smoking": {
      const cigsPerDay = num(m, "cigarettes_per_day");
      const packPrice = num(m, "pack_price", 12);
      // Assumption: 20 cigarettes per pack.
      const moneyPerDay = (cigsPerDay / 20) * packPrice;
      return [
        {
          kind: "money",
          label: "Bespaard",
          perDay: moneyPerDay,
          unit: "€",
          assumption: `€${packPrice}/pakje · 20 sigaretten per pakje`,
        },
        {
          kind: "count",
          label: "Sigaretten",
          perDay: cigsPerDay,
          unit: "x",
          assumption: `${cigsPerDay}/dag baseline`,
        },
      ];
    }

    case "alcohol": {
      const monthly = num(m, "monthly_spend", 60);
      const drinksWeek = num(m, "drinks_per_week", 6);
      return [
        {
          kind: "money",
          label: "Bespaard",
          perDay: monthly / 30,
          unit: "€",
          assumption: `€${monthly}/maand baseline`,
        },
        {
          kind: "count",
          label: "Glazen",
          perDay: drinksWeek / 7,
          unit: "x",
          assumption: `${drinksWeek}/week baseline`,
        },
      ];
    }

    case "sugar": {
      const perDay = num(m, "sweet_per_day", 2);
      // Assumption: 150 kcal per zoet snack/drank.
      return [
        {
          kind: "kcal",
          label: "Kcal vermeden",
          perDay: perDay * 150,
          unit: "kcal",
          assumption: "150 kcal per snack/drank",
        },
        {
          kind: "count",
          label: "Snacks",
          perDay,
          unit: "x",
        },
      ];
    }

    case "weed": {
      const monthly = num(m, "monthly_spend", 100);
      const usesWeek = num(m, "uses_per_week", 2);
      return [
        {
          kind: "money",
          label: "Bespaard",
          perDay: monthly / 30,
          unit: "€",
          assumption: `€${monthly}/maand baseline`,
        },
        {
          kind: "count",
          label: "Gebruik",
          perDay: usesWeek / 7,
          unit: "x",
        },
      ];
    }

    case "social_media": {
      const hours = num(m, "hours_per_day", 3);
      return [
        {
          kind: "hours",
          label: "Teruggewonnen",
          perDay: hours,
          unit: "uur",
          assumption: `${hours} uur/dag baseline`,
        },
      ];
    }

    case "fastfood": {
      const perWeek = num(m, "meals_per_week", 3.5);
      const cost = num(m, "meal_cost", 11);
      // Assumption: 800 kcal per fastfood meal.
      return [
        {
          kind: "money",
          label: "Bespaard",
          perDay: (perWeek * cost) / 7,
          unit: "€",
          assumption: `€${cost}/maaltijd · ${perWeek}/week`,
        },
        {
          kind: "kcal",
          label: "Kcal vermeden",
          perDay: (perWeek * 800) / 7,
          unit: "kcal",
          assumption: "800 kcal per maaltijd",
        },
      ];
    }

    case "gambling": {
      const monthly = num(m, "monthly_spend", 80);
      return [
        {
          kind: "money",
          label: "Bespaard",
          perDay: monthly / 30,
          unit: "€",
          assumption: `€${monthly}/maand baseline`,
        },
      ];
    }

    case "energy_drinks": {
      const perDay = num(m, "cans_per_day", 2);
      const price = num(m, "can_price", 2.5);
      return [
        {
          kind: "money",
          label: "Bespaard",
          perDay: perDay * price,
          unit: "€",
          assumption: `€${price}/blik · ${perDay}/dag baseline`,
        },
        {
          kind: "count",
          label: "Blikken",
          perDay,
          unit: "x",
        },
      ];
    }

    case "overspending":
    case "unnecessary_spending": {
      const monthly = num(m, "monthly_spend", 100);
      return [
        {
          kind: "money",
          label: "Bespaard",
          perDay: monthly / 30,
          unit: "€",
          assumption: `€${monthly}/maand baseline`,
        },
      ];
    }

    case "doomscroll": {
      const hours = num(m, "hours_per_day", 2);
      return [
        {
          kind: "hours",
          label: "Teruggewonnen",
          perDay: hours,
          unit: "uur",
          assumption: `${hours} uur/dag baseline`,
        },
      ];
    }

    case "binge_watching": {
      const hours = num(m, "hours_per_day", 2);
      return [
        {
          kind: "hours",
          label: "Teruggewonnen",
          perDay: hours,
          unit: "uur",
          assumption: `${hours} uur/dag baseline`,
        },
      ];
    }

    case "late_sleep": {
      const bedtime = num(m, "bedtime_hour", 24);
      const target = num(m, "target_bedtime", 23);
      const gain = Math.max(0, bedtime - target);
      return [
        {
          kind: "hours",
          label: "Extra slaap",
          perDay: gain,
          unit: "uur",
          assumption: `bedtime ${bedtime}:00 → doel ${target}:00`,
        },
      ];
    }

    case "porn": {
      const freqWeek = num(m, "frequency_per_week", 3);
      // Assumption: 30 min per session.
      return [
        {
          kind: "hours",
          label: "Tijd teruggewonnen",
          perDay: (freqWeek * 0.5) / 7,
          unit: "uur",
          assumption: "30 min per sessie",
        },
      ];
    }

    case "caffeine": {
      const cups = num(m, "cups_per_day", 4);
      // Assumption: €1.50 per kopje (café/snackbar gemiddeld).
      return [
        {
          kind: "money",
          label: "Bespaard",
          perDay: cups * 1.5,
          unit: "€",
          assumption: "€1,50 per kopje",
        },
        {
          kind: "count",
          label: "Kopjes",
          perDay: cups,
          unit: "x",
        },
      ];
    }

    case "snoozing": {
      const snoozes = num(m, "snoozes", 2);
      // Assumption: 9 min per snooze.
      return [
        {
          kind: "hours",
          label: "Productieve ochtend",
          perDay: (snoozes * 9) / 60,
          unit: "uur",
          assumption: "9 min per snooze",
        },
      ];
    }

    case "work_avoidance": {
      const hours = num(m, "hours_per_day", 1);
      return [
        {
          kind: "hours",
          label: "Werk gedaan",
          perDay: hours,
          unit: "uur",
        },
      ];
    }

    case "unnecessary_snacking": {
      const perDay = num(m, "snacks_per_day", 2);
      // Assumption: 200 kcal per snack.
      return [
        {
          kind: "kcal",
          label: "Kcal vermeden",
          perDay: perDay * 200,
          unit: "kcal",
          assumption: "200 kcal per snack",
        },
      ];
    }

    case "no_exercise": {
      // This habit's metric is inverse (active_days). We can't quantify a
      // single number out of it, so skip.
      return [];
    }

    // Trigger-only habits (procrastination, lying, gossip, negative_thinking,
    // emotional_eating, stress_eating, poor_boundaries) produce qualitative
    // data only. Return an empty impact spec — risk engine consumes the data
    // instead.
    case "procrastination":
    case "lying":
    case "gossip":
    case "negative_thinking":
    case "emotional_eating":
    case "stress_eating":
    case "poor_boundaries":
      return [];

    default:
      return [];
  }
}

/**
 * Calculate the total impact across all the user's active habits given their
 * per-habit clean-day count. cleanDays = daysSinceAdded - failDaysLogged.
 *
 * Output is aggregated by kind so the dashboard can show one row each for €,
 * kcal, uur, count.
 */
export type ImpactInput = {
  habitId: string;
  answers: AnswersByQuestion;
  cleanDays: number;
};

export type AggregatedImpact = {
  money: number; // €
  kcal: number;
  hours: number;
  /** Per-habit count totals (kind=count) for richer secondary tiles. */
  counts: Array<{
    habitId: string;
    label: string;
    total: number;
    unit: string;
  }>;
};

export function aggregateImpact(inputs: ImpactInput[]): AggregatedImpact {
  let money = 0;
  let kcal = 0;
  let hours = 0;
  const counts: AggregatedImpact["counts"] = [];

  for (const i of inputs) {
    const metrics = getHabitImpact(i.habitId, i.answers);
    for (const m of metrics) {
      const total = m.perDay * Math.max(0, i.cleanDays);
      if (m.kind === "money") money += total;
      else if (m.kind === "kcal") kcal += total;
      else if (m.kind === "hours") hours += total;
      else if (m.kind === "count") {
        counts.push({
          habitId: i.habitId,
          label: m.label,
          total,
          unit: m.unit,
        });
      }
    }
  }

  return { money, kcal, hours, counts };
}

/**
 * Compact per-habit summary used by the profile screen's "assumptions" list.
 * Returns a short human-readable line per metric.
 */
export function describeAssumptions(
  habitId: string,
  answers: AnswersByQuestion,
): string[] {
  return getHabitImpact(habitId, answers)
    .map((m) => m.assumption)
    .filter((x): x is string => Boolean(x));
}

/** Format helpers ----------------------------------------------------------- */

export function formatMoney(amount: number): string {
  if (amount >= 10000) return `€${Math.round(amount / 1000)}k`;
  if (amount >= 1000) return `€${(amount / 1000).toFixed(1)}k`;
  if (amount >= 100) return `€${Math.round(amount)}`;
  return `€${amount.toFixed(2).replace(/\.00$/, "")}`;
}

export function formatHours(h: number): string {
  if (h >= 1000) return `${Math.round(h / 100) / 10}k u`;
  if (h >= 10) return `${Math.round(h)} u`;
  if (h >= 1) {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return mm === 0 ? `${hh}u` : `${hh}u ${mm}m`;
  }
  const minutes = Math.round(h * 60);
  return `${minutes}m`;
}

export function formatKcal(k: number): string {
  if (k >= 100000) return `${Math.round(k / 1000)}k kcal`;
  if (k >= 10000) return `${(k / 1000).toFixed(1)}k kcal`;
  return `${Math.round(k)} kcal`;
}

export function formatCount(n: number, unit = "x"): string {
  const rounded = n >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  return `${rounded}${unit === "x" ? "" : ` ${unit}`}`;
}

/** Convenience: pick the metric `Question` used for impact assumption editing. */
export function getAssumptionQuestions(habitId: string): Question[] {
  // Every question can be edited; just expose them sorted.
  return getQuestionsForHabit(habitId);
}
