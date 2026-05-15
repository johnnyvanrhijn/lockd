"use client";

import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SummarySection } from "@/components/onboarding/SummarySection";
import type { OnboardingState } from "../page";
import {
  HABIT_OPTIONS,
  OUTCOME_OPTIONS,
  TIME_OPTIONS,
  SITUATION_OPTIONS,
  TRIGGER_OPTIONS,
  TONE_OPTIONS,
  SUPPORT_OPTIONS,
} from "@/lib/onboarding/options";

type Props = {
  total: number;
  current: number;
  state: OnboardingState;
  saving: boolean;
  onBack: () => void;
  onEditStep: (step: number) => void;
  onComplete: () => void;
};

function labelsFor(
  ids: ReadonlyArray<string>,
  options: ReadonlyArray<{ id: string; label: string }>,
): string {
  if (ids.length === 0) return "Niet geselecteerd";
  const map = new Map(options.map((o) => [o.id, o.label]));
  return ids.map((id) => map.get(id) ?? id).join(" · ");
}

function FocusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.5-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 21 10c0 5.5-7 10-7 10h-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.5V12l3 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 4l9.5 16H2.5L12 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 10v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}
function VoiceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M5 9a3 3 0 0 1 3-3h2l4-3v18l-4-3H8a3 3 0 0 1-3-3V9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M18 8.5c1 1.5 1 5.5 0 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M5 3v18M5 4h12l-3 4 3 4H5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepSummary({
  total,
  current,
  state,
  saving,
  onBack,
  onEditStep,
  onComplete,
}: Props) {
  const tone = TONE_OPTIONS.find((t) => t.id === state.tone_of_voice);

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Jouw profiel"
      title={
        <>
          Dit is jouw{" "}
          <span className="text-purple-bright">LOCKD</span> profiel.
        </>
      }
      subtitle={`Alles klopt, ${state.display_name || "je"}? Dan gaan we voor verandering.`}
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={onComplete}
            loading={saving}
            disabled={saving}
            fullWidth
          >
            Open dashboard
          </PrimaryButton>
        </div>
      }
    >
      <GlassCard tone="purple" glow="soft" padding="md" className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Jouw eerste doel
        </span>
        <p className="text-base font-semibold text-foreground">
          7 dagen consistent blijven.
        </p>
        <p className="text-xs text-muted">
          Mooie start. We helpen je op de momenten waarop het echt nodig is.
        </p>
      </GlassCard>

      <GlassCard padding="none">
        <div className="flex flex-col divide-y divide-[var(--color-border)] px-4">
          <SummarySection
            icon={<FocusIcon />}
            eyebrow="Jouw focus"
            title={`${state.focus_habits.length} gewoonte${state.focus_habits.length === 1 ? "" : "s"} doorbreken`}
            onEdit={() => onEditStep(2)}
            defaultOpen
          >
            {labelsFor(state.focus_habits, HABIT_OPTIONS)}
          </SummarySection>
          <SummarySection
            icon={<HeartIcon />}
            eyebrow="Jouw waarom"
            title="Wat je wilt terugkrijgen"
            onEdit={() => onEditStep(3)}
            defaultOpen={false}
          >
            {labelsFor(state.desired_outcomes, OUTCOME_OPTIONS)}
          </SummarySection>
          <SummarySection
            icon={<ClockIcon />}
            eyebrow="Jouw risicomomenten"
            title="Wanneer en waar"
            onEdit={() => onEditStep(4)}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-1">
              <span>
                <span className="text-foreground">Tijd: </span>
                {labelsFor(state.risk_times, TIME_OPTIONS)}
              </span>
              <span>
                <span className="text-foreground">Situaties: </span>
                {labelsFor(state.risk_situations, SITUATION_OPTIONS)}
              </span>
            </div>
          </SummarySection>
          <SummarySection
            icon={<AlertIcon />}
            eyebrow="Jouw triggers"
            title="Wat gaat er vaak vooraf"
            onEdit={() => onEditStep(5)}
            defaultOpen={false}
          >
            {labelsFor(state.triggers, TRIGGER_OPTIONS)}
          </SummarySection>
          <SummarySection
            icon={<VoiceIcon />}
            eyebrow="Jouw ondersteuning"
            title={`Tone: ${tone?.label ?? "Neutraal"}`}
            onEdit={() => onEditStep(6)}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-1">
              <span>
                <span className="text-foreground">Wat helpt jou: </span>
                {labelsFor(state.support_modes, SUPPORT_OPTIONS)}
              </span>
              <span>
                <span className="text-foreground">Actief ingrijpen: </span>
                {state.active_intervention ? "Aan" : "Uit"}
              </span>
            </div>
          </SummarySection>
          <SummarySection
            icon={<FlagIcon />}
            eyebrow="Jouw circle"
            title={
              state.accountability_mode === "buddies"
                ? "Accountability mode"
                : "Solo mode"
            }
            onEdit={() => onEditStep(7)}
            defaultOpen={false}
          >
            {state.accountability_mode === "buddies"
              ? "Tot 5 buddies kunnen je streaks, struggle moments en consistency zien."
              : "Alles blijft tussen jou en LOCKD. Je kunt later altijd buddies toevoegen."}
          </SummarySection>
        </div>
      </GlassCard>
    </OnboardingShell>
  );
}
