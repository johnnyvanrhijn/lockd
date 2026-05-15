"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { TRIGGER_OPTIONS } from "@/lib/onboarding/options";

type Props = {
  total: number;
  current: number;
  triggers: string[];
  saving: boolean;
  onBack: () => void;
  onNext: (triggers: string[]) => void;
};

export function StepTriggers({
  total,
  current,
  triggers,
  saving,
  onBack,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<string[]>(triggers);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const canSubmit = selected.length > 0 && !saving;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Jouw triggers"
      title={
        <>
          Wat gebeurt er meestal{" "}
          <span className="text-purple-bright">vóór</span> de urge?
        </>
      }
      subtitle="Triggers zijn de signalen die jou voorbereiden op de neiging. Hoe beter we ze kennen, hoe eerder we kunnen helpen."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(selected)}
            disabled={!canSubmit}
            loading={saving}
            fullWidth
          >
            Volgende
          </PrimaryButton>
        </div>
      }
      footer={
        <span className="text-[11px] text-muted">
          {selected.length} geselecteerd
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-2.5">
        {TRIGGER_OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.id}
            title={opt.label}
            selected={selected.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            className="min-h-[72px]"
          />
        ))}
      </div>
    </OnboardingShell>
  );
}
