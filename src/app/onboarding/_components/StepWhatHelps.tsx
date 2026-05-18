"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { SUPPORT_OPTIONS } from "@/lib/onboarding/options";

type Props = {
  total: number;
  current: number;
  supportModes: string[];
  saving: boolean;
  onBack: () => void;
  onNext: (modes: string[]) => void;
};

export function StepWhatHelps({
  total,
  current,
  supportModes,
  saving,
  onBack,
  onNext,
}: Props) {
  const [modes, setModes] = useState<string[]>(supportModes);

  function toggle(id: string) {
    setModes((prev) =>
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
          Jouw ondersteuning{" "}
          <span className="font-normal normal-case tracking-normal text-muted/70">
            · 2 / 3
          </span>
        </>
      }
      title={
        <>
          Wat{" "}
          <span className="text-purple-bright">helpt</span> jou door een urge?
        </>
      }
      subtitle="Kies alles wat voor jou werkt. Je kunt later bijsturen."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(modes)}
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
        {SUPPORT_OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.id}
            title={opt.label}
            selected={modes.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            className="min-h-[72px]"
          />
        ))}
      </div>
    </OnboardingShell>
  );
}
