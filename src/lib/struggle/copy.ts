/**
 * Copy, interruption-action map, and audio beats for the "Ik struggle nu"
 * intervention flow.
 *
 * The brand voice is deliberately *not* therapeutic: short Dutch, present
 * tense, direct, no exclamation marks, no emojis, no metaphors that drift
 * into wellness territory. Every sentence ends with calm intent.
 */

export type Trigger =
  | "stress"
  | "boredom"
  | "loneliness"
  | "routine"
  | "trigger_seen"
  | "urge_no_reason"
  | "other";

export type TriggerOption = { key: Trigger; label: string };

export const TRIGGER_OPTIONS: ReadonlyArray<TriggerOption> = [
  { key: "stress", label: "Stress" },
  { key: "boredom", label: "Verveling" },
  { key: "loneliness", label: "Eenzaamheid" },
  { key: "routine", label: "Routine" },
  { key: "trigger_seen", label: "Trigger gezien" },
  { key: "urge_no_reason", label: "Drang zonder reden" },
  { key: "other", label: "Anders" },
];

/**
 * Per-habit interruption action, surfaced on Screen 5 of the flow.
 * The user sees exactly one action — chosen by habit, not by random rotation,
 * so the same prescription becomes a familiar anchor.
 */
export const INTERRUPTION_ACTIONS: Record<string, string> = {
  smoking: "Loop twee minuten naar buiten.",
  porn: "Leg je telefoon weg. Adem vier keer langzaam in en uit.",
  weed: "Drink een groot glas water. Sta op.",
  alcohol: "Drink water. Verlaat de keuken.",
  sugar: "Eet een appel of drink water.",
  social_media: "Sluit de app. Zet je telefoon weg.",
  emotional_eating: "Ga vijf minuten zitten zonder eten. Benoem het gevoel.",
  fastfood: "Drink een glas water. Wacht tien minuten.",
  gambling: "Sluit de app. Loop weg.",
  energy_drinks: "Drink water. Sta op.",
  overspending: "Sluit het tabblad. Geef het 24 uur.",
  doomscroll: "Zet je telefoon neer. Sta op.",
  late_sleep: "Dim het licht. Leg je telefoon buiten je slaapkamer.",
  negative_thinking: "Schrijf één zin op die wel waar is.",
  binge_watching: "Pauzeer. Sta op. Adem rustig in.",
  procrastination: "Doe alleen de eerste twee minuten van de taak.",
  caffeine: "Drink water. Wacht een uur.",
  lying: "Adem in. Zeg de waarheid in één zin.",
  gossip: "Verander het onderwerp. Of zwijg.",
  snoozing: "Sta op. Voeten op de grond. Tel tot drie.",
  work_avoidance: "Open de taak. Begin twee minuten.",
  stress_eating: "Drink water. Wacht vijf minuten.",
  unnecessary_snacking: "Drink water. Doe iets met je handen.",
  no_exercise: "Loop één rondje. Twee minuten.",
  poor_boundaries: "Adem in. Zeg nee, zonder uitleg.",
  unnecessary_spending: "Sluit het tabblad. Geef het 24 uur.",
};

/** Fallback when an unknown habit is selected. */
export const DEFAULT_INTERRUPTION =
  "Sta op. Adem vier keer langzaam in en uit.";

export function getInterruptionAction(habitId: string): string {
  return INTERRUPTION_ACTIONS[habitId] ?? DEFAULT_INTERRUPTION;
}

/**
 * Spoken beats during the 90-second timer. Audio is "Binnenkort" in v1 — these
 * are also rendered as soft on-screen captions every ~15s so the moment never
 * feels empty.
 */
export const TIMER_BEATS: ReadonlyArray<{ atSecond: number; text: string }> = [
  { atSecond: 0,  text: "Adem in." },
  { atSecond: 15, text: "Drang piekt." },
  { atSecond: 30, text: "Hij blijft niet." },
  { atSecond: 45, text: "Je hoeft niets te bewijzen." },
  { atSecond: 60, text: "Je bent groter dan dit moment." },
  { atSecond: 75, text: "Nog even." },
];

export const TIMER_DURATION_SECONDS = 90;

/** Idle timeout after which an in_progress event is auto-marked abandoned. */
export const ABANDON_IDLE_MS = 5 * 60 * 1000;
