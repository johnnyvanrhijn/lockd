"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { cn } from "@/lib/utils/cn";

type Privacy = {
  showStreaks: boolean;
  showStruggle: boolean;
  showConsistency: boolean;
  setbackAlerts: boolean;
  checkinRequests: boolean;
  emergencyAfterDays: number | null;
};

type Props = {
  total: number;
  current: number;
  privacy: Privacy;
  saving: boolean;
  onBack: () => void;
  onNext: (privacy: Privacy) => void;
};

const DAY_OPTIONS = [1, 2, 3, 5, 7];

export function StepSignals({
  total,
  current,
  privacy,
  saving,
  onBack,
  onNext,
}: Props) {
  const [p, setP] = useState<Privacy>(privacy);

  const set = <K extends keyof Privacy>(k: K, v: Privacy[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const emergencyEnabled = p.emergencyAfterDays !== null;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Buddy signalen"
      title={
        <>
          Welke signalen mogen buddies{" "}
          <span className="text-purple-bright">zien</span>?
        </>
      }
      subtitle="Jij bepaalt wat je deelt. Je kunt dit altijd aanpassen."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(p)}
            disabled={saving}
            loading={saving}
            fullWidth
          >
            Opslaan en doorgaan
          </PrimaryButton>
        </div>
      }
    >
      <GlassCard padding="sm">
        <div className="flex flex-col divide-y divide-[var(--color-border)]">
          <ToggleRow
            label="Mijn streaks"
            description="Huidige clean streak en langste streak"
            checked={p.showStreaks}
            onChange={(v) => set("showStreaks", v)}
          />
          <ToggleRow
            label="Wanneer ik struggle"
            description="Ze krijgen een seintje als ik het zwaar heb"
            checked={p.showStruggle}
            onChange={(v) => set("showStruggle", v)}
          />
          <ToggleRow
            label="Dagelijkse consistency"
            description="Of ik mijn check-ins op tijd doe"
            checked={p.showConsistency}
            onChange={(v) => set("showConsistency", v)}
          />
          <ToggleRow
            label="Terugval meldingen"
            description="Bij een relapse krijgen ze een melding"
            checked={p.setbackAlerts}
            onChange={(v) => set("setbackAlerts", v)}
          />
          <ToggleRow
            label="Check-in requests"
            description="Buddies mogen jou een check-in vraag sturen"
            checked={p.checkinRequests}
            onChange={(v) => set("checkinRequests", v)}
          />
        </div>
      </GlassCard>

      <GlassCard
        tone={emergencyEnabled ? "danger" : "default"}
        padding="md"
        className="mt-1"
      >
        <div className="flex flex-col gap-3">
          <ToggleRow
            label="Emergency support"
            description="Stuur een noodsignaal naar je buddies als ik meerdere dagen achter elkaar struggle."
            checked={emergencyEnabled}
            onChange={(v) =>
              set("emergencyAfterDays", v ? (p.emergencyAfterDays ?? 3) : null)
            }
          />
          {emergencyEnabled && (
            <div className="flex flex-col gap-2 pl-1 pt-1">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
                Aanbieden na
              </span>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set("emergencyAfterDays", d)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70",
                      p.emergencyAfterDays === d
                        ? "border-danger/60 bg-danger/15 text-danger"
                        : "border-[var(--color-border-strong)] text-muted hover:text-foreground hover:border-purple/60",
                    )}
                  >
                    {d} dag{d === 1 ? "" : "en"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </OnboardingShell>
  );
}
