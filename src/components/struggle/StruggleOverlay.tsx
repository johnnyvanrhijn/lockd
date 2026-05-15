"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  type StruggleContext,
  type StruggleStep,
  type MirrorData,
} from "@/lib/struggle/types";
import {
  ABANDON_IDLE_MS,
  getInterruptionAction,
  type Trigger,
} from "@/lib/struggle/copy";
import {
  aggregateImpact,
  type ImpactInput,
} from "@/lib/badHabits/impact";
import type { AnswerValue, AnswersByQuestion } from "@/lib/badHabits/questions";

import { EntryStep } from "./steps/EntryStep";
import { HabitPickStep } from "./steps/HabitPickStep";
import { TriggerStep } from "./steps/TriggerStep";
import { IntensityStep } from "./steps/IntensityStep";
import { MirrorStep } from "./steps/MirrorStep";
import { ActionStep } from "./steps/ActionStep";
import { TimerStep } from "./steps/TimerStep";
import { CompletionStep } from "./steps/CompletionStep";
import { ReflectionStep } from "./steps/ReflectionStep";
import { CloseConfirmDialog } from "./CloseConfirmDialog";

type Props = {
  open: boolean;
  context: StruggleContext;
  /** Called after the overlay finishes its closing animation. Parent unmounts. */
  onClose: () => void;
  /** Called after a successful completion (so dashboard can refetch). */
  onCompleted?: () => void;
};

/**
 * "Ik struggle nu" intervention overlay. Full-screen, portal-rendered, with
 * a backdrop-blur layer over the dashboard. Holds the state machine, RPC
 * orchestration, and idle abandonment.
 */
export function StruggleOverlay({
  open,
  context,
  onClose,
  onCompleted,
}: Props) {
  // Local session state. `intensity` is consumed inline (passed to the RPC
  // from the IntensityStep callback arg), so no useState is needed for it.
  const [step, setStep] = useState<StruggleStep>("entry");
  const [habitId, setHabitId] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [mirror, setMirror] = useState<MirrorData | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);
  const [newStreak, setNewStreak] = useState<number>(0);
  const [moneySavedPerDay, setMoneySavedPerDay] = useState<number | null>(null);
  const [alreadyFailed, setAlreadyFailed] = useState(false);

  // SSR-safe portal target. Since this component is "use client", `document`
  // is available the moment the component first renders in the browser; we
  // only need a guard for the server pass.
  const portalTarget: HTMLElement | null =
    typeof document !== "undefined" ? document.body : null;

  // Lock the dashboard scroll while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Idle abandonment: any interaction within the overlay resets the timer.
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventIdRef = useRef<string | null>(null);
  useEffect(() => {
    eventIdRef.current = eventId;
  }, [eventId]);

  const markAbandonedAndClose = useCallback(async () => {
    if (eventIdRef.current) {
      try {
        await getSupabaseClient().rpc("abandon_urge_event", {
          p_event_id: eventIdRef.current,
        });
      } catch (e) {
        console.warn("[struggle] abandon_urge_event failed", e);
      }
    }
    onClose();
  }, [onClose]);

  const bumpIdle = useCallback(() => {
    if (!open) return;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      void markAbandonedAndClose();
    }, ABANDON_IDLE_MS);
  }, [open, markAbandonedAndClose]);

  useEffect(() => {
    if (!open) return;
    bumpIdle();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [open, step, bumpIdle]);

  // Step transitions ---------------------------------------------------------

  const handleEntryContinue = () => {
    bumpIdle();
    setStep("habit_pick");
  };

  const handleHabitPick = (id: string) => {
    bumpIdle();
    setHabitId(id);
    // Preload Mirror data in the background so the screen feels instant.
    void loadMirror(id);
    setStep("trigger");
  };

  const handleTrigger = (t: Trigger) => {
    bumpIdle();
    setTrigger(t);
    setStep("intensity");
  };

  const handleIntensity = async (v: number) => {
    bumpIdle();

    // Insert the urge_event row now that habit + trigger + intensity all exist.
    if (habitId && trigger) {
      const supabase = getSupabaseClient();
      try {
        const { data, error } = await supabase.rpc("start_urge_event", {
          p_habit_id: habitId,
          p_trigger: trigger,
          p_intensity: v,
          p_interruption_action: getInterruptionAction(habitId),
        });
        if (error) throw error;
        if (typeof data === "string") setEventId(data);
      } catch (err) {
        console.error("[struggle] start_urge_event failed:", err);
        // Continue anyway — UX shouldn't dead-end. Completion will silently
        // skip the update if there's no eventId.
      }
    }
    setStep("mirror");
  };

  const handleMirrorContinue = () => {
    bumpIdle();
    setStep("action");
  };

  const handleActionStart = () => {
    bumpIdle();
    setStep("timer");
  };

  const handleTimerComplete = async () => {
    bumpIdle();
    if (!habitId) {
      setStep("completion");
      return;
    }
    const supabase = getSupabaseClient();
    const logDate = context.logDate;

    // Check whether the user has already logged Terugval for this habit today,
    // so completion copy can be honest if the success-log is skipped server-side.
    let pre: { habit_id: string; status: string }[] = [];
    try {
      const { data } = await supabase
        .from("habit_logs")
        .select("habit_id, status")
        .eq("habit_id", habitId)
        .eq("log_date", logDate);
      pre = (data ?? []) as { habit_id: string; status: string }[];
    } catch {
      // ignore — UX doesn't depend on this.
    }
    const wasAlreadyFail =
      pre.some((r) => r.habit_id === habitId && r.status === "fail") ?? false;
    setAlreadyFailed(wasAlreadyFail);

    if (eventId) {
      try {
        const { error } = await supabase.rpc("complete_urge_event", {
          p_event_id: eventId,
          p_log_date: logDate,
          p_audio_used: false,
        });
        if (error) throw error;
      } catch (err) {
        console.error("[struggle] complete_urge_event failed:", err);
      }
    }

    // Refresh the individual streak after the success log.
    try {
      const { data } = await supabase.rpc("get_individual_streak", {
        p_habit_id: habitId,
        p_today: logDate,
      });
      const row = data?.[0];
      setNewStreak(row?.current_streak ?? 0);
    } catch {
      /* leave 0 */
    }

    // Approximate per-day money saved for this habit so completion can show a
    // small "vandaag bespaard" tile.
    try {
      const { data: ans } = await supabase
        .from("user_habit_answers")
        .select("question_id, answer")
        .eq("habit_id", habitId);
      const answers: AnswersByQuestion = {};
      for (const row of ans ?? []) {
        answers[row.question_id] = row.answer as AnswerValue;
      }
      const inputs: ImpactInput[] = [{ habitId, answers, cleanDays: 1 }];
      const agg = aggregateImpact(inputs);
      setMoneySavedPerDay(agg.money > 0 ? agg.money : null);
    } catch {
      setMoneySavedPerDay(null);
    }

    onCompleted?.();
    setStep("completion");
  };

  const handleReflect = () => {
    bumpIdle();
    setStep("reflection");
  };

  const handleSaveReflection = async (body: string) => {
    if (!body) return;
    setSavingReflection(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.rpc("save_reflection", {
        p_body: body,
        p_urge_event_id: eventId ?? undefined,
      });
      if (error) throw error;
    } catch (err) {
      console.error("[struggle] save_reflection failed:", err);
    } finally {
      setSavingReflection(false);
      onClose();
    }
  };

  // Close + confirm ---------------------------------------------------------

  const handleCloseRequest = () => {
    // Don't show confirm on entry (cheap to dismiss) or after completion.
    if (step === "entry" || step === "completion" || step === "reflection") {
      void markAbandonedAndClose();
      return;
    }
    setShowCloseConfirm(true);
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    void markAbandonedAndClose();
  };

  // Mirror data --------------------------------------------------------------

  const loadMirror = useCallback(
    async (id: string) => {
      const supabase = getSupabaseClient();
      const logDate = context.logDate;
      try {
        const [streakRes, prevRes, patternRes] = await Promise.all([
          supabase.rpc("get_individual_streak", {
            p_habit_id: id,
            p_today: logDate,
          }),
          supabase
            .from("urge_events")
            .select("started_at")
            .eq("habit_id", id)
            .order("started_at", { ascending: false })
            .limit(1),
          supabase.rpc("get_urge_pattern"),
        ]);
        const streakRow = streakRes.data?.[0];
        const prev = prevRes.data?.[0];
        const pat = patternRes.data?.[0];

        const previousUrgeAt = prev
          ? new Date(prev.started_at).toLocaleTimeString("nl-NL", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null;

        const totalEvents = pat?.event_count ?? 0;
        const isFirstFew = totalEvents < 5;
        let patternSentence: string | null = null;
        if (
          !isFirstFew &&
          pat &&
          pat.peak_start !== null &&
          pat.peak_count > 0
        ) {
          const fmt = (h: number) =>
            `${String(((h % 24) + 24) % 24).padStart(2, "0")}:00`;
          const pct = Math.round(
            (pat.peak_count / Math.max(1, pat.event_count)) * 100,
          );
          patternSentence = `${pct}% van je struggles ontstaat rond ${fmt(pat.peak_start)}–${fmt(pat.peak_start + 2)}.`;
        }

        setMirror({
          previousUrgeAt,
          currentStreak: streakRow?.current_streak ?? 0,
          bestStreak: streakRow?.best_streak ?? 0,
          isFirstFew,
          patternSentence,
        });
      } catch (err) {
        console.error("[struggle] mirror load failed:", err);
        setMirror({
          previousUrgeAt: null,
          currentStreak: 0,
          bestStreak: 0,
          isFirstFew: true,
          patternSentence: null,
        });
      }
    },
    [context.logDate],
  );

  // Render -------------------------------------------------------------------

  if (!open || !portalTarget) return null;

  const interruption = habitId
    ? getInterruptionAction(habitId)
    : "Sta op. Adem.";

  const node = (
    <div
      className="fixed inset-0 z-[55]"
      role="dialog"
      aria-modal="true"
      aria-label="Interventie"
    >
      {/* Backdrop — blurs the dashboard underneath. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
      />

      {/* Soft ambient gradient — gives the overlay its own "focus mode" feel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.22), transparent 70%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(167,139,250,0.10), transparent 70%)",
        }}
      />

      <div className="lockd-overlay-enter relative mx-auto flex h-full w-full max-w-[430px] flex-col">
        {step === "entry" && (
          <EntryStep
            onContinue={handleEntryContinue}
            onClose={handleCloseRequest}
          />
        )}

        {step === "habit_pick" && (
          <HabitPickStep
            habits={context.habits}
            onSelect={handleHabitPick}
            onClose={handleCloseRequest}
          />
        )}

        {step === "trigger" && (
          <TriggerStep onSelect={handleTrigger} onClose={handleCloseRequest} />
        )}

        {step === "intensity" && (
          <IntensityStep
            onSelect={handleIntensity}
            onClose={handleCloseRequest}
          />
        )}

        {step === "mirror" && habitId && (
          <MirrorStep
            habitId={habitId}
            context={context}
            mirror={
              mirror ?? {
                previousUrgeAt: null,
                currentStreak: 0,
                bestStreak: 0,
                isFirstFew: true,
                patternSentence: null,
              }
            }
            onContinue={handleMirrorContinue}
            onClose={handleCloseRequest}
          />
        )}

        {step === "action" && (
          <ActionStep
            action={interruption}
            onStart={handleActionStart}
            onClose={handleCloseRequest}
          />
        )}

        {step === "timer" && (
          <TimerStep
            onComplete={handleTimerComplete}
            onClose={handleCloseRequest}
          />
        )}

        {step === "completion" && habitId && (
          <CompletionStep
            habitId={habitId}
            newStreakDays={newStreak}
            moneySavedPerDay={moneySavedPerDay}
            alreadyFailed={alreadyFailed}
            onDone={() => onClose()}
            onReflect={handleReflect}
          />
        )}

        {step === "reflection" && (
          <ReflectionStep
            saving={savingReflection}
            onSave={handleSaveReflection}
            onSkip={() => onClose()}
          />
        )}
      </div>

      {showCloseConfirm && (
        <CloseConfirmDialog
          onCancel={() => {
            setShowCloseConfirm(false);
            bumpIdle();
          }}
          onConfirm={handleConfirmClose}
        />
      )}
    </div>
  );

  // Helper to keep the `cn` import in use without producing warnings.
  void cn;
  return createPortal(node, portalTarget);
}

export default StruggleOverlay;

/** Reset the overlay state when it's re-opened. Wires to React's `key` prop. */
export function struggleKey(now: number): number {
  return now;
}
