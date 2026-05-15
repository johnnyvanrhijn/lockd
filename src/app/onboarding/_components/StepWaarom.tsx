"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { OUTCOME_OPTIONS } from "@/lib/onboarding/options";

type Props = {
  total: number;
  current: number;
  desiredOutcomes: string[];
  saving: boolean;
  onBack: () => void;
  onNext: (outcomes: string[]) => void;
};

export function StepWaarom({
  total,
  current,
  desiredOutcomes,
  saving,
  onBack,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<string[]>(desiredOutcomes);

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
      eyebrow="Jouw waarom"
      title={
        <>
          Wat wil je{" "}
          <span className="text-purple-bright">terugkrijgen</span>?
        </>
      }
      subtitle="Focus op wat je wilt opbouwen, niet alleen wat je wilt stoppen."
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
        {OUTCOME_OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.id}
            title={opt.label}
            selected={selected.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            className="min-h-[80px]"
          />
        ))}
      </div>
    </OnboardingShell>
  );
}
