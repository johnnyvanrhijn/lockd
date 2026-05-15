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
import {
  TOTAL_STEPS_BUDDIES,
  TOTAL_STEPS_SOLO,
} from "@/lib/onboarding/options";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { MobilePage } from "@/components/layout/MobilePage";

import { StepSplash } from "./_components/StepSplash";
import { StepFocus } from "./_components/StepFocus";
import { StepWaarom } from "./_components/StepWaarom";
import { StepPatroon } from "./_components/StepPatroon";
import { StepTriggers } from "./_components/StepTriggers";
import { StepSupport } from "./_components/StepSupport";
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
  desired_outcomes: string[];
  risk_times: string[];
  risk_situations: string[];
  triggers: string[];
  tone_of_voice: "soft" | "neutral" | "direct" | "confronting";
  support_modes: string[];
  active_intervention: boolean;
  accountability_mode: AccountabilityMode;
  privacy: CirclePrivacy;
};

/**
 * Pulls a user-friendly message out of anything thrown. Supabase
 * (PostgrestError) responses are plain objects with a `message` field,
 * not Error instances; native fetch errors are TypeError; the SDK
 * occasionally throws Error too. We try them all.
 */
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
  desired_outcomes: [],
  risk_times: [],
  risk_situations: [],
  triggers: [],
  tone_of_voice: "neutral",
  support_modes: [],
  active_intervention: true,
  accountability_mode: "solo",
  privacy: DEFAULT_PRIVACY,
};

function OnboardingFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const rawStep = Number(params.get("step") ?? "1");
  const requestedStep = Number.isFinite(rawStep)
    ? Math.max(1, Math.min(rawStep, 10))
    : 1;

  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Wrap a save+advance pair: surface errors instead of advancing silently.
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

      const [profileRes, responsesRes] = await Promise.all([
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

      setState({
        display_name: profile?.display_name ?? "",
        focus_habits: responses?.focus_habits ?? [],
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
      });
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const totalSteps = useMemo(
    () =>
      state.accountability_mode === "buddies"
        ? TOTAL_STEPS_BUDDIES
        : TOTAL_STEPS_SOLO,
    [state.accountability_mode],
  );

  // The summary step is the last one. For solo path, that's step 8; for
  // buddies it's step 10. Map the URL `step` to the displayed step.
  const step = Math.min(requestedStep, totalSteps);

  const goToStep = useCallback(
    (n: number) => {
      const safe = Math.max(1, Math.min(n, totalSteps));
      router.push(`/onboarding?step=${safe}`);
    },
    [router, totalSteps],
  );

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
    // Hard navigation forces the proxy to re-evaluate the session and
    // profile state with fresh cookies, sidestepping any client-router
    // timing issues where the proxy still sees onboarded_at = null.
    window.location.assign("/dashboard");
  }, []);

  const onBack = useCallback(() => {
    if (step > 1) goToStep(step - 1);
  }, [goToStep, step]);

  // Step handlers — each "advance" optimistically updates local state and
  // saves to Supabase, then routes forward. If the save throws (e.g.
  // network error, RLS rejection), runStep keeps us on the current step
  // and surfaces the error so the user can retry.
  const onSplashNext = useCallback(
    (display_name: string) =>
      runStep(async () => {
        await saveProfileDisplayName(display_name);
        setState((s) => ({ ...s, display_name }));
        goToStep(2);
      }),
    [goToStep, runStep, saveProfileDisplayName],
  );

  const onFocusNext = useCallback(
    (focus_habits: string[]) =>
      runStep(async () => {
        await saveResponses({ focus_habits });
        setState((s) => ({ ...s, focus_habits }));
        goToStep(3);
      }),
    [goToStep, runStep, saveResponses],
  );

  const onWaaromNext = useCallback(
    (desired_outcomes: string[]) =>
      runStep(async () => {
        await saveResponses({ desired_outcomes });
        setState((s) => ({ ...s, desired_outcomes }));
        goToStep(4);
      }),
    [goToStep, runStep, saveResponses],
  );

  const onPatroonNext = useCallback(
    (risk_times: string[], risk_situations: string[]) =>
      runStep(async () => {
        await saveResponses({ risk_times, risk_situations });
        setState((s) => ({ ...s, risk_times, risk_situations }));
        goToStep(5);
      }),
    [goToStep, runStep, saveResponses],
  );

  const onTriggersNext = useCallback(
    (triggers: string[]) =>
      runStep(async () => {
        await saveResponses({ triggers });
        setState((s) => ({ ...s, triggers }));
        goToStep(6);
      }),
    [goToStep, runStep, saveResponses],
  );

  const onSupportNext = useCallback(
    (
      tone_of_voice: OnboardingState["tone_of_voice"],
      support_modes: string[],
      active_intervention: boolean,
    ) =>
      runStep(async () => {
        await saveResponses({
          tone_of_voice,
          support_modes,
          active_intervention,
        });
        setState((s) => ({
          ...s,
          tone_of_voice,
          support_modes,
          active_intervention,
        }));
        goToStep(7);
      }),
    [goToStep, runStep, saveResponses],
  );

  const onAccountabilityNext = useCallback(
    (accountability_mode: AccountabilityMode) =>
      runStep(async () => {
        await saveResponses({ accountability_mode });
        setState((s) => ({ ...s, accountability_mode }));
        goToStep(8);
      }),
    [goToStep, runStep, saveResponses],
  );

  const onInviteNext = useCallback(() => {
    setSaveError(null);
    goToStep(9);
  }, [goToStep]);

  const onSignalsNext = useCallback(
    (privacy: CirclePrivacy) =>
      runStep(async () => {
        await savePrivacy(privacy);
        setState((s) => ({ ...s, privacy }));
        goToStep(10);
      }),
    [goToStep, runStep, savePrivacy],
  );

  const onComplete = useCallback(
    () =>
      runStep(async () => {
        await completeOnboarding();
      }),
    [completeOnboarding, runStep],
  );

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

  // Step routing
  const isBuddies = state.accountability_mode === "buddies";

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
      {node}
    </>
  );

  if (step === 1) {
    return wrap(
      <StepSplash
        total={totalSteps}
        current={1}
        displayName={state.display_name}
        saving={saving}
        onNext={onSplashNext}
      />
    );
  }
  if (step === 2) {
    return wrap(
      <StepFocus
        total={totalSteps}
        current={2}
        focusHabits={state.focus_habits}
        saving={saving}
        onBack={onBack}
        onNext={onFocusNext}
      />,
    );
  }
  if (step === 3) {
    return wrap(
      <StepWaarom
        total={totalSteps}
        current={3}
        desiredOutcomes={state.desired_outcomes}
        saving={saving}
        onBack={onBack}
        onNext={onWaaromNext}
      />,
    );
  }
  if (step === 4) {
    return wrap(
      <StepPatroon
        total={totalSteps}
        current={4}
        riskTimes={state.risk_times}
        riskSituations={state.risk_situations}
        saving={saving}
        onBack={onBack}
        onNext={onPatroonNext}
      />,
    );
  }
  if (step === 5) {
    return wrap(
      <StepTriggers
        total={totalSteps}
        current={5}
        triggers={state.triggers}
        saving={saving}
        onBack={onBack}
        onNext={onTriggersNext}
      />,
    );
  }
  if (step === 6) {
    return wrap(
      <StepSupport
        total={totalSteps}
        current={6}
        toneOfVoice={state.tone_of_voice}
        supportModes={state.support_modes}
        activeIntervention={state.active_intervention}
        saving={saving}
        onBack={onBack}
        onNext={onSupportNext}
      />,
    );
  }
  if (step === 7) {
    return wrap(
      <StepAccountability
        total={totalSteps}
        current={7}
        mode={state.accountability_mode}
        saving={saving}
        onBack={onBack}
        onNext={onAccountabilityNext}
      />,
    );
  }

  // Step 8: solo summary OR buddies invite
  if (step === 8) {
    if (isBuddies) {
      return wrap(
        <StepBuddyInvite
          total={totalSteps}
          current={8}
          onBack={onBack}
          onNext={onInviteNext}
        />,
      );
    }
    return wrap(
      <StepSummary
        total={totalSteps}
        current={8}
        state={state}
        saving={saving}
        onBack={onBack}
        onEditStep={goToStep}
        onComplete={onComplete}
      />,
    );
  }

  // Step 9 only exists for buddies path = signals
  if (step === 9 && isBuddies) {
    return wrap(
      <StepSignals
        total={totalSteps}
        current={9}
        privacy={state.privacy}
        saving={saving}
        onBack={onBack}
        onNext={onSignalsNext}
      />,
    );
  }

  // Step 10: buddies summary
  if (step === 10 && isBuddies) {
    return wrap(
      <StepSummary
        total={totalSteps}
        current={10}
        state={state}
        saving={saving}
        onBack={onBack}
        onEditStep={goToStep}
        onComplete={onComplete}
      />,
    );
  }

  // Fallback: out-of-range step → reset to 1
  goToStep(1);
  return null;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  );
}
