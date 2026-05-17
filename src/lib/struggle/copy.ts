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

export type InterventionId =
  | "pauze_90"
  | "wandelen_120"
  | "ademhaling"
  | "water"
  | "muziek"
  | "reflectie_kort"
  | "eigen_keuze";

export type Intervention = {
  id: InterventionId;
  title: string;
  description: string;
  /** Timer duration in seconds. 0 = no timer (manual or skip-to-reflection). */
  durationSeconds: number;
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
  return INTERVENTIONS.find((i) => i.id === id) ?? null;
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
