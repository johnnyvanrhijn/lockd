/**
 * Canonical option lists for the onboarding flow.
 *
 * IDs are stored in the database as `text[]` columns; labels are render-
 * only and live in this file alone. To add a new option, append to the
 * array; the UI picks it up automatically.
 */

export const TOTAL_STEPS_SOLO = 8;
export const TOTAL_STEPS_BUDDIES = 10;

export type Option = { id: string; label: string };

// Step 2 — habits to break (max 5)
export const HABIT_OPTIONS: ReadonlyArray<Option> = [
  { id: "smoking", label: "Roken" },
  { id: "porn", label: "Porno" },
  { id: "weed", label: "Blowen" },
  { id: "gambling", label: "Gokken" },
  { id: "alcohol", label: "Alcohol" },
  { id: "doomscroll", label: "Doomscrollen" },
  { id: "binge_eating", label: "Vreetbuien" },
  { id: "overspending", label: "Impulsief uitgeven" },
  { id: "snoozing", label: "Snoozen" },
  { id: "nail_biting", label: "Nagelbijten" },
  { id: "caffeine", label: "Te veel cafeïne" },
  { id: "social_media", label: "Te veel social media" },
] as const;
export const MAX_FOCUS_HABITS = 5;

// Step 3 — desired outcomes
export const OUTCOME_OPTIONS: ReadonlyArray<Option> = [
  { id: "calm", label: "Rust in mijn hoofd" },
  { id: "discipline", label: "Meer discipline" },
  { id: "energy", label: "Meer energie" },
  { id: "focus", label: "Betere focus" },
  { id: "confidence", label: "Meer zelfvertrouwen" },
  { id: "sleep", label: "Betere slaap" },
  { id: "control", label: "Meer controle" },
  { id: "productivity", label: "Productiever zijn" },
  { id: "relationships", label: "Betere relaties" },
  { id: "self_respect", label: "Trots op mezelf" },
  { id: "fitness", label: "Fysiek sterker zijn" },
];

// Step 4 — risk times of day
export const TIME_OPTIONS: ReadonlyArray<Option> = [
  { id: "morning", label: "Ochtend" },
  { id: "afternoon", label: "Middag" },
  { id: "evening", label: "Avond" },
  { id: "night", label: "Nacht" },
];

// Step 4 — risk situations
export const SITUATION_OPTIONS: ReadonlyArray<Option> = [
  { id: "alone_home", label: "Alleen thuis" },
  { id: "no_work", label: "Geen werk" },
  { id: "in_bed", label: "In bed" },
  { id: "under_stress", label: "Bij stress" },
  { id: "after_workout", label: "Na sporten" },
  { id: "social_settings", label: "Sociale situaties" },
  { id: "bored", label: "Bij verveling" },
  { id: "after_conflict", label: "Na conflict" },
  { id: "weekend", label: "Weekend" },
  { id: "random", label: "Willekeurig" },
];

// Step 5 — emotional/behavioral triggers
export const TRIGGER_OPTIONS: ReadonlyArray<Option> = [
  { id: "stress", label: "Stress" },
  { id: "tired", label: "Moe / uitgeput" },
  { id: "boredom", label: "Verveling" },
  { id: "loneliness", label: "Eenzaamheid" },
  { id: "dopamine", label: "Dopamine zoeken" },
  { id: "frustration", label: "Frustratie / boosheid" },
  { id: "overstimulated", label: "Overprikkeld" },
  { id: "sadness", label: "Verdriet" },
  { id: "routine", label: "Routine / gewoonte" },
  { id: "procrastination", label: "Uitstelgedrag" },
  { id: "social", label: "Sociale situaties" },
];

// Step 6 — tone of voice (single select)
export const TONE_OPTIONS: ReadonlyArray<Option & { description: string }> = [
  { id: "soft", label: "Zacht", description: "Begripvol en motiverend" },
  { id: "neutral", label: "Neutraal", description: "Rustig en informerend" },
  { id: "direct", label: "Direct", description: "Duidelijk en to-the-point" },
  { id: "confronting", label: "Confronterend", description: "Hard waar nodig" },
];

// Step 6 — support modes (multi select)
export const SUPPORT_OPTIONS: ReadonlyArray<Option> = [
  { id: "reflection", label: "Reflectievragen" },
  { id: "facts", label: "Feiten & statistieken" },
  { id: "motivation", label: "Motivatie" },
  { id: "distraction", label: "Afleiding" },
  { id: "breathing", label: "Ademhaling" },
  { id: "accountability", label: "Accountability" },
  { id: "reminders", label: "Herinneringen" },
  { id: "practical", label: "Praktische acties" },
];
