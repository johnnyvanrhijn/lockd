/**
 * Canonical list of bad habits a user can track.
 *
 * This mirrors the seed of `public.bad_habits_master` in the database. Keep
 * the two in sync: the DB is the source of truth for the FK constraint, this
 * file is the source of truth for labels rendered in the UI before any rows
 * exist for the user.
 *
 * Ordering follows the brand's top-16 + 10-extras grouping used in onboarding:
 * the first 16 entries are the default 4x4 grid; the remaining 10 live behind
 * "Meer eigenschappen".
 */

export type BadHabit = {
  id: string;
  name: string;
  isDefault: boolean;
};

export const BAD_HABITS: ReadonlyArray<BadHabit> = [
  { id: "smoking",              name: "Roken",            isDefault: true },
  { id: "porn",                 name: "Porno",            isDefault: true },
  { id: "procrastination",      name: "Uitstellen",       isDefault: true },
  { id: "alcohol",              name: "Alcohol",          isDefault: true },
  { id: "sugar",                name: "Suiker",           isDefault: true },
  { id: "weed",                 name: "Wiet",             isDefault: true },
  { id: "social_media",         name: "Social media",     isDefault: true },
  { id: "emotional_eating",     name: "Emotie eten",      isDefault: true },
  { id: "fastfood",             name: "Fastfood",         isDefault: true },
  { id: "gambling",             name: "Gokken",           isDefault: true },
  { id: "energy_drinks",        name: "Energiedrank",     isDefault: true },
  { id: "overspending",         name: "Impulsaankopen",   isDefault: true },
  { id: "doomscroll",           name: "Doomscrollen",     isDefault: true },
  { id: "late_sleep",           name: "Laat slapen",      isDefault: true },
  { id: "negative_thinking",    name: "Negatief denken",  isDefault: true },
  { id: "binge_watching",       name: "Series bingen",    isDefault: true },
  { id: "caffeine",             name: "Cafeïne",          isDefault: false },
  { id: "lying",                name: "Liegen",           isDefault: false },
  { id: "gossip",               name: "Roddelen",         isDefault: false },
  { id: "snoozing",             name: "Snoozen",          isDefault: false },
  { id: "work_avoidance",       name: "Werk vermijden",   isDefault: false },
  { id: "stress_eating",        name: "Stress eten",      isDefault: false },
  { id: "unnecessary_snacking", name: "Onnodig snacken",  isDefault: false },
  { id: "no_exercise",          name: "Geen beweging",    isDefault: false },
  { id: "poor_boundaries",      name: "Slechte grenzen",  isDefault: false },
  { id: "unnecessary_spending", name: "Onnodig uitgeven", isDefault: false },
] as const;

export const DEFAULT_BAD_HABITS = BAD_HABITS.filter((h) => h.isDefault);
export const EXTRA_BAD_HABITS = BAD_HABITS.filter((h) => !h.isDefault);

export const MAX_BAD_HABITS = 5;

const BY_ID: Record<string, BadHabit> = Object.fromEntries(
  BAD_HABITS.map((h) => [h.id, h]),
);

export function getBadHabit(id: string): BadHabit | undefined {
  return BY_ID[id];
}

export function getBadHabitName(id: string): string {
  return BY_ID[id]?.name ?? id;
}
