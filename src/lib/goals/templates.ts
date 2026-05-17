/**
 * Mission templates. Hardcoded for v1 — moving to DB later only if the project
 * already adopts a content config table. Each template carries WHY-options,
 * supporting (positive) habits as text, and sabotage habits which can be
 * linked to bad_habits_master via habitId when the name matches.
 *
 * Keys map to bad_habits_master(id) where possible:
 *   smoking, weed, porn, alcohol, doomscroll, overspending, late_sleep,
 *   stress_eating, unnecessary_snacking, emotional_eating, social_media,
 *   binge_watching, snoozing, work_avoidance, procrastination, etc.
 */

export type SuggestedHabit = {
  /** Display name (Dutch). */
  name: string;
  /** Optional link to bad_habits_master.id for sabotage habits. */
  habitId?: string;
};

export type GoalCategory =
  | "stoppen_controle"
  | "gezondheid"
  | "focus"
  | "relaties"
  | "geld_gedrag"
  | "custom";

export type GoalTemplate = {
  key: string;
  title: string;
  category: GoalCategory;
  durationDays: number;
  whySuggestions: ReadonlyArray<string>;
  supporting: ReadonlyArray<SuggestedHabit>;
  sabotage: ReadonlyArray<SuggestedHabit>;
};

export const CATEGORY_LABEL: Record<GoalCategory, string> = {
  stoppen_controle: "Stoppen & controle",
  gezondheid: "Gezondheid",
  focus: "Focus",
  relaties: "Relaties",
  geld_gedrag: "Geld & gedrag",
  custom: "Custom",
};

export const GOAL_TEMPLATES: ReadonlyArray<GoalTemplate> = [
  {
    key: "7d_niet_roken",
    title: "7 dagen niet roken",
    category: "stoppen_controle",
    durationDays: 7,
    whySuggestions: ["Meer controle", "Gezonder leven", "Minder schaamte", "Geld besparen"],
    supporting: [
      { name: "Ochtendroutine" },
      { name: "Voldoende slaap" },
      { name: "Training" },
      { name: "Stress check-in" },
    ],
    sabotage: [
      { name: "Roken", habitId: "smoking" },
      { name: "Sociale rookmomenten" },
      { name: "Stress roken" },
      { name: "Alcohol", habitId: "alcohol" },
    ],
  },
  {
    key: "30d_stoppen_roken",
    title: "30 dagen stoppen met roken",
    category: "stoppen_controle",
    durationDays: 30,
    whySuggestions: ["Gezonder leven", "Meer controle", "Geld besparen", "Trots voelen"],
    supporting: [
      { name: "Voldoende slaap" },
      { name: "Training" },
      { name: "Wandelen" },
      { name: "Stress check-in" },
    ],
    sabotage: [
      { name: "Roken", habitId: "smoking" },
      { name: "Alcohol", habitId: "alcohol" },
      { name: "Sociale rookmomenten" },
      { name: "Avondverleiding" },
    ],
  },
  {
    key: "7d_niet_blowen",
    title: "7 dagen niet blowen",
    category: "stoppen_controle",
    durationDays: 7,
    whySuggestions: ["Heldere kop", "Meer energie", "Meer controle", "Beter slapen"],
    supporting: [
      { name: "Avondroutine" },
      { name: "Training" },
      { name: "Vroeg naar bed" },
      { name: "Reflectie" },
    ],
    sabotage: [
      { name: "Blowen", habitId: "weed" },
      { name: "Alleen thuis hangen" },
      { name: "Laat opblijven", habitId: "late_sleep" },
      { name: "Doomscrollen", habitId: "doomscroll" },
    ],
  },
  {
    key: "30d_niet_blowen",
    title: "30 dagen niet blowen",
    category: "stoppen_controle",
    durationDays: 30,
    whySuggestions: ["Discipline opbouwen", "Heldere kop", "Meer controle", "Meer energie"],
    supporting: [
      { name: "Training" },
      { name: "Avondroutine" },
      { name: "Voldoende slaap" },
      { name: "Inner circle check-in" },
    ],
    sabotage: [
      { name: "Blowen", habitId: "weed" },
      { name: "Stress" },
      { name: "Verveling" },
      { name: "Oude omgeving" },
    ],
  },
  {
    key: "14d_geen_porno",
    title: "14 dagen geen porno",
    category: "stoppen_controle",
    durationDays: 14,
    whySuggestions: [
      "Meer zelfcontrole",
      "Minder schaamte",
      "Meer focus",
      "Betere relatie met jezelf",
    ],
    supporting: [
      { name: "Telefoon wegleggen" },
      { name: "Vroeg slapen" },
      { name: "Training" },
      { name: "Urge flow gebruiken" },
    ],
    sabotage: [
      { name: "Porno", habitId: "porn" },
      { name: "Alleen scrollen", habitId: "doomscroll" },
      { name: "Laat naar bed", habitId: "late_sleep" },
      { name: "Verveling" },
    ],
  },
  {
    key: "5kg_afvallen",
    title: "5 kg afvallen",
    category: "gezondheid",
    durationDays: 90,
    whySuggestions: ["Strakker voelen", "Meer energie", "Zelfvertrouwen", "Gezondheid verbeteren"],
    supporting: [
      { name: "Stappen halen" },
      { name: "Training" },
      { name: "Eiwitten eten" },
      { name: "Slaap beschermen" },
    ],
    sabotage: [
      { name: "Snacken", habitId: "unnecessary_snacking" },
      { name: "Alcohol", habitId: "alcohol" },
      { name: "Binge eating", habitId: "emotional_eating" },
      { name: "Slechte slaap", habitId: "late_sleep" },
    ],
  },
  {
    key: "4x_trainen_week",
    title: "4x trainen per week",
    category: "gezondheid",
    durationDays: 7,
    whySuggestions: ["Sterker worden", "Discipline opbouwen", "Energie verhogen", "Trots voelen"],
    supporting: [
      { name: "Training uitvoeren" },
      { name: "Voldoende slaap" },
      { name: "Eiwitten eten" },
      { name: "Stappen halen" },
    ],
    sabotage: [
      { name: "Training overslaan" },
      { name: "Slechte slaap", habitId: "late_sleep" },
      { name: "Alcohol", habitId: "alcohol" },
      { name: "Uitstellen", habitId: "procrastination" },
    ],
  },
  {
    key: "x_keer_trainen_maand",
    title: "X keer trainen per maand",
    category: "gezondheid",
    durationDays: 30,
    whySuggestions: ["Consistent worden", "Fit blijven", "Sterker worden", "Discipline opbouwen"],
    supporting: [
      { name: "Training uitvoeren" },
      { name: "Planning maken" },
      { name: "Voldoende slaap" },
    ],
    sabotage: [
      { name: "Training overslaan" },
      { name: "Uitstellen", habitId: "procrastination" },
      { name: "Slechte planning" },
    ],
  },
  {
    key: "10000_stappen_dag",
    title: "10.000 stappen per dag",
    category: "gezondheid",
    durationDays: 7,
    whySuggestions: [
      "Meer energie",
      "Actiever leven",
      "Vetverlies ondersteunen",
      "Dagritme verbeteren",
    ],
    supporting: [
      { name: "Wandelen" },
      { name: "Lunchwandeling" },
      { name: "Avondwandeling" },
    ],
    sabotage: [
      { name: "Hele dag zitten" },
      { name: "Te laat beginnen" },
      { name: "Slecht weer excuus" },
    ],
  },
  {
    key: "betere_partner",
    title: "Betere partner zijn",
    category: "relaties",
    durationDays: 30,
    whySuggestions: [
      "Meer verbinding",
      "Rustiger reageren",
      "Betere relatie",
      "Meer aandacht geven",
    ],
    supporting: [
      { name: "Dagelijkse check-in" },
      { name: "Telefoon wegleggen" },
      { name: "Luisteren zonder onderbreken" },
      { name: "Kleine attentie" },
    ],
    sabotage: [
      { name: "Kortaf reageren" },
      { name: "Doomscrollen", habitId: "doomscroll" },
      { name: "Vermijden" },
      { name: "Boos worden" },
    ],
  },
  {
    key: "minder_schermtijd",
    title: "Minder schermtijd",
    category: "focus",
    durationDays: 14,
    whySuggestions: ["Meer rust", "Meer focus", "Meer tijd terugpakken", "Beter slapen"],
    supporting: [
      { name: "Telefoonvrije avond" },
      { name: "Focusblok" },
      { name: "Wandelen" },
      { name: "Lezen" },
    ],
    sabotage: [
      { name: "Doomscrollen", habitId: "doomscroll" },
      { name: "Social media", habitId: "social_media" },
      { name: "Telefoon in bed" },
      { name: "Notificaties" },
    ],
  },
  // --- Geld & gedrag placeholders (per plan)
  {
    key: "14d_geen_impulsaankopen",
    title: "14 dagen geen impulsaankopen",
    category: "geld_gedrag",
    durationDays: 14,
    whySuggestions: ["Bewuster leven", "Geld besparen", "Minder spijt", "Meer controle"],
    supporting: [
      { name: "Wishlist 24u" },
      { name: "Budgetcheck" },
      { name: "Wandelen" },
    ],
    sabotage: [
      { name: "Impulsaankopen", habitId: "overspending" },
      { name: "Doomscrollen", habitId: "doomscroll" },
      { name: "Verveling" },
      { name: "Late-avond browsen" },
    ],
  },
  {
    key: "30d_geen_alcohol",
    title: "30 dagen geen alcohol",
    category: "geld_gedrag",
    durationDays: 30,
    whySuggestions: ["Helderder hoofd", "Geld besparen", "Betere slaap", "Meer controle"],
    supporting: [
      { name: "Avondroutine" },
      { name: "Training" },
      { name: "Inner-circle check-in" },
    ],
    sabotage: [
      { name: "Alcohol", habitId: "alcohol" },
      { name: "Sociale druk" },
      { name: "Weekend" },
    ],
  },
  {
    key: "14d_niet_bestellen",
    title: "14 dagen niet bestellen",
    category: "geld_gedrag",
    durationDays: 14,
    whySuggestions: ["Geld besparen", "Gezonder eten", "Bewuste keuzes", "Minder afval"],
    supporting: [
      { name: "Boodschappenlijst" },
      { name: "Meal-prep" },
      { name: "Vroeg eten" },
    ],
    sabotage: [
      { name: "Late honger" },
      { name: "Onnodig uitgeven", habitId: "unnecessary_spending" },
      { name: "Stress" },
    ],
  },
];

export function getTemplate(key: string): GoalTemplate | null {
  return GOAL_TEMPLATES.find((t) => t.key === key) ?? null;
}

export function templatesByCategory(): Array<{
  category: GoalCategory;
  label: string;
  templates: GoalTemplate[];
}> {
  const groups = new Map<GoalCategory, GoalTemplate[]>();
  for (const t of GOAL_TEMPLATES) {
    if (!groups.has(t.category)) groups.set(t.category, []);
    groups.get(t.category)!.push(t);
  }
  const order: GoalCategory[] = [
    "stoppen_controle",
    "gezondheid",
    "focus",
    "relaties",
    "geld_gedrag",
  ];
  return order
    .filter((c) => (groups.get(c)?.length ?? 0) > 0)
    .map((c) => ({
      category: c,
      label: CATEGORY_LABEL[c],
      templates: groups.get(c) ?? [],
    }));
}
