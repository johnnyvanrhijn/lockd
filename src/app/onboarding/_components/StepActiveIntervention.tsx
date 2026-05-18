"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ToggleRow } from "@/components/ui/ToggleRow";

type Props = {
  total: number;
  current: number;
  activeIntervention: boolean;
  saving: boolean;
  onBack: () => void;
  onNext: (active: boolean) => void;
};

export function StepActiveIntervention({
  total,
  current,
  activeIntervention,
  saving,
  onBack,
  onNext,
}: Props) {
  const [active, setActive] = useState<boolean>(activeIntervention);

  const canSubmit = !saving;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow={
        <>
          Jouw ondersteuning{" "}
          <span className="font-normal normal-case tracking-normal text-muted/70">
            · 3 / 3
          </span>
        </>
      }
      title={
        <>
          Mag LOCKD{" "}
          <span className="text-purple-bright">zelf ingrijpen</span>?
        </>
      }
      subtitle="Bij risicomomenten kan LOCKD je proactief een interventie aanbieden, in plaats van te wachten tot jij erom vraagt."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(active)}
            disabled={!canSubmit}
            loading={saving}
            fullWidth
          >
            Volgende
          </PrimaryButton>
        </div>
      }
    >
      <GlassCard padding="md">
        <ToggleRow
          label="Actief ingrijpen bij risico-loop"
          description="Krijg een nudge op het moment dat je patroon waarschijnlijk losslaat — niet pas achteraf."
          checked={active}
          onChange={setActive}
        />
      </GlassCard>
    </OnboardingShell>
  );
}
