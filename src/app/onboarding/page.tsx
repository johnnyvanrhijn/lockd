"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { MobilePage } from "@/components/layout/MobilePage";
import type {
  AnswerValue,
  AnswersByQuestion,
} from "@/lib/badHabits/questions";
import { filterKnownHabits } from "@/lib/badHabits/catalog";

import { StepSplash } from "./_components/StepSplash";
import { StepFocus } from "./_components/StepFocus";
import { StepGoodHabits } from "./_components/StepGoodHabits";
import { StepHabitQuestions } from "./_components/StepHabitQuestions";
import { StepWaarom } from "./_components/StepWaarom";
import { StepRiskTimes } from "./_components/StepRiskTimes";
import { StepRiskSituations } from "./_components/StepRiskSituations";
import { StepTriggers } from "./_components/StepTriggers";
import { StepTone } from "./_components/StepTone";
import { StepWhatHelps } from "./_components/StepWhatHelps";
import { StepActiveIntervention } from "./_components/StepActiveIntervention";
import { StepAccountability } from "./_components/StepAccountability";
import { StepBuddyInvite } from "./_components/StepBuddyInvite";
import { StepSignals } from "./_components/StepSignals";
import { StepSummary } from "./_components/StepSummary";

export type AccountabilityMode = "solo" | "buddies";

export type CirclePrivacy = {
  showStreaks: boolean;
  showStruggle: boolean;
  showConsistency: boolean;
  setbackAlerts: boolean;
  checkinRequests: boolean;
  emergencyAfterDays: number | null;
};

export type OnboardingState = {
  display_name: string;
  focus_habits: string[];
  /** Good-habit IDs picked between Focus and habit-questions. ≤ 3. */
  focus_good_habits: string[];
  desired_outcomes: string[];
  risk_times: string[];
  risk_situations: string[];
  triggers: string[];
  tone_of_voice: "soft" | "neutral" | "direct" | "confronting";
  support_modes: string[];
  active_intervention: boolean;
  accountability_mode: AccountabilityMode;
  privacy: CirclePrivacy;
  /** All loaded user_habit_answers, keyed by habit_id. */
  habit_answers: Record<string, AnswersByQuestion>;
};

// Legacy step numbers (one-decision-per-screen):
//   1 splash · 2 focus · 3 waarom · 4 risk-times · 5 risk-situations ·
//   6 triggers · 7 tone · 8 what-helps · 9 active-intervention ·
//   10 accountability · 11 summary/invite · 12 signals (buddies) ·
//   13 summary (buddies)
// Between Focus (legacy 2) and Waarom (legacy 3) we inject:
//   actual 3                    : StepGoodHabits (one screen, always present)
//   actual 4..3+habitCount      : StepHabitQuestions (one per focus_habit)
// All legacy steps from 3 onward shift down by `habitCount + 1` actual slots.
const LEGACY_TOTAL_SOLO = 11;
const LEGACY_TOTAL_BUDDIES = 13;
const GOOD_HABITS_STEP = 3; // actual step number of the good-habits screen
const FIRST_HABIT_STEP = 4; // actual step number of first habit-question screen

function extractErrorMessage(err: unknown): string {
  if (!err) return "Onbekende fout. Probeer opnieuw.";
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const obj = err as Record<string, unknown>;
    const candidates = [obj.message, obj.error_description, obj.details, obj.hint, obj.code];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c;
    }
  }
  return "Onbekende fout. Probeer opnieuw.";
}

const DEFAULT_PRIVACY: CirclePrivacy = {
  showStreaks: true,
  showStruggle: true,
  showConsistency: true,
  setbackAlerts: true,
  checkinRequests: true,
  emergencyAfterDays: null,
};

const DEFAULT_STATE: OnboardingState = {
  display_name: "",
  focus_habits: [],
  focus_good_habits: [],
  desired_outcomes: [],
  risk_times: [],
  risk_situations: [],
  triggers: [],
  tone_of_voice: "neutral",
  support_modes: [],
  active_intervention: true,
  accountability_mode: "solo",
  privacy: DEFAULT_PRIVACY,
  habit_answers: {},
};

function OnboardingFlow() {
  const router = useRouter();
  const params = useSearchParams();

  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const habitCount = state.focus_habits.length;
  const isBuddies = state.accountability_mode === "buddies";
  const legacyTotal = isBuddies ? LEGACY_TOTAL_BUDDIES : LEGACY_TOTAL_SOLO;
  // +1 for the always-present GoodHabits screen between Focus and habits.
  const totalSteps = legacyTotal + habitCount + 1;

  // URL step is clamped to total. Sequence:
  //   1: Splash
  //   2: Focus
  //   3: GoodHabits
  //   4..3+habitCount: habit-question screens
  //   4+habitCount..legacyTotal+habitCount+1: legacy steps shifted
  const rawStep = Number(params.get("step") ?? "1");
  const requestedStep = Number.isFinite(rawStep)
    ? Math.max(1, Math.min(rawStep, totalSteps))
    : 1;
  const step = Math.min(requestedStep, totalSteps);

  /** Convert an actual URL step number to its position in the flow. */
  function actualToLegacy(actual: number): {
    legacy: number | null;
    habitIndex: number | null;
    isGoodHabits: boolean;
  } {
    if (actual <= 2)
      return { legacy: actual, habitIndex: null, isGoodHabits: false };
    if (actual === GOOD_HABITS_STEP)
      return { legacy: null, habitIndex: null, isGoodHabits: true };
    const habitEnd = GOOD_HABITS_STEP + habitCount;
    if (actual <= habitEnd)
      return {
        legacy: null,
        habitIndex: actual - FIRST_HABIT_STEP,
        isGoodHabits: false,
      };
    // Legacy 3+ shifted down by (habitCount + 1).
    return {
      legacy: actual - habitCount - 1,
      habitIndex: null,
      isGoodHabits: false,
    };
  }

  const goToActualStep = useCallback(
    (n: number) => {
      const safe = Math.max(1, Math.min(n, totalSteps));
      router.push(`/onboarding?step=${safe}`);
    },
    [router, totalSteps],
  );

  /** Move to the next "logical" position after a legacy step finishes. */
  const goToLegacyStep = useCallback(
    (legacy: number) => {
      if (legacy <= 2) {
        goToActualStep(legacy);
        return;
      }
      // Legacy 3+ shifted up by (habitCount + 1) to account for the
      // GoodHabits screen + habit-question screens.
      goToActualStep(legacy + habitCount + 1);
    },
    [goToActualStep, habitCount],
  );

  const runStep = useCallback(async (work: () => Promise<void>) => {
    setSaveError(null);
    setSaving(true);
    try {
      await work();
    } catch (err) {
      console.error("[onboarding] step save failed:", err);
      setSaveError(extractErrorMessage(err));
      setSaving(false);
      return;
    }
    setSaving(false);
  }, []);

  // Load existing data on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const [profileRes, responsesRes, answersRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, circle_privacy")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("onboarding_responses")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_habit_answers")
          .select("habit_id, question_id, answer")
          .eq("user_id", user.id),
      ]);

      if (cancelled) return;

      const profile = profileRes.data;
      const responses = responsesRes.data;
      const rawPrivacy = (profile?.circle_privacy ?? null) as
        | Partial<CirclePrivacy>
        | null;
      const privacy: CirclePrivacy = {
        ...DEFAULT_PRIVACY,
        ...(rawPrivacy ?? {}),
      };

      const answersByHabit: Record<string, AnswersByQuestion> = {};
      for (const row of answersRes.data ?? []) {
        const habit = row.habit_id;
        if (!answersByHabit[habit]) answersByHabit[habit] = {};
        answersByHabit[habit][row.question_id] = row.answer as AnswerValue;
      }

      setState({
        display_name: profile?.display_name ?? "",
        focus_habits: filterKnownHabits(responses?.focus_habits ?? []),
        focus_good_habits: filterKnownHabits(
          (responses as { focus_good_habits?: string[] } | null)
            ?.focus_good_habits ?? [],
        ),
        desired_outcomes: responses?.desired_outcomes ?? [],
        risk_times: responses?.risk_times ?? [],
        risk_situations: responses?.risk_situations ?? [],
        triggers: responses?.triggers ?? [],
        tone_of_voice:
          (responses?.tone_of_voice as OnboardingState["tone_of_voice"]) ??
          "neutral",
        support_modes: responses?.support_modes ?? [],
        active_intervention: responses?.active_intervention ?? true,
        accountability_mode:
          (responses?.accountability_mode as AccountabilityMode) ?? "solo",
        privacy,
        habit_answers: answersByHabit,
      });
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const requireUserId = useCallback(async (): Promise<string> => {
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("Niet ingelogd. Vernieuwen en opnieuw inloggen.");
    }
    return userData.user.id;
  }, []);

  const saveProfileDisplayName = useCallback(
    async (name: string) => {
      const supabase = getSupabaseClient();
      const userId = await requireUserId();
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: name })
        .eq("id", userId);
      if (error) throw error;
    },
    [requireUserId],
  );

  const saveResponses = useCallback(
    async (
      patch: Partial<{
        focus_habits: string[];
        focus_good_habits: string[];
        desired_outcomes: string[];
        risk_times: string[];
        risk_situations: string[];
        triggers: string[];
        tone_of_voice: string;
        support_modes: string[];
        active_intervention: boolean;
        accountability_mode: AccountabilityMode;
      }>,
    ) => {
      const supabase = getSupabaseClient();
      const userId = await requireUserId();
      const { error } = await supabase
        .from("onboarding_responses")
        .upsert(
          { user_id: userId, ...patch },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    },
    [requireUserId],
  );

  const savePrivacy = useCallback(
    async (privacy: CirclePrivacy) => {
      const supabase = getSupabaseClient();
      const userId = await requireUserId();
      const { error } = await supabase
        .from("profiles")
        .update({ circle_privacy: privacy })
        .eq("id", userId);
      if (error) throw error;
    },
    [requireUserId],
  );

  const completeOnboarding = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc("complete_onboarding");
    if (error) throw error;
    window.location.assign("/dashboard");
  }, []);

  const onBack = useCallback(() => {
    if (step > 1) goToActualStep(step - 1);
  }, [goToActualStep, step]);

  const onSplashNext = useCallback(
    (display_name: string) =>
      runStep(async () => {
        await saveProfileDisplayName(display_name);
        setState((s) => ({ ...s, display_name }));
        goToActualStep(2);
      }),
    [goToActualStep, runStep, saveProfileDisplayName],
  );

  const onFocusNext = useCallback(
    (focus_habits: string[]) =>
      runStep(async () => {
        // Sync user_bad_habits with the current selection (bad habits only).
        // The good-habits step will sync again with the combined list.
        const supabase = getSupabaseClient();
        const { error: syncErr } = await supabase.rpc("sync_user_bad_habits", {
          p_habit_ids: focus_habits,
        });
        if (syncErr) throw syncErr;
        await saveResponses({ focus_habits });
        setState((s) => ({ ...s, focus_habits }));
        // Move to the good-habits step.
        goToActualStep(GOOD_HABITS_STEP);
      }),
    [goToActualStep, runStep, saveResponses],
  );

  /**
   * Good-habits step: persist the selection, expand user_bad_habits to the
   * combined (bad + good) active set, then advance to the first habit-question
   * screen if any bad habits are selected, otherwise to Waarom.
   */
  const onGoodHabitsNext = useCallback(
    (focus_good_habits: string[]) =>
      runStep(async () => {
        const supabase = getSupabaseClient();
        const combined = [...state.focus_habits, ...focus_good_habits];
        const { error: syncErr } = await supabase.rpc("sync_user_bad_habits", {
          p_habit_ids: combined,
        });
        if (syncErr) throw syncErr;
        await saveResponses({ focus_good_habits });
        setState((s) => ({ ...s, focus_good_habits }));
        if (state.focus_habits.length > 0) {
          goToActualStep(FIRST_HABIT_STEP);
        } else {
          goToLegacyStep(3);
        }
      }),
    [
      goToActualStep,
      goToLegacyStep,
      runStep,
      saveResponses,
      state.focus_habits,
    ],
  );

  /**
   * Habit-question step: save the user's answers for this habit, then advance
   * to either the next habit or — if this is the last — to the first legacy
   * step after Focus (Waarom).
   */
  const onHabitQuestionsNext = useCallback(
    (habitIndex: number, answers: AnswersByQuestion) =>
      runStep(async () => {
        const habitId = state.focus_habits[habitIndex];
        if (!habitId) {
          // Should not happen — focus_habits length drives this index.
          goToActualStep(FIRST_HABIT_STEP);
          return;
        }
        const supabase = getSupabaseClient();
        const { error } = await supabase.rpc("save_habit_answers", {
          p_habit_id: habitId,
          p_answers: answers as Record<string, AnswerValue>,
        });
        if (error) throw error;

        setState((s) => ({
          ...s,
          habit_answers: {
            ...s.habit_answers,
            [habitId]: answers,
          },
        }));

        const isLastHabit = habitIndex >= state.focus_habits.length - 1;
        if (isLastHabit) {
          // Move to first legacy step after Focus = Waarom (legacy 3).
          goToLegacyStep(3);
        } else {
          goToActualStep(FIRST_HABIT_STEP + habitIndex + 1);
        }
      }),
    [goToActualStep, goToLegacyStep, runStep, state.focus_habits],
  );

  const onWaaromNext = useCallback(
    (desired_outcomes: string[]) =>
      runStep(async () => {
        await saveResponses({ desired_outcomes });
        setState((s) => ({ ...s, desired_outcomes }));
        goToLegacyStep(4);
      }),
    [goToLegacyStep, runStep, saveResponses],
  );

  const onRiskTimesNext = useCallback(
    (risk_times: string[]) =>
      runStep(async () => {
        await saveResponses({ risk_times });
        setState((s) => ({ ...s, risk_times }));
        goToLegacyStep(5);
      }),
    [goToLegacyStep, runStep, saveResponses],
  );

  const onRiskSituationsNext = useCallback(
    (risk_situations: string[]) =>
      runStep(async () => {
        await saveResponses({ risk_situations });
        setState((s) => ({ ...s, risk_situations }));
        goToLegacyStep(6);
      }),
    [goToLegacyStep, runStep, saveResponses],
  );

  const onTriggersNext = useCallback(
    (triggers: string[]) =>
      runStep(async () => {
        await saveResponses({ triggers });
        setState((s) => ({ ...s, triggers }));
        goToLegacyStep(7);
      }),
    [goToLegacyStep, runStep, saveResponses],
  );

  const onToneNext = useCallback(
    (tone_of_voice: OnboardingState["tone_of_voice"]) =>
      runStep(async () => {
        await saveResponses({ tone_of_voice });
        setState((s) => ({ ...s, tone_of_voice }));
        goToLegacyStep(8);
      }),
    [goToLegacyStep, runStep, saveResponses],
  );

  const onWhatHelpsNext = useCallback(
    (support_modes: string[]) =>
      runStep(async () => {
        await saveResponses({ support_modes });
        setState((s) => ({ ...s, support_modes }));
        goToLegacyStep(9);
      }),
    [goToLegacyStep, runStep, saveResponses],
  );

  const onActiveInterventionNext = useCallback(
    (active_intervention: boolean) =>
      runStep(async () => {
        await saveResponses({ active_intervention });
        setState((s) => ({ ...s, active_intervention }));
        goToLegacyStep(10);
      }),
    [goToLegacyStep, runStep, saveResponses],
  );

  const onAccountabilityNext = useCallback(
    (accountability_mode: AccountabilityMode) =>
      runStep(async () => {
        await saveResponses({ accountability_mode });
        setState((s) => ({ ...s, accountability_mode }));
        goToLegacyStep(11);
      }),
    [goToLegacyStep, runStep, saveResponses],
  );

  const onInviteNext = useCallback(() => {
    setSaveError(null);
    goToLegacyStep(12);
  }, [goToLegacyStep]);

  const onSignalsNext = useCallback(
    (privacy: CirclePrivacy) =>
      runStep(async () => {
        await savePrivacy(privacy);
        setState((s) => ({ ...s, privacy }));
        goToLegacyStep(13);
      }),
    [goToLegacyStep, runStep, savePrivacy],
  );

  const onComplete = useCallback(
    () =>
      runStep(async () => {
        await completeOnboarding();
      }),
    [completeOnboarding, runStep],
  );

  // Summary "edit step" buttons: receive a legacy step number.
  const onEditStep = useCallback(
    (legacy: number) => goToLegacyStep(legacy),
    [goToLegacyStep],
  );

  const resolved = useMemo(() => actualToLegacy(step), [step, habitCount]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded) {
    return (
      <MobilePage>
        <div className="flex flex-col gap-4 pt-12">
          <LoadingSkeleton height="h-8" width="w-2/3" />
          <LoadingSkeleton height="h-6" width="w-1/2" />
          <div className="mt-6 flex flex-col gap-3">
            <LoadingSkeleton height="h-16" />
            <LoadingSkeleton height="h-16" />
            <LoadingSkeleton height="h-16" />
          </div>
        </div>
      </MobilePage>
    );
  }

  const errorToast = saveError ? (
    <div
      role="alert"
      className="pointer-events-none fixed inset-x-0 top-[max(env(safe-area-inset-top),0.75rem)] z-50 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-[var(--radius-md)] border border-danger/40 bg-danger/15 px-4 py-3 backdrop-blur-xl">
        <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-danger" />
        <p className="text-xs leading-relaxed text-danger">{saveError}</p>
        <button
          type="button"
          onClick={() => setSaveError(null)}
          aria-label="Sluit melding"
          className="-mr-1 text-danger/70 hover:text-danger"
        >
          ×
        </button>
      </div>
    </div>
  ) : null;

  const wrap = (node: ReactNode) => (
    <>
      {errorToast}
      <div key={step} className="lockd-step-enter">
        {node}
      </div>
    </>
  );

  // ----------------- GOOD-HABITS SCREEN -----------------
  if (resolved.isGoodHabits) {
    return wrap(
      <StepGoodHabits
        total={totalSteps}
        current={step}
        focusBadHabits={state.focus_habits}
        focusGoodHabits={state.focus_good_habits}
        saving={saving}
        onBack={onBack}
        onNext={onGoodHabitsNext}
      />,
    );
  }

  // ----------------- HABIT-QUESTION SCREENS -----------------
  if (resolved.habitIndex !== null) {
    const idx = resolved.habitIndex;
    const habitId = state.focus_habits[idx];
    if (!habitId) {
      // Range mismatch (focus_habits got smaller mid-session). Send back to focus.
      goToActualStep(2);
      return null;
    }
    return wrap(
      <StepHabitQuestions
        key={habitId}
        total={totalSteps}
        current={step}
        habitId={habitId}
        habitIndex={idx + 1}
        habitCount={habitCount}
        initialAnswers={state.habit_answers[habitId] ?? {}}
        saving={saving}
        onBack={onBack}
        onNext={(answers) => onHabitQuestionsNext(idx, answers)}
        onSkip={(defaults) => onHabitQuestionsNext(idx, defaults)}
      />,
    );
  }

  // ----------------- LEGACY SCREENS -----------------
  const legacy = resolved.legacy ?? 1;

  if (legacy === 1) {
    return wrap(
      <StepSplash
        total={totalSteps}
        current={step}
        displayName={state.display_name}
        saving={saving}
        onNext={onSplashNext}
      />,
    );
  }
  if (legacy === 2) {
    return wrap(
      <StepFocus
        total={totalSteps}
        current={step}
        focusHabits={state.focus_habits}
        saving={saving}
        onBack={onBack}
        onNext={onFocusNext}
      />,
    );
  }
  if (legacy === 3) {
    return wrap(
      <StepWaarom
        total={totalSteps}
        current={step}
        desiredOutcomes={state.desired_outcomes}
        saving={saving}
        onBack={onBack}
        onNext={onWaaromNext}
      />,
    );
  }
  if (legacy === 4) {
    return wrap(
      <StepRiskTimes
        total={totalSteps}
        current={step}
        riskTimes={state.risk_times}
        saving={saving}
        onBack={onBack}
        onNext={onRiskTimesNext}
      />,
    );
  }
  if (legacy === 5) {
    return wrap(
      <StepRiskSituations
        total={totalSteps}
        current={step}
        riskSituations={state.risk_situations}
        saving={saving}
        onBack={onBack}
        onNext={onRiskSituationsNext}
      />,
    );
  }
  if (legacy === 6) {
    return wrap(
      <StepTriggers
        total={totalSteps}
        current={step}
        triggers={state.triggers}
        saving={saving}
        onBack={onBack}
        onNext={onTriggersNext}
      />,
    );
  }
  if (legacy === 7) {
    return wrap(
      <StepTone
        total={totalSteps}
        current={step}
        toneOfVoice={state.tone_of_voice}
        saving={saving}
        onBack={onBack}
        onNext={onToneNext}
      />,
    );
  }
  if (legacy === 8) {
    return wrap(
      <StepWhatHelps
        total={totalSteps}
        current={step}
        supportModes={state.support_modes}
        saving={saving}
        onBack={onBack}
        onNext={onWhatHelpsNext}
      />,
    );
  }
  if (legacy === 9) {
    return wrap(
      <StepActiveIntervention
        total={totalSteps}
        current={step}
        activeIntervention={state.active_intervention}
        saving={saving}
        onBack={onBack}
        onNext={onActiveInterventionNext}
      />,
    );
  }
  if (legacy === 10) {
    return wrap(
      <StepAccountability
        total={totalSteps}
        current={step}
        mode={state.accountability_mode}
        saving={saving}
        onBack={onBack}
        onNext={onAccountabilityNext}
      />,
    );
  }

  if (legacy === 11) {
    if (isBuddies) {
      return wrap(
        <StepBuddyInvite
          total={totalSteps}
          current={step}
          onBack={onBack}
          onNext={onInviteNext}
        />,
      );
    }
    return wrap(
      <StepSummary
        total={totalSteps}
        current={step}
        state={state}
        saving={saving}
        onBack={onBack}
        onEditStep={onEditStep}
        onComplete={onComplete}
      />,
    );
  }

  if (legacy === 12 && isBuddies) {
    return wrap(
      <StepSignals
        total={totalSteps}
        current={step}
        privacy={state.privacy}
        saving={saving}
        onBack={onBack}
        onNext={onSignalsNext}
      />,
    );
  }

  if (legacy === 13 && isBuddies) {
    return wrap(
      <StepSummary
        total={totalSteps}
        current={step}
        state={state}
        saving={saving}
        onBack={onBack}
        onEditStep={onEditStep}
        onComplete={onComplete}
      />,
    );
  }

  // Fallback: out-of-range step → reset to 1
  goToActualStep(1);
  return null;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  );
}
