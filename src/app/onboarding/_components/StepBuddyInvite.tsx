"use client";

import { useEffect, useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { InviteLinkCard } from "@/components/onboarding/InviteLinkCard";
import { getSupabaseClient } from "@/lib/supabase/client";

type Props = {
  total: number;
  current: number;
  onBack: () => void;
  onNext: () => void;
};

export function StepBuddyInvite({ total, current, onBack, onNext }: Props) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc("ensure_my_invite_code");
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setCode(data ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://lockd.app";
  const inviteUrl = code ? `${origin}/invite/${code}` : "";

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Jouw circle"
      title={
        <>
          Je hoeft dit niet{" "}
          <span className="text-purple-bright">alleen</span> te doen.
        </>
      }
      subtitle="Deel je persoonlijke invite link met 1 tot 5 mensen die jou scherp houden. Kwaliteit boven kwantiteit."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack}>Terug</GhostButton>
          <PrimaryButton onClick={onNext} fullWidth>
            Volgende
          </PrimaryButton>
        </div>
      }
      footer={
        <button
          type="button"
          onClick={onNext}
          className="text-[11px] font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Buddies later toevoegen
        </button>
      }
    >
      {error ? (
        <GlassCard tone="danger" padding="md">
          <p className="text-sm text-danger">
            Kon je invite link niet aanmaken. {error}
          </p>
        </GlassCard>
      ) : code ? (
        <InviteLinkCard url={inviteUrl} />
      ) : (
        <LoadingSkeleton height="h-32" />
      )}

      <GlassCard tone="elevated" padding="md" className="mt-1">
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          Wat buddies wel zien
        </h3>
        <ul className="flex flex-col gap-1.5 text-xs text-muted">
          <li>• Je clean streaks en mijlpalen</li>
          <li>• Wanneer je struggle signaal afgeeft</li>
          <li>• Optioneel je dagelijkse check-ins</li>
        </ul>
        <h3 className="mb-2 mt-4 text-sm font-semibold text-foreground">
          Wat buddies niet zien
        </h3>
        <ul className="flex flex-col gap-1.5 text-xs text-muted">
          <li>• Je privé reflecties</li>
          <li>• Gesprekken met LOCKD AI</li>
          <li>• Details over triggers en urges</li>
        </ul>
      </GlassCard>
    </OnboardingShell>
  );
}
