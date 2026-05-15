"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { SUPPORT_OPTIONS, TONE_OPTIONS } from "@/lib/onboarding/options";

type Tone = "soft" | "neutral" | "direct" | "confronting";

type Props = {
  total: number;
  current: number;
  toneOfVoice: Tone;
  supportModes: string[];
  activeIntervention: boolean;
  saving: boolean;
  onBack: () => void;
  onNext: (
    tone: Tone,
    supportModes: string[],
    activeIntervention: boolean,
  ) => void;
};

export function StepSupport({
  total,
  current,
  toneOfVoice,
  supportModes,
  activeIntervention,
  saving,
  onBack,
  onNext,
}: Props) {
  const [tone, setTone] = useState<Tone>(toneOfVoice);
  const [modes, setModes] = useState<string[]>(supportModes);
  const [active, setActive] = useState<boolean>(activeIntervention);

  function toggleMode(id: string) {
    setModes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const canSubmit = !saving;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Jouw ondersteuning"
      title={
        <>
          Hoe wil jij{" "}
          <span className="text-purple-bright">geholpen</span> worden?
        </>
      }
      subtitle="Kies de aanpak en stijl die bij jou past. Je kunt dit later altijd aanpassen."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(tone, modes, active)}
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
          Tone of voice
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {TONE_OPTIONS.map((opt) => (
            <SelectableCard
              key={opt.id}
              title={opt.label}
              description={opt.description}
              selected={tone === opt.id}
              onClick={() => setTone(opt.id as Tone)}
              className="min-h-[80px]"
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 pt-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Wat helpt jou?
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {SUPPORT_OPTIONS.map((opt) => (
            <SelectableCard
              key={opt.id}
              title={opt.label}
              selected={modes.includes(opt.id)}
              onClick={() => toggleMode(opt.id)}
              className="min-h-[72px]"
            />
          ))}
        </div>
      </section>

      <section className="pt-4">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Extra ondersteuning
        </h2>
        <GlassCard padding="sm">
          <ToggleRow
            label="Actief ingrijpen bij risico-loop"
            description="LOCKD kan op risicomomenten zelf een interventie aanbieden in plaats van te wachten op jou."
            checked={active}
            onChange={setActive}
          />
        </GlassCard>
      </section>
    </OnboardingShell>
  );
}
