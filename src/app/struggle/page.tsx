"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobilePage } from "@/components/layout/MobilePage";
import { BreathingHalo } from "@/components/struggle/BreathingHalo";
import { StruggleShell } from "@/components/struggle/StruggleShell";
import { CloseConfirmDialog } from "@/components/struggle/CloseConfirmDialog";
import { UrgeSlider } from "@/components/struggle/UrgeSlider";
import { CountdownRing } from "@/components/struggle/CountdownRing";
import { StruggleOptionCard } from "@/components/struggle/StruggleOptionCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  closeStruggleSession,
  completeStruggleSession,
  resolveProtectedTarget,
  startStruggleSession,
  updateStruggleStep,
} from "@/lib/struggle/client";
import type { StruggleFlowState, StruggleStep } from "@/lib/struggle/types";
import {
  INTERVENTIONS,
  NEED_OPTIONS,
  REFLECTION_TAGS,
  TIMER_BEATS,
  TRIGGER_OPTIONS,
  WALKING_BEATS,
  beatForElapsed,
  getIntervention,
  type InterventionId,
} from "@/lib/struggle/copy";
import { cn } from "@/lib/utils/cn";

const INITIAL_STATE: StruggleFlowState = {
  sessionId: null,
  habitId: null,
  goalId: null,
  step: "entry",
  triggerStates: [],
  underlyingNeed: null,
  urgeScoreBefore: null,
  urgeScoreAfter: null,
  selectedIntervention: null,
  interventionCompleted: false,
  interventionDurationSeconds: null,
  reflectionText: "",
  reflectionTags: [],
  protectedHabitName: null,
  protectedGoalTitle: null,
  protectedGoalWhy: null,
  reflectOnly: false,
};

export default function StrugglePage() {
  return (
    <Suspense fallback={<MobilePage flush><div className="flex h-screen items-center justify-center"><LoadingSkeleton height="h-12" className="w-32" /></div></MobilePage>}>
      <StruggleFlowInner />
    </Suspense>
  );
}

function StruggleFlowInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialHabitId = searchParams.get("habit");

  const [state, setState] = useState<StruggleFlowState>(INITIAL_STATE);
  const [bootError, setBootError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [booting, setBooting] = useState(true);
  /** Used to short-circuit duplicate close calls if the timer fires twice. */
  const finishedRef = useRef(false);

  /* ------------ Session bootstrap ------------ */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const target = await resolveProtectedTarget();
        const habitId = initialHabitId ?? target.habitId;
        const sessionId = await startStruggleSession({
          habitId,
          goalId: target.goalId,
          protectedHabitName: target.protectedHabitName,
          protectedGoalTitle: target.protectedGoalTitle,
        });
        if (cancelled) return;
        setState((s) => ({
          ...s,
          sessionId,
          habitId,
          goalId: target.goalId,
          protectedHabitName: target.protectedHabitName,
          protectedGoalTitle: target.protectedGoalTitle,
          protectedGoalWhy: target.protectedGoalWhy,
        }));
      } catch (err) {
        console.error("[struggle] boot failed:", err);
        if (!cancelled) setBootError("Kon flow niet starten.");
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialHabitId]);

  /* ------------ Persistence helpers ------------ */
  const persist = useCallback(
    async (step: StruggleStep, patch: Partial<StruggleFlowState>) => {
      setSaveError(null);
      setState((s) => ({ ...s, ...patch, step }));
      if (!state.sessionId) return;
      try {
        const payload: Record<string, unknown> = {};
        if (patch.triggerStates !== undefined)
          payload.trigger_states = patch.triggerStates;
        if (patch.underlyingNeed !== undefined && patch.underlyingNeed !== null)
          payload.underlying_need = patch.underlyingNeed;
        if (patch.urgeScoreBefore !== undefined && patch.urgeScoreBefore !== null)
          payload.urge_score_before = patch.urgeScoreBefore;
        if (patch.urgeScoreAfter !== undefined && patch.urgeScoreAfter !== null)
          payload.urge_score_after = patch.urgeScoreAfter;
        if (patch.selectedIntervention !== undefined && patch.selectedIntervention !== null)
          payload.selected_intervention = patch.selectedIntervention;
        if (patch.interventionCompleted !== undefined)
          payload.intervention_completed = patch.interventionCompleted;
        if (patch.interventionDurationSeconds !== undefined && patch.interventionDurationSeconds !== null)
          payload.intervention_duration_seconds = patch.interventionDurationSeconds;
        if (patch.reflectionText !== undefined)
          payload.reflection_text = patch.reflectionText;
        if (patch.reflectionTags !== undefined)
          payload.reflection_tags = patch.reflectionTags;
        await updateStruggleStep(state.sessionId, step, payload);
      } catch (err) {
        console.error("[struggle] step save failed:", err);
        setSaveError("Er ging iets mis met opslaan. Je flow blijft lokaal actief.");
      }
    },
    [state.sessionId],
  );

  const doClose = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      if (state.sessionId) {
        await closeStruggleSession(state.sessionId);
      }
    } catch (err) {
      console.error("[struggle] close failed:", err);
    } finally {
      router.push("/dashboard");
    }
  }, [router, state.sessionId]);

  const requestClose = useCallback(() => {
    if (state.step === "entry" || state.step === "summary") {
      void doClose();
      return;
    }
    setConfirmClose(true);
  }, [state.step, doClose]);

  const doComplete = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      if (state.sessionId) {
        await completeStruggleSession(state.sessionId);
      }
    } catch (err) {
      console.error("[struggle] complete failed:", err);
    } finally {
      router.push("/dashboard");
    }
  }, [router, state.sessionId]);

  if (booting) {
    return (
      <MobilePage flush>
        <div className="flex h-screen items-center justify-center px-6">
          <LoadingSkeleton height="h-12" className="w-32" />
        </div>
      </MobilePage>
    );
  }

  if (bootError) {
    return (
      <MobilePage flush>
        <div className="flex h-screen flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-danger">{bootError}</p>
          <PrimaryButton onClick={() => router.push("/dashboard")}>
            Terug naar dashboard
          </PrimaryButton>
        </div>
      </MobilePage>
    );
  }

  return (
    <MobilePage flush>
      <div className="lockd-overlay-enter min-h-[100dvh]">
        {state.step === "entry" && (
          <StepEntry
            onPrimary={() => persist("triggers", {})}
            onReflectOnly={() =>
              persist("reflection", { reflectOnly: true })
            }
            onClose={requestClose}
          />
        )}

        {state.step === "triggers" && (
          <StepTriggers
            selected={state.triggerStates}
            onToggle={(id) => {
              const next = state.triggerStates.includes(id)
                ? state.triggerStates.filter((x) => x !== id)
                : [...state.triggerStates, id];
              setState((s) => ({ ...s, triggerStates: next }));
            }}
            onNext={() =>
              persist("need", { triggerStates: state.triggerStates })
            }
            onSkip={() => persist("need", { triggerStates: [] })}
            onClose={requestClose}
          />
        )}

        {state.step === "need" && (
          <StepNeed
            selected={state.underlyingNeed}
            onPick={(id) => setState((s) => ({ ...s, underlyingNeed: id }))}
            onNext={() =>
              persist("urge_before", { underlyingNeed: state.underlyingNeed })
            }
            onClose={requestClose}
          />
        )}

        {state.step === "urge_before" && (
          <StepUrgeBefore
            value={state.urgeScoreBefore ?? 7}
            onChange={(v) => setState((s) => ({ ...s, urgeScoreBefore: v }))}
            onConfirm={() =>
              persist("identity", {
                urgeScoreBefore: state.urgeScoreBefore ?? 7,
              })
            }
            onClose={requestClose}
          />
        )}

        {state.step === "identity" && (
          <StepIdentity
            protectedGoalTitle={state.protectedGoalTitle}
            protectedGoalWhy={state.protectedGoalWhy}
            protectedHabitName={state.protectedHabitName}
            onNext={() => persist("intervention", {})}
            onClose={requestClose}
          />
        )}

        {state.step === "intervention" && (
          <StepIntervention
            selected={state.selectedIntervention}
            onPick={(id) =>
              setState((s) => ({ ...s, selectedIntervention: id }))
            }
            onStart={() => {
              const iv = getIntervention(state.selectedIntervention);
              if (!iv) return;
              if (iv.id === "reflectie_kort") {
                void persist("reflection", {
                  selectedIntervention: iv.id,
                });
                return;
              }
              if (iv.durationSeconds === 0) {
                // Eigen keuze: no timer; manual completion.
                void persist("timer", {
                  selectedIntervention: iv.id,
                });
                return;
              }
              void persist("timer", { selectedIntervention: iv.id });
            }}
            onClose={requestClose}
          />
        )}

        {state.step === "timer" && state.selectedIntervention && (
          <StepTimer
            intervention={state.selectedIntervention}
            onDone={(durationSeconds, completed) =>
              persist("urge_after", {
                interventionCompleted: completed,
                interventionDurationSeconds: durationSeconds,
              })
            }
            onChangeIntervention={() =>
              persist("intervention", { selectedIntervention: null })
            }
            onClose={requestClose}
          />
        )}

        {state.step === "urge_after" && (
          <StepUrgeAfter
            before={state.urgeScoreBefore ?? 7}
            value={state.urgeScoreAfter ?? Math.max(1, (state.urgeScoreBefore ?? 7) - 2)}
            onChange={(v) => setState((s) => ({ ...s, urgeScoreAfter: v }))}
            onConfirm={() =>
              persist("result", {
                urgeScoreAfter:
                  state.urgeScoreAfter ?? Math.max(1, (state.urgeScoreBefore ?? 7) - 2),
              })
            }
            onClose={requestClose}
          />
        )}

        {state.step === "result" && (
          <StepResult
            before={state.urgeScoreBefore ?? 0}
            after={state.urgeScoreAfter ?? 0}
            protectedHabitName={state.protectedHabitName}
            onDone={() => persist("summary", {})}
            onReflect={() => persist("reflection", {})}
            onAnotherIntervention={() =>
              persist("intervention", { selectedIntervention: null })
            }
            onClose={requestClose}
          />
        )}

        {state.step === "reflection" && (
          <StepReflection
            text={state.reflectionText}
            tags={state.reflectionTags}
            onChangeText={(t) =>
              setState((s) => ({ ...s, reflectionText: t.slice(0, 600) }))
            }
            onToggleTag={(tag) => {
              const next = state.reflectionTags.includes(tag)
                ? state.reflectionTags.filter((x) => x !== tag)
                : [...state.reflectionTags, tag];
              setState((s) => ({ ...s, reflectionTags: next }));
            }}
            onSave={() =>
              persist("summary", {
                reflectionText: state.reflectionText,
                reflectionTags: state.reflectionTags,
              })
            }
            onSkip={() => persist("summary", {})}
            onClose={requestClose}
          />
        )}

        {state.step === "summary" && (
          <StepSummary
            state={state}
            onDone={doComplete}
          />
        )}

        {saveError && (
          <div className="fixed inset-x-4 bottom-20 z-50">
            <GlassCard tone="danger" padding="sm">
              <p className="text-xs text-danger">{saveError}</p>
            </GlassCard>
          </div>
        )}
      </div>

      {confirmClose && (
        <CloseConfirmDialog
          onCancel={() => setConfirmClose(false)}
          onConfirm={() => {
            setConfirmClose(false);
            void doClose();
          }}
        />
      )}
    </MobilePage>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 0 — Entry                                                    */
/* ------------------------------------------------------------------ */

function StepEntry({
  onPrimary,
  onReflectOnly,
  onClose,
}: {
  onPrimary: () => void;
  onReflectOnly: () => void;
  onClose: () => void;
}) {
  return (
    <StruggleShell
      onClose={onClose}
      pulledDown
      actions={
        <div className="flex w-full flex-col gap-2">
          <PrimaryButton onClick={onPrimary} fullWidth>
            Bescherm mijn standaard
          </PrimaryButton>
          <GhostButton onClick={onReflectOnly} fullWidth>
            Alleen reflecteren
          </GhostButton>
        </div>
      }
    >
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 flex items-center justify-center"
        >
          <BreathingHalo size={300} />
        </div>
        <div className="h-[260px] w-[260px]" />
      </div>
      <h1 className="text-[34px] font-semibold leading-[1.05] tracking-tight text-foreground">
        Je bent niet je <span className="text-purple-bright">impuls</span>.
      </h1>
      <p className="text-sm leading-relaxed text-muted">
        Wat je nu voelt hoeft niets te bepalen.
      </p>
      <p className="text-[11px] leading-relaxed text-muted">
        Laten we eerst 60 seconden ruimte maken.
      </p>
    </StruggleShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Triggers (multi-select)                                  */
/* ------------------------------------------------------------------ */

function StepTriggers({
  selected,
  onToggle,
  onNext,
  onSkip,
  onClose,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  return (
    <StruggleShell
      eyebrow="Stap 1"
      onClose={onClose}
      actions={
        <div className="flex w-full flex-col gap-1">
          <PrimaryButton onClick={onNext} fullWidth>
            Verder
          </PrimaryButton>
          <button
            type="button"
            onClick={onSkip}
            className="h-10 text-[11px] font-medium text-muted hover:text-foreground"
          >
            Overslaan
          </button>
        </div>
      }
    >
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
        Wat gebeurt er <span className="text-purple-bright">nu</span>?
      </h1>
      <p className="text-sm text-muted">
        Kies wat dichtbij komt. Je hoeft het niet perfect te weten.
      </p>
      <div className="flex w-full flex-wrap justify-center gap-2 pt-1">
        {TRIGGER_OPTIONS.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-medium",
                "transition-all duration-150 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                active
                  ? "border-purple/60 bg-purple/15 text-foreground shadow-[0_0_18px_-8px_var(--color-purple-glow)]"
                  : "border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </StruggleShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Underlying need (single-select)                          */
/* ------------------------------------------------------------------ */

function StepNeed({
  selected,
  onPick,
  onNext,
  onClose,
}: {
  selected: string | null;
  onPick: (id: string) => void;
  onNext: () => void;
  onClose: () => void;
}) {
  return (
    <StruggleShell
      eyebrow="Stap 2"
      onClose={onClose}
      actions={
        <PrimaryButton onClick={onNext} disabled={!selected} fullWidth>
          Verder
        </PrimaryButton>
      }
    >
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
        Waar zoekt je <span className="text-purple-bright">brein</span> nu naar?
      </h1>
      <p className="text-sm text-muted">
        De drang is vaak niet het echte probleem.
      </p>
      <div className="flex w-full flex-wrap justify-center gap-2 pt-1">
        {NEED_OPTIONS.map((opt) => {
          const active = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onPick(opt.id)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-medium",
                "transition-all duration-150 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                active
                  ? "border-purple/60 bg-purple/15 text-foreground shadow-[0_0_18px_-8px_var(--color-purple-glow)]"
                  : "border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </StruggleShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Urge before                                              */
/* ------------------------------------------------------------------ */

function StepUrgeBefore({
  value,
  onChange,
  onConfirm,
  onClose,
}: {
  value: number;
  onChange: (v: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <StruggleShell
      eyebrow="Stap 3"
      onClose={onClose}
      actions={
        <PrimaryButton onClick={onConfirm} fullWidth>
          Bevestig
        </PrimaryButton>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
        Hoe sterk voelt de drang?
      </h1>
      <UrgeSlider value={value} onChange={onChange} />
      <p className="text-[11px] leading-relaxed text-muted">
        Sterke drang betekent niet zwakke discipline.
      </p>
    </StruggleShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Identity mirror                                          */
/* ------------------------------------------------------------------ */

function StepIdentity({
  protectedGoalTitle,
  protectedGoalWhy,
  protectedHabitName,
  onNext,
  onClose,
}: {
  protectedGoalTitle: string | null;
  protectedGoalWhy: string | null;
  protectedHabitName: string | null;
  onNext: () => void;
  onClose: () => void;
}) {
  const goalLabel = protectedGoalTitle ?? "Controle houden";
  const habitLabel = protectedHabitName ?? "Jezelf";
  const goalRowLabel = protectedGoalTitle ? "Jouw doel" : "Jouw standaard";

  return (
    <StruggleShell
      eyebrow="Stap 4"
      onClose={onClose}
      actions={
        <PrimaryButton onClick={onNext} fullWidth>
          Ga door
        </PrimaryButton>
      }
    >
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
        Dit is jouw <span className="text-purple-bright">eerste test</span>.
      </h1>

      <div className="flex w-full flex-col gap-3 pt-1">
        <IdentityRow label={goalRowLabel} value={goalLabel} />
        {protectedGoalWhy && (
          <div
            className={cn(
              "flex flex-col gap-1 rounded-[var(--radius-sm)]",
              "border border-purple/40 bg-purple/8 px-4 py-3 text-left",
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
              Jouw waarom
            </span>
            <span className="text-sm leading-relaxed text-foreground/95">
              <span aria-hidden className="text-purple-bright/70">
                &ldquo;
              </span>
              {protectedGoalWhy}
              <span aria-hidden className="text-purple-bright/70">
                &rdquo;
              </span>
            </span>
          </div>
        )}
        <IdentityRow label="Vandaag bescherm je" value={habitLabel} />
      </div>

      <p className="text-sm leading-relaxed text-muted">
        Je hoeft niet te winnen. Je hoeft alleen niet te verliezen.
      </p>
    </StruggleShell>
  );
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-[var(--radius-sm)]",
        "border border-[var(--color-border)] bg-surface/60 px-4 py-3 text-left",
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
        {label}
      </span>
      <span className="text-base font-semibold text-foreground">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 5 — Choose intervention                                      */
/* ------------------------------------------------------------------ */

function StepIntervention({
  selected,
  onPick,
  onStart,
  onClose,
}: {
  selected: InterventionId | null;
  onPick: (id: InterventionId) => void;
  onStart: () => void;
  onClose: () => void;
}) {
  return (
    <StruggleShell
      eyebrow="Stap 5"
      onClose={onClose}
      actions={
        <PrimaryButton onClick={onStart} disabled={!selected} fullWidth>
          Start
        </PrimaryButton>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
        Wat helpt nu <span className="text-purple-bright">waarschijnlijk</span> meer?
      </h1>
      <p className="text-sm text-muted">Kies iets kleins. Vrijblijvend, maar bewust.</p>

      <div className="flex w-full flex-col gap-2 pt-1">
        {INTERVENTIONS.map((iv) => (
          <StruggleOptionCard
            key={iv.id}
            title={iv.title}
            description={iv.description}
            meta={iv.durationSeconds > 0 ? `${iv.durationSeconds}s` : undefined}
            selected={selected === iv.id}
            onSelect={() => onPick(iv.id)}
          />
        ))}
      </div>
    </StruggleShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 6 — Intervention execution                                   */
/* ------------------------------------------------------------------ */

function StepTimer({
  intervention,
  onDone,
  onChangeIntervention,
  onClose,
}: {
  intervention: InterventionId;
  onDone: (durationSeconds: number, completed: boolean) => void;
  onChangeIntervention: () => void;
  onClose: () => void;
}) {
  const iv = getIntervention(intervention)!;
  const startedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
  }, []);
  const [elapsed, setElapsed] = useState(0);
  const isWalking = iv.id === "wandelen_120";
  const isManual = iv.durationSeconds === 0;
  const beats = isWalking ? WALKING_BEATS : TIMER_BEATS;
  const beat = beatForElapsed(beats, elapsed);

  // tick elapsed for beat-rotation (not used for ring; CountdownRing has its own clock)
  useEffect(() => {
    if (isManual) return;
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(t);
  }, [elapsed, isManual]);

  const handleComplete = useCallback(() => {
    const start = startedAtRef.current ?? Date.now();
    const seconds = Math.round((Date.now() - start) / 1000);
    onDone(seconds, true);
  }, [onDone]);

  const handleManualDone = useCallback(() => {
    const start = startedAtRef.current ?? Date.now();
    const seconds = Math.round((Date.now() - start) / 1000);
    onDone(seconds, true);
  }, [onDone]);

  return (
    <StruggleShell
      eyebrow="Stap 6"
      onClose={onClose}
      pulledDown
      actions={
        <div className="flex w-full flex-col gap-1">
          <PrimaryButton onClick={handleManualDone} fullWidth>
            Ik ben klaar
          </PrimaryButton>
          <button
            type="button"
            onClick={onChangeIntervention}
            className="h-10 text-[11px] font-medium text-muted hover:text-foreground"
          >
            Andere interventie proberen
          </button>
        </div>
      }
    >
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 flex items-center justify-center"
        >
          <BreathingHalo size={300} slow />
        </div>
        {isManual ? (
          <div className="flex h-[260px] w-[260px] items-center justify-center text-center">
            <p className="text-sm leading-relaxed text-foreground/85">
              {iv.description}
            </p>
          </div>
        ) : (
          <CountdownRing
            durationSeconds={iv.durationSeconds}
            onComplete={handleComplete}
          />
        )}
      </div>

      {!isManual && (
        <p
          key={beat.atSecond}
          className="lockd-fade-rise text-[15px] font-medium leading-relaxed text-foreground/90"
        >
          {beat.text}
        </p>
      )}

      <AudioComingPill />
    </StruggleShell>
  );
}

function AudioComingPill() {
  return (
    <span
      aria-label="Audio binnenkort beschikbaar"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "border border-[var(--color-border)] bg-surface/50",
        "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted",
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5">
        <path
          d="M11 4L6 8H3v8h3l5 4V4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M15 9c1 1 1 5 0 6M18 7c2 2 2 8 0 10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      Luister · binnenkort
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 7 — Urge after                                               */
/* ------------------------------------------------------------------ */

function StepUrgeAfter({
  before,
  value,
  onChange,
  onConfirm,
  onClose,
}: {
  before: number;
  value: number;
  onChange: (v: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <StruggleShell
      eyebrow="Stap 7"
      onClose={onClose}
      actions={
        <PrimaryButton onClick={onConfirm} fullWidth>
          Bevestig
        </PrimaryButton>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
        Hoe sterk is de drang <span className="text-purple-bright">nu</span>?
      </h1>
      <UrgeSlider value={value} onChange={onChange} contextLabel={`Eerst: ${before}`} />
    </StruggleShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 8 — Result                                                   */
/* ------------------------------------------------------------------ */

function StepResult({
  before,
  after,
  protectedHabitName,
  onDone,
  onReflect,
  onAnotherIntervention,
  onClose,
}: {
  before: number;
  after: number;
  protectedHabitName: string | null;
  onDone: () => void;
  onReflect: () => void;
  onAnotherIntervention: () => void;
  onClose: () => void;
}) {
  const drop = before - after;
  const dropPct = before > 0 ? Math.round((100 * drop) / before) : 0;
  const decreased = drop > 0;
  const same = drop === 0;

  const heroTitle = decreased
    ? "Beschermd."
    : same
      ? "Je bleef bewust."
      : "Je bent nog steeds in controle.";

  const heroSub = decreased
    ? "Je impuls verloor kracht."
    : same
      ? "Niet elke drang zakt meteen. Maar je hebt het patroon onderbroken."
      : "Dan maken we de volgende stap kleiner.";

  return (
    <StruggleShell
      eyebrow="Stap 8"
      onClose={onClose}
      pulledDown
      actions={
        <div className="flex w-full flex-col gap-2">
          <PrimaryButton onClick={onDone} fullWidth>
            Klaar
          </PrimaryButton>
          {!decreased ? (
            <GhostButton onClick={onAnotherIntervention} fullWidth>
              Nog een interventie
            </GhostButton>
          ) : (
            <GhostButton onClick={onReflect} fullWidth>
              Reflecteren
            </GhostButton>
          )}
        </div>
      }
    >
      <h1 className="text-[36px] font-semibold leading-[1.05] tracking-tight text-foreground">
        <span className={cn(decreased ? "text-purple-bright" : "text-foreground")}>
          {heroTitle}
        </span>
      </h1>
      <p className="text-sm leading-relaxed text-muted">{heroSub}</p>

      <div className="grid w-full grid-cols-3 gap-2 pt-1">
        <ResultStat label="Drang" value={`${before} → ${after}`} />
        <ResultStat label="Daling" value={decreased ? `${dropPct}%` : same ? "0%" : "—"} />
        <ResultStat
          label="Standaard"
          value={
            <span className={decreased ? "text-success" : "text-foreground"}>
              {decreased ? "beschermd" : "bewust"}
            </span>
          }
        />
      </div>

      {protectedHabitName && (
        <p className="text-[11px] text-muted">
          Standaard van vandaag: <span className="text-foreground/85">{protectedHabitName}</span>
        </p>
      )}
    </StruggleShell>
  );
}

function ResultStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-1 rounded-[var(--radius-sm)]",
        "border border-[var(--color-border)] bg-surface/60 px-3 py-2.5",
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 9 — Reflection                                               */
/* ------------------------------------------------------------------ */

function StepReflection({
  text,
  tags,
  onChangeText,
  onToggleTag,
  onSave,
  onSkip,
  onClose,
}: {
  text: string;
  tags: string[];
  onChangeText: (v: string) => void;
  onToggleTag: (tag: string) => void;
  onSave: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const canSave = text.trim().length > 0 || tags.length > 0;

  return (
    <StruggleShell
      eyebrow="Reflectie"
      onClose={onClose}
      pulledDown
      actions={
        <div className="flex w-full flex-col gap-1">
          <PrimaryButton onClick={onSave} disabled={!canSave} fullWidth>
            Opslaan
          </PrimaryButton>
          <button
            type="button"
            onClick={onSkip}
            className="h-10 text-[11px] font-medium text-muted hover:text-foreground"
          >
            Sla over
          </button>
        </div>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
        Wat ging er door je <span className="text-purple-bright">heen</span>?
      </h1>
      <p className="text-[11px] leading-relaxed text-muted">
        Niet voor anderen. Voor jezelf.
      </p>

      <textarea
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        rows={5}
        maxLength={600}
        placeholder="Eén zin is genoeg."
        className={cn(
          "w-full resize-none rounded-[var(--radius-sm)]",
          "border border-[var(--color-border)] bg-surface/60 px-4 py-3",
          "text-sm leading-relaxed text-foreground placeholder:text-muted",
          "outline-none focus:border-purple/60",
        )}
      />
      <span className="self-end text-[10px] tabular-nums text-muted">
        {text.length}/600
      </span>

      <div className="flex w-full flex-wrap justify-center gap-2 pt-1">
        {REFLECTION_TAGS.map((t) => {
          const active = tags.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggleTag(t)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-medium",
                "transition-colors duration-150",
                active
                  ? "border-purple/60 bg-purple/15 text-foreground"
                  : "border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
    </StruggleShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 10 — Summary                                                 */
/* ------------------------------------------------------------------ */

function StepSummary({
  state,
  onDone,
}: {
  state: StruggleFlowState;
  onDone: () => void;
}) {
  const iv = getIntervention(state.selectedIntervention);
  const triggerLabel =
    state.triggerStates.length > 0
      ? TRIGGER_OPTIONS.filter((o) => state.triggerStates.includes(o.id))
          .map((o) => o.label)
          .join(" · ")
      : "—";
  const needLabel =
    NEED_OPTIONS.find((o) => o.id === state.underlyingNeed)?.label ?? "—";

  return (
    <StruggleShell
      showClose={false}
      pulledDown
      actions={
        <PrimaryButton onClick={onDone} fullWidth>
          Terug naar dashboard
        </PrimaryButton>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
        Wat leerden we?
      </h1>

      <div className="grid w-full grid-cols-2 gap-2 pt-1">
        <SummaryTile label="Trigger" value={triggerLabel} />
        <SummaryTile label="Behoefte" value={needLabel} />
        <SummaryTile
          label="Drang"
          value={
            state.urgeScoreBefore !== null && state.urgeScoreAfter !== null
              ? `${state.urgeScoreBefore} → ${state.urgeScoreAfter}`
              : "—"
          }
        />
        <SummaryTile label="Interventie" value={iv?.title ?? "—"} />
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        Na een paar momenten ziet LOCKD je patronen scherper.
      </p>
    </StruggleShell>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-1 rounded-[var(--radius-sm)]",
        "border border-[var(--color-border)] bg-surface/60 px-3 py-2.5",
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      <span className="line-clamp-2 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
