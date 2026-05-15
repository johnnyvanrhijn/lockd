"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableCard } from "@/components/ui/SelectableCard";

type Mode = "solo" | "buddies";

type Props = {
  total: number;
  current: number;
  mode: Mode;
  saving: boolean;
  onBack: () => void;
  onNext: (mode: Mode) => void;
};

function SoloIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BuddiesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="14" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 19c1-2.6 3.2-4 5.5-4s4.5 1.4 5.5 4M14 19c.6-1.6 2-2.5 3.5-2.5s2.9.9 3.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StepAccountability({
  total,
  current,
  mode,
  saving,
  onBack,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<Mode>(mode);

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Jouw accountability"
      title={
        <>
          Kies jouw{" "}
          <span className="text-purple-bright">accountability</span> niveau.
        </>
      }
      subtitle="Je doet dit voor jezelf, maar je hoeft het niet alleen te doen."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(selected)}
            loading={saving}
            disabled={saving}
            fullWidth
          >
            Volgende
          </PrimaryButton>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <SelectableCard
          icon={<SoloIcon />}
          title="Solo mode"
          description="Alles blijft privé. Alleen jij en LOCKD. AI coaching, persoonlijke inzichten, volledige focus op jouw groei."
          selected={selected === "solo"}
          onClick={() => setSelected("solo")}
        />
        <SelectableCard
          icon={<BuddiesIcon />}
          title="Accountability mode"
          description="Deel je strijd met 1-5 buddies die je steunen en accountable houden. Streaks, struggle signals en check-ins."
          selected={selected === "buddies"}
          onClick={() => setSelected("buddies")}
        />
      </div>
    </OnboardingShell>
  );
}
