export type MoodId =
  | "prima"
  | "gestrest"
  | "moe"
  | "geirriteerd"
  | "somber";

export type MoodOption = {
  id: MoodId;
  emoji: string;
  label: string;
  /** Tailwind color token for accent treatment when selected. */
  tone: "success" | "warning" | "info" | "danger" | "muted";
};

export const MOOD_OPTIONS: ReadonlyArray<MoodOption> = [
  { id: "prima", emoji: "😐", label: "Prima", tone: "success" },
  { id: "gestrest", emoji: "😓", label: "Gestrest", tone: "warning" },
  { id: "moe", emoji: "😴", label: "Moe", tone: "info" },
  { id: "geirriteerd", emoji: "😡", label: "Geïrriteerd", tone: "danger" },
  { id: "somber", emoji: "😔", label: "Somber", tone: "muted" },
];

export function getMoodOption(id: MoodId | string | null): MoodOption | null {
  if (!id) return null;
  return MOOD_OPTIONS.find((m) => m.id === id) ?? null;
}
