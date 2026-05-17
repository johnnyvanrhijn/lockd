"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { completeGoal, getGoalDetail, type GoalDetail } from "@/lib/goals/client";
import { nextMissionRecommendation } from "@/lib/goals/engine";
import { cn } from "@/lib/utils/cn";

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type Result = "achieved" | "partially_achieved" | "not_achieved";

const HELPED_OPTIONS = [
  "Duidelijke routine",
  "Minder triggers",
  "Inner circle",
  "Training",
  "Slaap",
  "Minder stress",
  "Planning",
  "Urge flow gebruikt",
  "Anders",
];

const HARD_OPTIONS = [
  "Stress",
  "Sociale druk",
  "Verveling",
  "Slechte slaap",
  "Weekend",
  "Alleen zijn",
  "Alcohol",
  "Telefoon",
  "Geen duidelijke routine",
  "Anders",
];

const FEELING_OPTIONS = [
  "Trots",
  "Rustig",
  "Gefrustreerd",
  "Gemotiveerd",
  "Teleurgesteld",
  "Scherp",
];

const RESULT_OPTIONS: Array<{ id: Result; label: string }> = [
  { id: "achieved", label: "Ja" },
  { id: "partially_achieved", label: "Gedeeltelijk" },
  { id: "not_achieved", label: "Nee" },
];

function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CompleteGoalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const goalId = params.id;

  const [detail, setDetail] = useState<GoalDetail | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [result, setResult] = useState<Result | null>(null);
  const [helped, setHelped] = useState<string[]>([]);
  const [hard, setHard] = useState<string[]>([]);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await getGoalDetail(goalId);
        if (!cancelled) setDetail(d);
      } catch (err) {
        console.error("[complete] load failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [goalId]);

  function toggleList(setter: (v: string[]) => void, current: string[], v: string) {
    setter(current.includes(v) ? current.filter((x) => x !== v) : [...current, v]);
  }

  function canProceed(s: Step): boolean {
    switch (s) {
      case 1:
        return result !== null;
      case 2:
        return helped.length > 0;
      case 3:
        return hard.length > 0;
      case 4:
        return feeling !== null;
      case 5:
        return true;
      case 6:
        return true;
    }
  }

  function nextStep() {
    if (!canProceed(step)) return;
    setStep((s) => (Math.min(6, s + 1) as Step));
  }
  function prevStep() {
    if (step === 1) {
      router.push(`/goals/${goalId}`);
      return;
    }
    setStep((s) => (Math.max(1, s - 1) as Step));
  }

  async function handleSubmit() {
    if (submitting || !result) return;
    setSubmitting(true);
    setError(null);
    try {
      const status: "completed" | "partial" | "failed" =
        result === "achieved" ? "completed" : result === "partially_achieved" ? "partial" : "failed";
      const hint = nextMissionRecommendation(result);
      await completeGoal(
        goalId,
        {
          result,
          what_helped: helped.length > 0 ? helped : undefined,
          what_made_it_hard: hard.length > 0 ? hard : undefined,
          feeling: feeling ?? undefined,
          reflection_text: text.trim() || undefined,
          next_recommendation: hint?.copy,
        },
        status,
      );
      router.push("/goals");
    } catch (err) {
      console.error("[complete] save failed:", err);
      setError("Kon je reflectie niet opslaan. Probeer het opnieuw.");
      setSubmitting(false);
    }
  }

  if (!detail) {
    return (
      <AppShell
        header={
          <header className="flex items-center gap-3 pt-1">
            <IconButton
              aria-label="Terug"
              icon={<BackArrow />}
              variant="secondary"
              size="md"
              onClick={() => router.push(`/goals/${goalId}`)}
            />
            <span className="text-base font-semibold text-foreground">
              Missie afronden
            </span>
          </header>
        }
      >
        <div className="flex flex-col gap-4 pt-2">
          <LoadingSkeleton height="h-32" />
          <LoadingSkeleton height="h-16" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      header={
        <header className="flex items-center justify-between gap-3 pt-1">
          <IconButton
            aria-label="Terug"
            icon={<BackArrow />}
            variant="secondary"
            size="md"
            onClick={prevStep}
          />
          <div className="flex min-w-0 flex-1 flex-col text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              Missie afgerond
            </span>
            <h1 className="truncate text-base font-semibold text-foreground">
              {detail.goal.title}
            </h1>
          </div>
          <span className="h-10 w-10" aria-hidden />
        </header>
      }
    >
      <div className="flex flex-col gap-5 pb-32">
        {step === 1 && (
          <StepResult result={result} onPick={setResult} />
        )}
        {step === 2 && (
          <ChipsMulti
            title="Wat heeft geholpen?"
            options={HELPED_OPTIONS}
            selected={helped}
            onToggle={(v) => toggleList(setHelped, helped, v)}
          />
        )}
        {step === 3 && (
          <ChipsMulti
            title="Wat maakte het moeilijk?"
            options={HARD_OPTIONS}
            selected={hard}
            onToggle={(v) => toggleList(setHard, hard, v)}
          />
        )}
        {step === 4 && (
          <ChipsSingle
            title="Hoe voel je je?"
            options={FEELING_OPTIONS}
            selected={feeling}
            onPick={setFeeling}
          />
        )}
        {step === 5 && (
          <StepText text={text} onChange={setText} />
        )}
        {step === 6 && (
          <StepSummary
            title={detail.goal.title}
            result={result}
            days={detail.goal.duration_days}
            currentDay={detail.goal.current_day}
          />
        )}

        {error && (
          <GlassCard tone="danger" padding="md">
            <p className="text-sm text-danger">{error}</p>
          </GlassCard>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none flex justify-center">
        <div
          className={cn(
            "pointer-events-auto w-full max-w-[430px]",
            "border-t border-[var(--color-border)] bg-background/90 backdrop-blur-xl",
            "px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]",
          )}
        >
          <div className="flex items-center gap-2">
            {step > 1 && <GhostButton onClick={prevStep}>Terug</GhostButton>}
            {step < 6 ? (
              <PrimaryButton
                onClick={nextStep}
                disabled={!canProceed(step)}
                fullWidth
              >
                Volgende
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={handleSubmit}
                disabled={submitting}
                fullWidth
              >
                {submitting ? "Opslaan…" : "Opslaan & afronden"}
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StepResult({
  result,
  onPick,
}: {
  result: Result | null;
  onPick: (r: Result) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          Heb je je doel behaald?
        </h2>
        <p className="text-sm text-muted">
          Eerlijk is genoeg. Reflectie maakt de volgende sterker.
        </p>
      </header>
      <div className="flex flex-col gap-2">
        {RESULT_OPTIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            className={cn(
              "rounded-[var(--radius-sm)] border px-4 py-3.5 text-left text-sm font-semibold",
              "transition-colors duration-150",
              result === r.id
                ? "border-purple/60 bg-purple/15 text-foreground"
                : "border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChipsMulti({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          {title}
        </h2>
      </header>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-medium border",
                "transition-colors duration-150",
                active
                  ? "border-purple/60 bg-purple/15 text-foreground"
                  : "border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChipsSingle({
  title,
  options,
  selected,
  onPick,
}: {
  title: string;
  options: string[];
  selected: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          {title}
        </h2>
      </header>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onPick(o)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-medium border",
                "transition-colors duration-150",
                active
                  ? "border-purple/60 bg-purple/15 text-foreground"
                  : "border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepText({
  text,
  onChange,
}: {
  text: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          Wat neem je mee?
        </h2>
        <p className="text-sm text-muted">Optioneel — een paar zinnen voor jezelf.</p>
      </header>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value.slice(0, 300))}
        rows={6}
        placeholder="Een korte reflectie helpt je volgende missie."
        className={cn(
          "w-full resize-none rounded-[var(--radius-sm)]",
          "border border-[var(--color-border)] bg-surface/80 px-4 py-3",
          "text-sm leading-relaxed text-foreground placeholder:text-muted",
          "outline-none focus:border-purple/60",
        )}
      />
      <span className="self-end text-[10px] tabular-nums text-muted">
        {text.length}/300
      </span>
    </div>
  );
}

function StepSummary({
  title,
  result,
  days,
  currentDay,
}: {
  title: string;
  result: Result | null;
  days: number;
  currentDay: number;
}) {
  const hint = nextMissionRecommendation(result);
  const resultLabel =
    result === "achieved"
      ? "Behaald"
      : result === "partially_achieved"
        ? "Gedeeltelijk"
        : result === "not_achieved"
          ? "Niet behaald"
          : "—";

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          Bevestig & sla op
        </h2>
      </header>
      <GlassCard tone="purple" glow="soft" padding="md">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
            {resultLabel}
          </span>
          <h3 className="text-lg font-semibold leading-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted">
            Je behaalde {Math.min(currentDay, days)} van de {days} dagen.
          </p>
        </div>
      </GlassCard>
      {hint && (
        <GlassCard padding="md">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
              Volgende stap
            </span>
            <p className="text-sm leading-relaxed text-foreground/90">
              {hint.copy}
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
