/**
 * Canonical list of habits a user can track.
 *
 * Mirrors `public.bad_habits_master` (the table still bears the legacy name
 * since many FKs point at it; the `type` column discriminates 'bad' vs 'good').
 *
 * The first 16 bad habits remain the 4×4 default onboarding grid; the next
 * 10 ("extras") live behind "Meer eigenschappen". New bad habits added after
 * the catalog v1 (sort_order >= 27) live in the extras bucket too. Good habits
 * (`type: 'good'`) are a separate library — surfaced as antidotes for bad
 * habits and selectable when the rest of the UI is wired up.
 */

export type HabitType = "bad" | "good";

export type MasterHabit = {
  id: string;
  name: string;
  type: HabitType;
  isDefault: boolean;
  category: string;
  /** First-person statement shown on the dashboard commitment card. */
  dailyStatement: string;
  /** IDs of good habits suggested as antidotes (only meaningful for bad). */
  antidoteIds?: ReadonlyArray<string>;
};

/** Back-compat alias. Pre-refactor callers used `BadHabit`. */
export type BadHabit = MasterHabit;

/* -------------------------------------------------------------------------- */
/*  Master list                                                               */
/* -------------------------------------------------------------------------- */

export const MASTER_HABITS: ReadonlyArray<MasterHabit> = [
  // ── Bad habits — default 4×4 grid (16) ─────────────────────────────────
  { id: "smoking",              name: "Roken",            type: "bad", isDefault: true,  category: "substanties", dailyStatement: "Niet gerookt vandaag",       antidoteIds: ["walking","water_intake","pushups"] },
  { id: "porn",                 name: "Porno",            type: "bad", isDefault: true,  category: "seksueel",    dailyStatement: "Geen porno gekeken",         antidoteIds: ["cold_shower","pushups","walking"] },
  { id: "procrastination",      name: "Uitstellen",       type: "bad", isDefault: true,  category: "mentaal",     dailyStatement: "Niet uitgesteld",            antidoteIds: ["plan_day","deep_work"] },
  { id: "alcohol",              name: "Alcohol",          type: "bad", isDefault: true,  category: "substanties", dailyStatement: "Geen alcohol gedronken",     antidoteIds: ["water_intake","journaling","walking"] },
  { id: "sugar",                name: "Suiker",           type: "bad", isDefault: true,  category: "eten",        dailyStatement: "Geen suiker gegeten",        antidoteIds: ["veggies","protein_breakfast","water_intake"] },
  { id: "weed",                 name: "Wiet",             type: "bad", isDefault: true,  category: "substanties", dailyStatement: "Geen wiet gerookt",          antidoteIds: ["workout","meditation","journaling"] },
  { id: "social_media",         name: "Social media",     type: "bad", isDefault: true,  category: "scherm",      dailyStatement: "Social media beperkt",       antidoteIds: ["reading","phone_free_hour","deep_work"] },
  { id: "emotional_eating",     name: "Emotie eten",      type: "bad", isDefault: true,  category: "eten",        dailyStatement: "Niet emotie gegeten",        antidoteIds: ["journaling","walking","gratitude"] },
  { id: "fastfood",             name: "Fastfood",         type: "bad", isDefault: true,  category: "eten",        dailyStatement: "Geen fastfood gegeten",      antidoteIds: ["veggies","protein_breakfast"] },
  { id: "gambling",             name: "Gokken",           type: "bad", isDefault: true,  category: "geld",        dailyStatement: "Niet gegokt",                antidoteIds: ["walking","journaling","ask_help"] },
  { id: "energy_drinks",        name: "Energiedrank",     type: "bad", isDefault: true,  category: "substanties", dailyStatement: "Geen energiedrank gehad",    antidoteIds: ["water_intake","daylight","early_sleep"] },
  { id: "overspending",         name: "Impulsaankopen",   type: "bad", isDefault: true,  category: "geld",        dailyStatement: "Niet impulsief gekocht",     antidoteIds: ["plan_day","journaling"] },
  { id: "doomscroll",           name: "Doomscrollen",     type: "bad", isDefault: true,  category: "scherm",      dailyStatement: "Niet gedoomscrolld",         antidoteIds: ["reading","walking","phone_free_hour"] },
  { id: "late_sleep",           name: "Laat slapen",      type: "bad", isDefault: true,  category: "slaap",       dailyStatement: "Op tijd naar bed",           antidoteIds: ["early_sleep","evening_review"] },
  { id: "negative_thinking",    name: "Negatief denken",  type: "bad", isDefault: true,  category: "mentaal",     dailyStatement: "Niet negatief gedacht",      antidoteIds: ["journaling","gratitude","walking"] },
  { id: "binge_watching",       name: "Series bingen",    type: "bad", isDefault: true,  category: "scherm",      dailyStatement: "Geen series gebinged",       antidoteIds: ["reading","walking","family_call"] },

  // ── Bad habits — extras (10 original) ──────────────────────────────────
  { id: "caffeine",             name: "Cafeïne",          type: "bad", isDefault: false, category: "substanties", dailyStatement: "Cafeïne onder controle",     antidoteIds: ["water_intake","early_sleep"] },
  { id: "lying",                name: "Liegen",           type: "bad", isDefault: false, category: "gedrag",      dailyStatement: "Niet gelogen",               antidoteIds: ["journaling","ask_help"] },
  { id: "gossip",               name: "Roddelen",         type: "bad", isDefault: false, category: "gedrag",      dailyStatement: "Niet geroddeld",             antidoteIds: ["compliment","gratitude"] },
  { id: "snoozing",             name: "Snoozen",          type: "bad", isDefault: false, category: "slaap",       dailyStatement: "Niet gesnoozed",             antidoteIds: ["make_bed","no_morning_phone"] },
  { id: "work_avoidance",       name: "Werk vermijden",   type: "bad", isDefault: false, category: "vermijden",   dailyStatement: "Werk niet vermeden",         antidoteIds: ["plan_day","deep_work"] },
  { id: "stress_eating",        name: "Stress eten",      type: "bad", isDefault: false, category: "eten",        dailyStatement: "Niet stress gegeten",        antidoteIds: ["meditation","walking","water_intake"] },
  { id: "unnecessary_snacking", name: "Onnodig snacken",  type: "bad", isDefault: false, category: "eten",        dailyStatement: "Niet onnodig gesnackt",      antidoteIds: ["water_intake","veggies"] },
  { id: "no_exercise",          name: "Geen beweging",    type: "bad", isDefault: false, category: "lichaam",     dailyStatement: "Wel bewogen vandaag",        antidoteIds: ["walking","pushups","stretching"] },
  { id: "poor_boundaries",      name: "Slechte grenzen",  type: "bad", isDefault: false, category: "gedrag",      dailyStatement: "Grenzen bewaakt",            antidoteIds: ["journaling","ask_help"] },
  { id: "unnecessary_spending", name: "Onnodig uitgeven", type: "bad", isDefault: false, category: "geld",        dailyStatement: "Niets onnodigs gekocht",     antidoteIds: ["plan_day","gratitude"] },

  // ── Bad habits — extras v2 (12 new) ────────────────────────────────────
  { id: "vaping",               name: "Vapen",              type: "bad", isDefault: false, category: "substanties", dailyStatement: "Niet gevapet",            antidoteIds: ["walking","water_intake","pushups"] },
  { id: "gaming",               name: "Gamen",              type: "bad", isDefault: false, category: "scherm",      dailyStatement: "Niet te lang gegamed",    antidoteIds: ["workout","reading","walking"] },
  { id: "phone_in_bed",         name: "Telefoon in bed",    type: "bad", isDefault: false, category: "scherm",      dailyStatement: "Geen telefoon in bed",    antidoteIds: ["reading","journaling"] },
  { id: "late_eating",          name: "Laat eten",          type: "bad", isDefault: false, category: "eten",        dailyStatement: "Niet laat gegeten",       antidoteIds: ["evening_review","early_sleep"] },
  { id: "binge_eating",         name: "Bingen",             type: "bad", isDefault: false, category: "eten",        dailyStatement: "Niet gebinged",           antidoteIds: ["journaling","meditation","water_intake"] },
  { id: "online_shopping",      name: "Online shoppen",     type: "bad", isDefault: false, category: "geld",        dailyStatement: "Niet online geshopt",     antidoteIds: ["plan_day","walking"] },
  { id: "news_check",           name: "Nieuws checken",     type: "bad", isDefault: false, category: "scherm",      dailyStatement: "Nieuws niet compulsief",  antidoteIds: ["reading","deep_work","phone_free_hour"] },
  { id: "comparing",            name: "Vergelijken",        type: "bad", isDefault: false, category: "mentaal",     dailyStatement: "Niet vergeleken",         antidoteIds: ["gratitude","journaling"] },
  { id: "complaining",          name: "Klagen",             type: "bad", isDefault: false, category: "mentaal",     dailyStatement: "Niet geklaagd",           antidoteIds: ["gratitude","journaling"] },
  { id: "perfectionism",        name: "Perfectionisme",     type: "bad", isDefault: false, category: "mentaal",     dailyStatement: "Niet doorgeslagen",       antidoteIds: ["journaling","evening_review"] },
  { id: "conflict_avoidance",   name: "Conflict vermijden", type: "bad", isDefault: false, category: "vermijden",   dailyStatement: "Conflict niet vermeden",  antidoteIds: ["ask_help","journaling"] },
  { id: "emotion_suppression",  name: "Emoties wegduwen",   type: "bad", isDefault: false, category: "vermijden",   dailyStatement: "Emoties toegelaten",      antidoteIds: ["journaling","ask_help","meditation"] },

  // ── Good habits (26) ───────────────────────────────────────────────────
  { id: "walking",           name: "Wandelen",              type: "good", isDefault: false, category: "beweging",   dailyStatement: "Wandeling gemaakt" },
  { id: "workout",           name: "Sporten",               type: "good", isDefault: false, category: "beweging",   dailyStatement: "Gesport vandaag" },
  { id: "pushups",           name: "Push-ups",              type: "good", isDefault: false, category: "beweging",   dailyStatement: "Push-ups gedaan" },
  { id: "stretching",        name: "Stretchen",             type: "good", isDefault: false, category: "beweging",   dailyStatement: "Gestretcht" },
  { id: "yoga",              name: "Yoga",                  type: "good", isDefault: false, category: "beweging",   dailyStatement: "Yoga gedaan" },
  { id: "running",           name: "Hardlopen",             type: "good", isDefault: false, category: "beweging",   dailyStatement: "Hardgelopen" },
  { id: "meditation",        name: "Mediteren",             type: "good", isDefault: false, category: "mind",       dailyStatement: "Gemediteerd" },
  { id: "journaling",        name: "Journalen",             type: "good", isDefault: false, category: "mind",       dailyStatement: "Gejournaled" },
  { id: "reading",           name: "Lezen",                 type: "good", isDefault: false, category: "mind",       dailyStatement: "Gelezen vandaag" },
  { id: "deep_work",         name: "Diep werk",             type: "good", isDefault: false, category: "mind",       dailyStatement: "Diep gewerkt" },
  { id: "phone_free_hour",   name: "Telefoon-vrij uur",     type: "good", isDefault: false, category: "mind",       dailyStatement: "Telefoon-vrij uur gehad" },
  { id: "water_intake",      name: "Water drinken",         type: "good", isDefault: false, category: "lichaam",    dailyStatement: "Genoeg water gedronken" },
  { id: "protein_breakfast", name: "Eiwit-ontbijt",         type: "good", isDefault: false, category: "lichaam",    dailyStatement: "Eiwit-ontbijt gehad" },
  { id: "veggies",           name: "Groente eten",          type: "good", isDefault: false, category: "lichaam",    dailyStatement: "Groente gegeten" },
  { id: "cold_shower",       name: "Koude douche",          type: "good", isDefault: false, category: "lichaam",    dailyStatement: "Koud gedoucht" },
  { id: "daylight",          name: "Daglicht 10min",        type: "good", isDefault: false, category: "lichaam",    dailyStatement: "10min daglicht gehad" },
  { id: "early_sleep",       name: "Vroeg slapen",          type: "good", isDefault: false, category: "lichaam",    dailyStatement: "Op tijd naar bed" },
  { id: "family_call",       name: "Familie bellen",        type: "good", isDefault: false, category: "sociaal",    dailyStatement: "Familie gebeld" },
  { id: "ask_help",          name: "Hulp vragen",           type: "good", isDefault: false, category: "sociaal",    dailyStatement: "Hulp gevraagd" },
  { id: "compliment",        name: "Compliment geven",      type: "good", isDefault: false, category: "sociaal",    dailyStatement: "Compliment gegeven" },
  { id: "gratitude",         name: "Dankbaarheid",          type: "good", isDefault: false, category: "sociaal",    dailyStatement: "Dankbaarheid opgeschreven" },
  { id: "plan_day",          name: "Dag plannen",           type: "good", isDefault: false, category: "discipline", dailyStatement: "Dag gepland" },
  { id: "evening_review",    name: "Avondreview",           type: "good", isDefault: false, category: "discipline", dailyStatement: "Avondreview gedaan" },
  { id: "make_bed",          name: "Bed opmaken",           type: "good", isDefault: false, category: "discipline", dailyStatement: "Bed opgemaakt" },
  { id: "no_morning_phone",  name: "Geen ochtend-telefoon", type: "good", isDefault: false, category: "discipline", dailyStatement: "Geen telefoon eerste uur" },
  { id: "mindful_meal",      name: "Bewust eten",           type: "good", isDefault: false, category: "discipline", dailyStatement: "Bewust gegeten" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Filtered views                                                            */
/* -------------------------------------------------------------------------- */

export const BAD_HABITS: ReadonlyArray<MasterHabit> = MASTER_HABITS.filter(
  (h) => h.type === "bad",
);
export const GOOD_HABITS: ReadonlyArray<MasterHabit> = MASTER_HABITS.filter(
  (h) => h.type === "good",
);

export const DEFAULT_BAD_HABITS = BAD_HABITS.filter((h) => h.isDefault);
export const EXTRA_BAD_HABITS = BAD_HABITS.filter((h) => !h.isDefault);

export const MAX_BAD_HABITS = 5;
export const MAX_GOOD_HABITS = 3;

/**
 * Categories used to group good habits in the onboarding/profile sheets.
 * Ordered for display.
 */
export const GOOD_HABIT_CATEGORIES: ReadonlyArray<{
  id: string;
  label: string;
}> = [
  { id: "beweging",   label: "Beweging" },
  { id: "mind",       label: "Mind" },
  { id: "lichaam",    label: "Lichaam" },
  { id: "sociaal",    label: "Sociaal" },
  { id: "discipline", label: "Discipline" },
];

const BY_ID: Record<string, MasterHabit> = Object.fromEntries(
  MASTER_HABITS.map((h) => [h.id, h]),
);

/* -------------------------------------------------------------------------- */
/*  Lookups                                                                   */
/* -------------------------------------------------------------------------- */

export function getMasterHabit(id: string): MasterHabit | undefined {
  return BY_ID[id];
}

export function getBadHabit(id: string): MasterHabit | undefined {
  const h = BY_ID[id];
  return h && h.type === "bad" ? h : undefined;
}

export function getGoodHabit(id: string): MasterHabit | undefined {
  const h = BY_ID[id];
  return h && h.type === "good" ? h : undefined;
}

export function getBadHabitName(id: string): string {
  return BY_ID[id]?.name ?? id;
}

export function getDailyStatement(id: string): string {
  return BY_ID[id]?.dailyStatement ?? BY_ID[id]?.name ?? id;
}

export function getHabitType(id: string): HabitType | undefined {
  return BY_ID[id]?.type;
}

export function getAntidotes(id: string): MasterHabit[] {
  const ids = BY_ID[id]?.antidoteIds ?? [];
  return ids.map((aid) => BY_ID[aid]).filter((h): h is MasterHabit => Boolean(h));
}

/**
 * Aggregate antidote suggestions across a set of bad-habit IDs.
 *
 * Counts how often each antidote appears across the chosen bad habits, then
 * returns unique good habits in descending vote order (stable for same vote
 * counts, falling back to catalog sort order via the `MASTER_HABITS` array).
 *
 * Example: a user who picked Roken + Porno + Alcohol gets `walking` and
 * `pushups` near the top because all three list them. Returns at most
 * `limit` habits (default 6 — enough to populate suggestions plus a few
 * alternates).
 */
export function getAntidotesForHabits(
  badHabitIds: ReadonlyArray<string>,
  limit = 6,
): MasterHabit[] {
  const votes = new Map<string, number>();
  for (const badId of badHabitIds) {
    const ids = BY_ID[badId]?.antidoteIds ?? [];
    for (const aid of ids) {
      votes.set(aid, (votes.get(aid) ?? 0) + 1);
    }
  }
  // Stable sort: vote desc, then preserve catalog order via MASTER_HABITS.
  const indexOf = new Map(MASTER_HABITS.map((h, i) => [h.id, i]));
  const ranked = [...votes.entries()]
    .map(([id, count]) => ({
      id,
      count,
      idx: indexOf.get(id) ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((a, b) => b.count - a.count || a.idx - b.idx)
    .slice(0, limit);
  return ranked
    .map(({ id }) => BY_ID[id])
    .filter((h): h is MasterHabit => Boolean(h));
}

/** True when `id` references a habit that lives in the current catalog. */
export function isKnownHabit(id: string): boolean {
  return Boolean(BY_ID[id]);
}

/**
 * Drop any habit IDs that aren't in the current catalog (e.g. legacy IDs
 * left over in `onboarding_responses.focus_habits` from before the bad-habits
 * migration). Order preserved.
 */
export function filterKnownHabits(ids: ReadonlyArray<string>): string[] {
  return ids.filter(isKnownHabit);
}
