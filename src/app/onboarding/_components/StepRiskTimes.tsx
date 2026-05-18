"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { TIME_OPTIONS } from "@/lib/onboarding/options";

type Props = {
  total: number;
  current: number;
  riskTimes: string[];
  saving: boolean;
  onBack: () => void;
  onNext: (times: string[]) => void;
};

export function StepRiskTimes({
  total,
  current,
  riskTimes,
  saving,
  onBack,
  onNext,
}: Props) {
  const [times, setTimes] = useState<string[]>(riskTimes);

  function toggle(id: string) {
    setTimes((prev) =>
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
            · 1 / 2
          </span>
        </>
      }
      title={
        <>
          Wanneer is de neiging{" "}
          <span className="text-purple-bright">het sterkst</span>?
        </>
      }
      subtitle="Selecteer de momenten waarop het meestal speelt."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(times)}
            disabled={!canSubmit}
            loading={saving}
            fullWidth
          >
            Volgende
          </PrimaryButton>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2.5">
        {TIME_OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.id}
            title={opt.label}
            selected={times.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            className="min-h-[72px]"
          />
        ))}
      </div>
    </OnboardingShell>
  );
}
