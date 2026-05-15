"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
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

  const saveProfileDisplayName = useCallback(async (name: string) => {
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", userData.user.id);
  }, []);

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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      await supabase
        .from("onboarding_responses")
        .upsert({ user_id: userData.user.id, ...patch }, { onConflict: "user_id" });
    },
    [],
  );

  const savePrivacy = useCallback(async (privacy: CirclePrivacy) => {
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    await supabase
      .from("profiles")
      .update({ circle_privacy: privacy })
      .eq("id", userData.user.id);
  }, []);

  const completeOnboarding = useCallback(async () => {
    const supabase = getSupabaseClient();
    await supabase.rpc("complete_onboarding");
    router.push("/dashboard");
  }, [router]);

  const onBack = useCallback(() => {
    if (step > 1) goToStep(step - 1);
  }, [goToStep, step]);

  // Step handlers — each "advance" optimistically updates local state and
  // saves to Supabase, then routes forward.
  const onSplashNext = useCallback(
    async (display_name: string) => {
      setSaving(true);
      setState((s) => ({ ...s, display_name }));
      await saveProfileDisplayName(display_name);
      setSaving(false);
      goToStep(2);
    },
    [goToStep, saveProfileDisplayName],
  );

  const onFocusNext = useCallback(
    async (focus_habits: string[]) => {
      setSaving(true);
      setState((s) => ({ ...s, focus_habits }));
      await saveResponses({ focus_habits });
      setSaving(false);
      goToStep(3);
    },
    [goToStep, saveResponses],
  );

  const onWaaromNext = useCallback(
    async (desired_outcomes: string[]) => {
      setSaving(true);
      setState((s) => ({ ...s, desired_outcomes }));
      await saveResponses({ desired_outcomes });
      setSaving(false);
      goToStep(4);
    },
    [goToStep, saveResponses],
  );

  const onPatroonNext = useCallback(
    async (risk_times: string[], risk_situations: string[]) => {
      setSaving(true);
      setState((s) => ({ ...s, risk_times, risk_situations }));
      await saveResponses({ risk_times, risk_situations });
      setSaving(false);
      goToStep(5);
    },
    [goToStep, saveResponses],
  );

  const onTriggersNext = useCallback(
    async (triggers: string[]) => {
      setSaving(true);
      setState((s) => ({ ...s, triggers }));
      await saveResponses({ triggers });
      setSaving(false);
      goToStep(6);
    },
    [goToStep, saveResponses],
  );

  const onSupportNext = useCallback(
    async (
      tone_of_voice: OnboardingState["tone_of_voice"],
      support_modes: string[],
      active_intervention: boolean,
    ) => {
      setSaving(true);
      setState((s) => ({
        ...s,
        tone_of_voice,
        support_modes,
        active_intervention,
      }));
      await saveResponses({
        tone_of_voice,
        support_modes,
        active_intervention,
      });
      setSaving(false);
      goToStep(7);
    },
    [goToStep, saveResponses],
  );

  const onAccountabilityNext = useCallback(
    async (accountability_mode: AccountabilityMode) => {
      setSaving(true);
      setState((s) => ({ ...s, accountability_mode }));
      await saveResponses({ accountability_mode });
      setSaving(false);
      // Solo → step 8 (summary in solo numbering). Buddies → step 8 (invite).
      goToStep(8);
    },
    [goToStep, saveResponses],
  );

  const onInviteNext = useCallback(() => {
    // No state change; just advance.
    goToStep(9);
  }, [goToStep]);

  const onSignalsNext = useCallback(
    async (privacy: CirclePrivacy) => {
      setSaving(true);
      setState((s) => ({ ...s, privacy }));
      await savePrivacy(privacy);
      setSaving(false);
      goToStep(10);
    },
    [goToStep, savePrivacy],
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

  if (step === 1) {
    return (
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
    return (
      <StepFocus
        total={totalSteps}
        current={2}
        focusHabits={state.focus_habits}
        saving={saving}
        onBack={onBack}
        onNext={onFocusNext}
      />
    );
  }
  if (step === 3) {
    return (
      <StepWaarom
        total={totalSteps}
        current={3}
        desiredOutcomes={state.desired_outcomes}
        saving={saving}
        onBack={onBack}
        onNext={onWaaromNext}
      />
    );
  }
  if (step === 4) {
    return (
      <StepPatroon
        total={totalSteps}
        current={4}
        riskTimes={state.risk_times}
        riskSituations={state.risk_situations}
        saving={saving}
        onBack={onBack}
        onNext={onPatroonNext}
      />
    );
  }
  if (step === 5) {
    return (
      <StepTriggers
        total={totalSteps}
        current={5}
        triggers={state.triggers}
        saving={saving}
        onBack={onBack}
        onNext={onTriggersNext}
      />
    );
  }
  if (step === 6) {
    return (
      <StepSupport
        total={totalSteps}
        current={6}
        toneOfVoice={state.tone_of_voice}
        supportModes={state.support_modes}
        activeIntervention={state.active_intervention}
        saving={saving}
        onBack={onBack}
        onNext={onSupportNext}
      />
    );
  }
  if (step === 7) {
    return (
      <StepAccountability
        total={totalSteps}
        current={7}
        mode={state.accountability_mode}
        saving={saving}
        onBack={onBack}
        onNext={onAccountabilityNext}
      />
    );
  }

  // Step 8: solo summary OR buddies invite
  if (step === 8) {
    if (isBuddies) {
      return (
        <StepBuddyInvite
          total={totalSteps}
          current={8}
          onBack={onBack}
          onNext={onInviteNext}
        />
      );
    }
    return (
      <StepSummary
        total={totalSteps}
        current={8}
        state={state}
        saving={saving}
        onBack={onBack}
        onEditStep={goToStep}
        onComplete={completeOnboarding}
      />
    );
  }

  // Step 9 only exists for buddies path = signals
  if (step === 9 && isBuddies) {
    return (
      <StepSignals
        total={totalSteps}
        current={9}
        privacy={state.privacy}
        saving={saving}
        onBack={onBack}
        onNext={onSignalsNext}
      />
    );
  }

  // Step 10: buddies summary
  if (step === 10 && isBuddies) {
    return (
      <StepSummary
        total={totalSteps}
        current={10}
        state={state}
        saving={saving}
        onBack={onBack}
        onEditStep={goToStep}
        onComplete={completeOnboarding}
      />
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
