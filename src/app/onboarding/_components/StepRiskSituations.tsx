"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { SITUATION_OPTIONS } from "@/lib/onboarding/options";

type Props = {
  total: number;
  current: number;
  riskSituations: string[];
  saving: boolean;
  onBack: () => void;
  onNext: (situations: string[]) => void;
};

export function StepRiskSituations({
  total,
  current,
  riskSituations,
  saving,
  onBack,
  onNext,
}: Props) {
  const [situations, setSituations] = useState<string[]>(riskSituations);

  function toggle(id: string) {
    setSituations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const canSubmit = !saving;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow={
        <>
          Jouw patroon{" "}
          <span className="font-normal normal-case tracking-normal text-muted/70">
            · 2 / 2
          </span>
        </>
      }
      title={
        <>
          In welke{" "}
          <span className="text-purple-bright">situaties</span> gebeurt het?
        </>
      }
      subtitle="Tap alles wat herkenbaar voelt."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(situations)}
            disabled={!canSubmit}
            loading={saving}
            fullWidth
          >
            Volgende
          </PrimaryButton>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        {SITUATION_OPTIONS.map((opt) => (
          <SelectableChip
            key={opt.id}
            selected={situations.includes(opt.id)}
            onClick={() => toggle(opt.id)}
          >
            {opt.label}
          </SelectableChip>
        ))}
      </div>
    </OnboardingShell>
  );
}
