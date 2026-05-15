/**
 * Code-side mirror of `public.habit_questions_master`.
 *
 * The DB is the source of truth for the foreign-key constraint that backs
 * `user_habit_answers`, but the UI shouldn't have to round-trip Supabase
 * before rendering an onboarding screen. This file mirrors the seed.
 *
 * Keep in sync: any change to seeded questions must be reflected here, and
 * vice versa.
 */

export type SingleOption = { key: string; label: string; value: number };
export type MultiOption = { key: string; label: string };

export type Question =
  | {
      id: string;
      habitId: string;
      sortOrder: number;
      question: string;
      type: "single";
      options: SingleOption[];
      defaultAnswer: string; // option key
      metricKey: string;
      unit?: string;
    }
  | {
      id: string;
      habitId: string;
      sortOrder: number;
      question: string;
      type: "multi";
      options: MultiOption[];
      defaultAnswer: string[]; // option keys
      metricKey: string;
      unit?: string;
    }
  | {
      id: string;
      habitId: string;
      sortOrder: number;
      question: string;
      type: "slider";
      slider: { min: number; max: number; step: number; suffix?: string };
      defaultAnswer: number;
      metricKey: string;
      unit?: string;
    };

export type AnswerValue = string | string[] | number;
export type AnswersByQuestion = Record<string, AnswerValue>;

const Q: Question[] = [
  // ROKEN
  {
    id: "smoking_per_day",
    habitId: "smoking",
    sortOrder: 1,
    question: "Hoeveel sigaretten rook je gemiddeld per dag?",
    type: "single",
    options: [
      { key: "low", label: "1–5", value: 3 },
      { key: "mid", label: "5–10", value: 7 },
      { key: "high", label: "10–20", value: 15 },
      { key: "very_high", label: "20+", value: 25 },
    ],
    defaultAnswer: "high",
    metricKey: "cigarettes_per_day",
    unit: "x",
  },
  {
    id: "smoking_pack_price",
    habitId: "smoking",
    sortOrder: 2,
    question: "Wat kost een pakje gemiddeld?",
    type: "single",
    options: [
      { key: "low", label: "< €10", value: 9 },
      { key: "mid", label: "€10–15", value: 12 },
      { key: "high", label: "€15+", value: 16 },
    ],
    defaultAnswer: "mid",
    metricKey: "pack_price",
    unit: "€",
  },
  {
    id: "smoking_years",
    habitId: "smoking",
    sortOrder: 3,
    question: "Hoe lang rook je al?",
    type: "single",
    options: [
      { key: "new", label: "< 1 jaar", value: 0.5 },
      { key: "mid", label: "1–5 jaar", value: 3 },
      { key: "long", label: "5+ jaar", value: 8 },
    ],
    defaultAnswer: "mid",
    metricKey: "years_smoking",
    unit: "jaar",
  },

  // PORNO
  {
    id: "porn_freq",
    habitId: "porn",
    sortOrder: 1,
    question: "Hoe vaak?",
    type: "single",
    options: [
      { key: "daily", label: "Dagelijks", value: 7 },
      { key: "few_week", label: "Paar keer per week", value: 3 },
      { key: "weekly", label: "Wekelijks", value: 1 },
    ],
    defaultAnswer: "few_week",
    metricKey: "frequency_per_week",
    unit: "x",
  },
  {
    id: "porn_triggers",
    habitId: "porn",
    sortOrder: 2,
    question: "Wanneer meestal?",
    type: "multi",
    options: [
      { key: "evening", label: "Avond" },
      { key: "stress", label: "Stress" },
      { key: "alone", label: "Alleen thuis" },
      { key: "boredom", label: "Verveling" },
    ],
    defaultAnswer: ["evening", "alone"],
    metricKey: "triggers",
  },

  // UITSTELLEN
  {
    id: "procr_when",
    habitId: "procrastination",
    sortOrder: 1,
    question: "Wanneer stel je het meest uit?",
    type: "multi",
    options: [
      { key: "morning", label: "Ochtend" },
      { key: "afternoon", label: "Middag" },
      { key: "evening", label: "Avond" },
      { key: "weekend", label: "Weekend" },
    ],
    defaultAnswer: ["afternoon", "evening"],
    metricKey: "time_window",
  },

  // ALCOHOL
  {
    id: "alcohol_per_week",
    habitId: "alcohol",
    sortOrder: 1,
    question: "Hoeveel glazen per week gemiddeld?",
    type: "single",
    options: [
      { key: "low", label: "0–3", value: 2 },
      { key: "mid", label: "4–7", value: 6 },
      { key: "high", label: "8–14", value: 11 },
      { key: "very_high", label: "15+", value: 20 },
    ],
    defaultAnswer: "mid",
    metricKey: "drinks_per_week",
    unit: "x",
  },
  {
    id: "alcohol_monthly_spend",
    habitId: "alcohol",
    sortOrder: 2,
    question: "Wat geef je gemiddeld uit per maand?",
    type: "slider",
    slider: { min: 0, max: 200, step: 5, suffix: "€" },
    defaultAnswer: 60,
    metricKey: "monthly_spend",
    unit: "€",
  },

  // SUIKER
  {
    id: "sugar_snacks",
    habitId: "sugar",
    sortOrder: 1,
    question: "Hoeveel snacks of zoete dranken per dag gemiddeld?",
    type: "single",
    options: [
      { key: "one", label: "1", value: 1 },
      { key: "two", label: "2", value: 2 },
      { key: "three", label: "3", value: 3 },
      { key: "four_plus", label: "4+", value: 4 },
    ],
    defaultAnswer: "two",
    metricKey: "sweet_per_day",
    unit: "x",
  },

  // WIET
  {
    id: "weed_freq",
    habitId: "weed",
    sortOrder: 1,
    question: "Hoe vaak gebruik je?",
    type: "single",
    options: [
      { key: "daily", label: "Dagelijks", value: 7 },
      { key: "weekly", label: "Wekelijks", value: 2 },
      { key: "sometimes", label: "Soms", value: 0.5 },
    ],
    defaultAnswer: "weekly",
    metricKey: "uses_per_week",
    unit: "x",
  },
  {
    id: "weed_monthly_spend",
    habitId: "weed",
    sortOrder: 2,
    question: "Hoeveel geef je gemiddeld uit per maand?",
    type: "slider",
    slider: { min: 0, max: 300, step: 10, suffix: "€" },
    defaultAnswer: 100,
    metricKey: "monthly_spend",
    unit: "€",
  },

  // SOCIAL MEDIA
  {
    id: "sm_hours",
    habitId: "social_media",
    sortOrder: 1,
    question: "Hoeveel uur per dag?",
    type: "slider",
    slider: { min: 0, max: 8, step: 0.5, suffix: " uur" },
    defaultAnswer: 3,
    metricKey: "hours_per_day",
    unit: "uur",
  },

  // EMOTIE ETEN
  {
    id: "ee_when",
    habitId: "emotional_eating",
    sortOrder: 1,
    question: "Wanneer meestal?",
    type: "multi",
    options: [
      { key: "stress", label: "Stress" },
      { key: "boredom", label: "Verveling" },
      { key: "evening", label: "Avond" },
      { key: "work", label: "Werk" },
    ],
    defaultAnswer: ["stress", "evening"],
    metricKey: "triggers",
  },

  // FASTFOOD
  {
    id: "ff_per_week",
    habitId: "fastfood",
    sortOrder: 1,
    question: "Hoe vaak per week?",
    type: "single",
    options: [
      { key: "low", label: "1–2", value: 1.5 },
      { key: "mid", label: "3–4", value: 3.5 },
      { key: "high", label: "5+", value: 6 },
    ],
    defaultAnswer: "mid",
    metricKey: "meals_per_week",
    unit: "x",
  },
  {
    id: "ff_meal_cost",
    habitId: "fastfood",
    sortOrder: 2,
    question: "Gemiddelde kosten per maaltijd?",
    type: "single",
    options: [
      { key: "low", label: "< €8", value: 7 },
      { key: "mid", label: "€8–15", value: 11 },
      { key: "high", label: "€15+", value: 18 },
    ],
    defaultAnswer: "mid",
    metricKey: "meal_cost",
    unit: "€",
  },

  // GOKKEN
  {
    id: "gam_monthly_spend",
    habitId: "gambling",
    sortOrder: 1,
    question: "Hoeveel geef je gemiddeld per maand uit?",
    type: "slider",
    slider: { min: 0, max: 500, step: 10, suffix: "€" },
    defaultAnswer: 80,
    metricKey: "monthly_spend",
    unit: "€",
  },

  // ENERGIEDRANK
  {
    id: "ed_per_day",
    habitId: "energy_drinks",
    sortOrder: 1,
    question: "Hoeveel per dag?",
    type: "single",
    options: [
      { key: "one", label: "1", value: 1 },
      { key: "two", label: "2", value: 2 },
      { key: "three_plus", label: "3+", value: 3 },
    ],
    defaultAnswer: "two",
    metricKey: "cans_per_day",
    unit: "x",
  },
  {
    id: "ed_can_price",
    habitId: "energy_drinks",
    sortOrder: 2,
    question: "Prijs per blik?",
    type: "single",
    options: [
      { key: "low", label: "< €2", value: 1.8 },
      { key: "mid", label: "€2–3", value: 2.5 },
      { key: "high", label: "€3+", value: 3.5 },
    ],
    defaultAnswer: "mid",
    metricKey: "can_price",
    unit: "€",
  },

  // IMPULSAANKOPEN
  {
    id: "os_monthly_spend",
    habitId: "overspending",
    sortOrder: 1,
    question: "Hoeveel geef je impulsief uit per maand?",
    type: "slider",
    slider: { min: 0, max: 500, step: 10, suffix: "€" },
    defaultAnswer: 100,
    metricKey: "monthly_spend",
    unit: "€",
  },

  // DOOMSCROLLEN
  {
    id: "ds_hours",
    habitId: "doomscroll",
    sortOrder: 1,
    question: "Hoeveel uur per dag?",
    type: "slider",
    slider: { min: 0, max: 8, step: 0.5, suffix: " uur" },
    defaultAnswer: 2,
    metricKey: "hours_per_day",
    unit: "uur",
  },

  // LAAT SLAPEN
  {
    id: "ls_bedtime",
    habitId: "late_sleep",
    sortOrder: 1,
    question: "Hoe laat ga je meestal naar bed?",
    type: "single",
    options: [
      { key: "22", label: "22:00", value: 22 },
      { key: "23", label: "23:00", value: 23 },
      { key: "00", label: "00:00", value: 24 },
      { key: "01", label: "01:00", value: 25 },
      { key: "02", label: "02:00+", value: 26 },
    ],
    defaultAnswer: "00",
    metricKey: "bedtime_hour",
    unit: "uur",
  },
  {
    id: "ls_target",
    habitId: "late_sleep",
    sortOrder: 2,
    question: "Doel bedtijd?",
    type: "single",
    options: [
      { key: "21", label: "21:00", value: 21 },
      { key: "22", label: "22:00", value: 22 },
      { key: "23", label: "23:00", value: 23 },
      { key: "00", label: "00:00", value: 24 },
    ],
    defaultAnswer: "23",
    metricKey: "target_bedtime",
    unit: "uur",
  },

  // NEGATIEF DENKEN
  {
    id: "nt_when",
    habitId: "negative_thinking",
    sortOrder: 1,
    question: "Wanneer komt het op?",
    type: "multi",
    options: [
      { key: "morning", label: "Ochtend" },
      { key: "work", label: "Werk" },
      { key: "alone", label: "Alleen" },
      { key: "evening", label: "Avond" },
    ],
    defaultAnswer: ["work", "evening"],
    metricKey: "triggers",
  },

  // SERIES BINGEN
  {
    id: "bw_hours",
    habitId: "binge_watching",
    sortOrder: 1,
    question: "Hoeveel uur per dag?",
    type: "slider",
    slider: { min: 0, max: 6, step: 0.5, suffix: " uur" },
    defaultAnswer: 2,
    metricKey: "hours_per_day",
    unit: "uur",
  },

  // CAFEÏNE
  {
    id: "caf_cups",
    habitId: "caffeine",
    sortOrder: 1,
    question: "Hoeveel kopjes per dag?",
    type: "slider",
    slider: { min: 0, max: 10, step: 1, suffix: " kopjes" },
    defaultAnswer: 4,
    metricKey: "cups_per_day",
    unit: "x",
  },

  // LIEGEN
  {
    id: "lying_when",
    habitId: "lying",
    sortOrder: 1,
    question: "Wanneer meestal?",
    type: "multi",
    options: [
      { key: "stress", label: "Stress" },
      { key: "work", label: "Werk" },
      { key: "social", label: "Sociaal" },
      { key: "relationship", label: "Relatie" },
    ],
    defaultAnswer: ["work"],
    metricKey: "triggers",
  },

  // RODDELEN
  {
    id: "gossip_when",
    habitId: "gossip",
    sortOrder: 1,
    question: "Wanneer meestal?",
    type: "multi",
    options: [
      { key: "work", label: "Werk" },
      { key: "social", label: "Sociaal" },
      { key: "family", label: "Familie" },
    ],
    defaultAnswer: ["work"],
    metricKey: "triggers",
  },

  // SNOOZEN
  {
    id: "snooze_count",
    habitId: "snoozing",
    sortOrder: 1,
    question: "Hoe vaak per ochtend?",
    type: "single",
    options: [
      { key: "one", label: "1x", value: 1 },
      { key: "two", label: "2x", value: 2 },
      { key: "three_plus", label: "3x+", value: 3 },
    ],
    defaultAnswer: "two",
    metricKey: "snoozes",
    unit: "x",
  },

  // WERK VERMIJDEN
  {
    id: "wa_hours",
    habitId: "work_avoidance",
    sortOrder: 1,
    question: "Uren per dag?",
    type: "slider",
    slider: { min: 0, max: 4, step: 0.5, suffix: " uur" },
    defaultAnswer: 1,
    metricKey: "hours_per_day",
    unit: "uur",
  },

  // STRESS ETEN
  {
    id: "se_when",
    habitId: "stress_eating",
    sortOrder: 1,
    question: "Wanneer?",
    type: "multi",
    options: [
      { key: "work", label: "Werk" },
      { key: "evening", label: "Avond" },
      { key: "social", label: "Sociaal" },
    ],
    defaultAnswer: ["work", "evening"],
    metricKey: "triggers",
  },

  // ONNODIG SNACKEN
  {
    id: "us_snacks",
    habitId: "unnecessary_snacking",
    sortOrder: 1,
    question: "Hoeveel snacks per dag?",
    type: "single",
    options: [
      { key: "one", label: "1", value: 1 },
      { key: "two", label: "2", value: 2 },
      { key: "three", label: "3", value: 3 },
      { key: "four_plus", label: "4+", value: 4 },
    ],
    defaultAnswer: "two",
    metricKey: "snacks_per_day",
    unit: "x",
  },

  // GEEN BEWEGING
  {
    id: "ne_active_days",
    habitId: "no_exercise",
    sortOrder: 1,
    question: "Actieve dagen per week?",
    type: "single",
    options: [
      { key: "zero", label: "0", value: 0 },
      { key: "low", label: "1–2", value: 1.5 },
      { key: "mid", label: "3–4", value: 3.5 },
      { key: "high", label: "5+", value: 5 },
    ],
    defaultAnswer: "low",
    metricKey: "active_days",
    unit: "x",
  },

  // SLECHTE GRENZEN
  {
    id: "pb_when",
    habitId: "poor_boundaries",
    sortOrder: 1,
    question: "Wanneer?",
    type: "multi",
    options: [
      { key: "work", label: "Werk" },
      { key: "family", label: "Familie" },
      { key: "social", label: "Sociaal" },
      { key: "relationship", label: "Relatie" },
    ],
    defaultAnswer: ["work"],
    metricKey: "triggers",
  },

  // ONNODIG UITGEVEN
  {
    id: "uspend_monthly",
    habitId: "unnecessary_spending",
    sortOrder: 1,
    question: "Hoeveel per maand?",
    type: "slider",
    slider: { min: 0, max: 500, step: 10, suffix: "€" },
    defaultAnswer: 80,
    metricKey: "monthly_spend",
    unit: "€",
  },
];

export const HABIT_QUESTIONS: ReadonlyArray<Question> = Q;

export function getQuestionsForHabit(habitId: string): Question[] {
  return HABIT_QUESTIONS.filter((q) => q.habitId === habitId).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getQuestionById(id: string): Question | undefined {
  return HABIT_QUESTIONS.find((q) => q.id === id);
}

/** Build a Record of question_id → default answer for a habit. */
export function buildDefaultAnswers(habitId: string): AnswersByQuestion {
  const out: AnswersByQuestion = {};
  for (const q of getQuestionsForHabit(habitId)) {
    out[q.id] = q.defaultAnswer;
  }
  return out;
}

/**
 * For a single-choice question, look up the numeric value for the chosen key.
 * Returns undefined when the question type isn't single or the key is unknown.
 */
export function resolveSingleValue(
  question: Question,
  answer: AnswerValue,
): number | undefined {
  if (question.type !== "single") return undefined;
  if (typeof answer !== "string") return undefined;
  const opt = question.options.find((o) => o.key === answer);
  return opt?.value;
}
