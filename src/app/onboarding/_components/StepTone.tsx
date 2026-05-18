"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { TONE_OPTIONS } from "@/lib/onboarding/options";

type Tone = "soft" | "neutral" | "direct" | "confronting";

type Props = {
  total: number;
  current: number;
  toneOfVoice: Tone;
  saving: boolean;
  onBack: () => void;
  onNext: (tone: Tone) => void;
};

export function StepTone({
  total,
  current,
  toneOfVoice,
  saving,
  onBack,
  onNext,
}: Props) {
  const [tone, setTone] = useState<Tone>(toneOfVoice);

  const canSubmit = !saving;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow={
        <>
          Jouw ondersteuning{" "}
          <span className="font-normal normal-case tracking-normal text-muted/70">
            · 1 / 3
          </span>
        </>
      }
      title={
        <>
          Welke{" "}
          <span className="text-purple-bright">toon</span> werkt voor jou?
        </>
      }
      subtitle="Bepaalt hoe LOCKD met je praat op moeilijke momenten."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(tone)}
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
        {TONE_OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.id}
            title={opt.label}
            description={opt.description}
            selected={tone === opt.id}
            onClick={() => setTone(opt.id as Tone)}
            className="min-h-[88px]"
          />
        ))}
      </div>
    </OnboardingShell>
  );
}
