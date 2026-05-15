"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { TIME_OPTIONS, SITUATION_OPTIONS } from "@/lib/onboarding/options";

type Props = {
  total: number;
  current: number;
  riskTimes: string[];
  riskSituations: string[];
  saving: boolean;
  onBack: () => void;
  onNext: (times: string[], situations: string[]) => void;
};

export function StepPatroon({
  total,
  current,
  riskTimes,
  riskSituations,
  saving,
  onBack,
  onNext,
}: Props) {
  const [times, setTimes] = useState<string[]>(riskTimes);
  const [situations, setSituations] = useState<string[]>(riskSituations);

  function toggleTime(id: string) {
    setTimes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleSituation(id: string) {
    setSituations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const canSubmit =
    (times.length > 0 || situations.length > 0) && !saving;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Jouw patroon"
      title={
        <>
          Wanneer gebeurt het{" "}
          <span className="text-purple-bright">meestal</span>?
        </>
      }
      subtitle="Beter begrijpen wanneer de neiging komt, helpt om eerder in te grijpen."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(times, situations)}
            disabled={!canSubmit}
            loading={saving}
            fullWidth
          >
            Volgende
          </PrimaryButton>
        </div>
      }
    >
      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Tijd van de dag
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {TIME_OPTIONS.map((opt) => (
            <SelectableCard
              key={opt.id}
              title={opt.label}
              selected={times.includes(opt.id)}
              onClick={() => toggleTime(opt.id)}
              className="min-h-[72px]"
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 pt-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Situaties
        </h2>
        <div className="flex flex-wrap gap-2">
          {SITUATION_OPTIONS.map((opt) => (
            <SelectableChip
              key={opt.id}
              selected={situations.includes(opt.id)}
              onClick={() => toggleSituation(opt.id)}
            >
              {opt.label}
            </SelectableChip>
          ))}
        </div>
      </section>
    </OnboardingShell>
  );
}
