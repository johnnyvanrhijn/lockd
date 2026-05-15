"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { HABIT_OPTIONS, MAX_FOCUS_HABITS } from "@/lib/onboarding/options";

type Props = {
  total: number;
  current: number;
  focusHabits: string[];
  saving: boolean;
  onBack: () => void;
  onNext: (habits: string[]) => void;
};

export function StepFocus({
  total,
  current,
  focusHabits,
  saving,
  onBack,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<string[]>(focusHabits);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_FOCUS_HABITS) return prev;
      return [...prev, id];
    });
  }

  const canSubmit = selected.length > 0 && !saving;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Jouw focus"
      title={
        <>
          Welke gewoontes wil je{" "}
          <span className="text-purple-bright">doorbreken</span>?
        </>
      }
      subtitle="Kies de gewoontes die je in de weg staan. Tussen 1 en 5."
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
          {selected.length}/{MAX_FOCUS_HABITS} geselecteerd
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-2.5">
        {HABIT_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const isAtMax = !isSelected && selected.length >= MAX_FOCUS_HABITS;
          return (
            <SelectableCard
              key={opt.id}
              title={opt.label}
              selected={isSelected}
              disabled={isAtMax}
              onClick={() => toggle(opt.id)}
              className="min-h-[88px]"
            />
          );
        })}
      </div>
    </OnboardingShell>
  );
}
