/**
 * Static copy + option sets for the struggle flow. Keeping these in one place
 * makes wording iteration straightforward without touching component logic.
 */

export const TRIGGER_OPTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "stress", label: "Stress" },
  { id: "verveling", label: "Verveling" },
  { id: "alleen", label: "Alleen" },
  { id: "overprikkeld", label: "Overprikkeld" },
  { id: "vermoeid", label: "Vermoeid" },
  { id: "frustratie", label: "Frustratie" },
  { id: "onrust", label: "Onrust" },
  { id: "beloning_nodig", label: "Beloning nodig" },
  { id: "automatisch_gedrag", label: "Automatisch gedrag" },
  { id: "anders", label: "Anders" },
];

export const NEED_OPTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "rust", label: "Rust" },
  { id: "afleiding", label: "Afleiding" },
  { id: "dopamine", label: "Dopamine" },
  { id: "controle", label: "Controle" },
  { id: "verbinding", label: "Verbinding" },
  { id: "beloning", label: "Beloning" },
  { id: "energie", label: "Energie" },
  { id: "verdoving", label: "Verdoving" },
];

/**
 * Intervention id. Built-in interventions use known keys; antidote
 * interventions (dynamically derived from the user's bad-habit selection)
 * use the `antidote_<good_habit_id>` convention. Persisted as text in
 * struggle_sessions.selected_intervention.
 */
export type InterventionId = string;

export type Intervention = {
  id: InterventionId;
  title: string;
  description: string;
  /** Timer duration in seconds. 0 = no timer (manual or skip-to-reflection). */
  durationSeconds: number;
  /** Optional accent: 'antidote' renders in success tone. */
  tone?: "default" | "antidote";
};

const ANTIDOTE_PREFIX = "antidote_";

/**
 * Sensible default timer durations (seconds) per good-habit id, used when
 * deriving a synthetic intervention from a catalog antidote. Habits that
 * aren't quick to perform during an urge get 0 (manual / no timer).
 */
const ANTIDOTE_DURATIONS: Record<string, number> = {
  walking: 120,
  running: 0,
  pushups: 60,
  stretching: 120,
  yoga: 0,
  workout: 0,
  meditation: 180,
  journaling: 180,
  reading: 0,
  deep_work: 0,
  phone_free_hour: 0,
  water_intake: 30,
  cold_shower: 60,
  daylight: 0,
  protein_breakfast: 0,
  veggies: 0,
  early_sleep: 0,
  family_call: 0,
  ask_help: 0,
  compliment: 0,
  gratitude: 90,
  plan_day: 0,
  evening_review: 0,
  make_bed: 0,
  no_morning_phone: 0,
  mindful_meal: 0,
};

export const INTERVENTIONS: ReadonlyArray<Intervention> = [
  {
    id: "pauze_90",
    title: "90 sec pauze",
    description: "Adem. Wacht. Laat de piek zakken.",
    durationSeconds: 90,
  },
  {
    id: "wandelen_120",
    title: "2 min wandelen",
    description: "Leg je telefoon weg en beweeg.",
    durationSeconds: 120,
  },
  {
    id: "ademhaling",
    title: "Ademhaling",
    description: "Vier rustige rondes.",
    durationSeconds: 90,
  },
  {
    id: "water",
    title: "Water drinken",
    description: "Onderbreek het automatische patroon.",
    durationSeconds: 60,
  },
  {
    id: "muziek",
    title: "Muziek",
    description: "Verplaats je aandacht.",
    durationSeconds: 90,
  },
  {
    id: "reflectie_kort",
    title: "Kort reflecteren",
    description: "Schrijf één zin op.",
    durationSeconds: 0,
  },
  {
    id: "eigen_keuze",
    title: "Eigen keuze",
    description: "Doe iets anders dat helpt.",
    durationSeconds: 0,
  },
];

export function getIntervention(id: string | null): Intervention | null {
  if (!id) return null;
  const builtin = INTERVENTIONS.find((i) => i.id === id);
  if (builtin) return builtin;
  if (id.startsWith(ANTIDOTE_PREFIX)) {
    return buildAntidoteInterventionById(id);
  }
  return null;
}

/**
 * Construct a synthetic intervention from a good-habit catalog entry. Used
 * to surface antidote suggestions in StepIntervention based on the bad habit
 * that triggered the urge.
 */
export function buildAntidoteIntervention(
  goodHabit: {
    id: string;
    name: string;
    dailyStatement: string;
  },
): Intervention {
  return {
    id: `${ANTIDOTE_PREFIX}${goodHabit.id}`,
    title: goodHabit.name,
    description: goodHabit.dailyStatement,
    durationSeconds: ANTIDOTE_DURATIONS[goodHabit.id] ?? 90,
    tone: "antidote",
  };
}

/**
 * Resolve an `antidote_<id>` intervention by looking up its good-habit entry
 * in the catalog. Imports are deferred to avoid a circular dependency between
 * copy.ts (which has no React deps) and the catalog module.
 */
function buildAntidoteInterventionById(id: string): Intervention | null {
  const goodId = id.slice(ANTIDOTE_PREFIX.length);
  // Lazy require keeps this file free of top-level catalog imports — useful
  // if copy.ts is ever consumed from a non-React context.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const catalog = require("@/lib/badHabits/catalog") as typeof import("@/lib/badHabits/catalog");
  const h = catalog.getGoodHabit(goodId);
  if (!h) return null;
  return buildAntidoteIntervention({
    id: h.id,
    name: h.name,
    dailyStatement: h.dailyStatement,
  });
}

export const REFLECTION_TAGS: ReadonlyArray<string> = [
  "Werkstress",
  "Avondroutine",
  "Alleen thuis",
  "Slecht geslapen",
  "Conflict",
  "Verveling",
  "Social media",
  "Honger",
  "Vermoeid",
];

export type TimerBeat = { atSecond: number; text: string };

export const TIMER_BEATS: ReadonlyArray<TimerBeat> = [
  { atSecond: 0, text: "Adem in." },
  { atSecond: 20, text: "Drang piekt vaak kort." },
  { atSecond: 45, text: "Dit moment bepaalt niets." },
  { atSecond: 70, text: "Je bent groter dan dit moment." },
];

export const WALKING_BEATS: ReadonlyArray<TimerBeat> = [
  { atSecond: 0, text: "Leg je telefoon weg." },
  { atSecond: 30, text: "Beweeg. Voel de grond." },
  { atSecond: 60, text: "Je aandacht verschuift." },
  { atSecond: 100, text: "Bijna terug." },
];

export function beatForElapsed(
  beats: ReadonlyArray<TimerBeat>,
  elapsed: number,
): TimerBeat {
  let active = beats[0];
  for (const b of beats) {
    if (b.atSecond <= elapsed) active = b;
  }
  return active;
}
