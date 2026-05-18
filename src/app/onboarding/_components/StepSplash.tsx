"use client";

import { useState, type FormEvent } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { TextField } from "@/components/ui/TextField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GlassCard } from "@/components/ui/GlassCard";

type Props = {
  total: number;
  current: number;
  displayName: string;
  saving: boolean;
  onNext: (displayName: string) => void;
};

function CompassGlyph() {
  return (
    <svg viewBox="0 0 96 96" className="h-24 w-24" fill="none" aria-hidden>
      <defs>
        <radialGradient id="compass-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="compass-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="40" fill="url(#compass-glow)" />
      <circle
        cx="48"
        cy="48"
        r="30"
        stroke="url(#compass-stroke)"
        strokeWidth="2.2"
        fill="rgba(139, 92, 246, 0.07)"
      />
      <path
        d="M48 28l5 17 17 5-17 5-5 17-5-17-17-5 17-5 5-17Z"
        fill="#A78BFA"
        opacity="0.85"
      />
      <circle cx="48" cy="48" r="3" fill="#10121A" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepSplash({
  total,
  current,
  displayName,
  saving,
  onNext,
}: Props) {
  const [name, setName] = useState(displayName);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onNext(trimmed);
  }

  const canSubmit = name.trim().length > 0 && !saving;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Welkom"
      title={
        <>
          Verandering begint op de momenten waarop je normaal{" "}
          <span className="text-purple-bright">toegeeft</span>.
        </>
      }
      subtitle="Laten we je patronen begrijpen zodat we kunnen helpen wanneer het echt telt."
      actions={
        <form onSubmit={onSubmit} className="flex flex-col gap-3 px-4 pb-2">
          <PrimaryButton
            type="submit"
            fullWidth
            disabled={!canSubmit}
            loading={saving}
          >
            Start setup
          </PrimaryButton>
        </form>
      }
      footer={
        <span className="text-[11px] text-muted">
          Duurt maar 2-4 minuten.
        </span>
      }
    >
      <div className="flex flex-col items-start gap-6">
        <div className="self-center">
          <CompassGlyph />
        </div>

        <form
          onSubmit={onSubmit}
          className="flex w-full flex-col gap-3"
        >
          <TextField
            label="Hoe mogen we je noemen?"
            placeholder="Bijvoorbeeld: Johnny"
            autoComplete="given-name"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </form>

        <GlassCard tone="elevated" padding="md" className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-purple/15 text-purple-bright"
          >
            <ShieldIcon />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              Dit is jouw ruimte.
            </span>
            <span className="text-xs text-muted">
              100% privé, zonder oordeel. Niemand ziet wat je deelt, behalve
              de buddies die je zelf kiest.
            </span>
          </div>
        </GlassCard>
      </div>
    </OnboardingShell>
  );
}
