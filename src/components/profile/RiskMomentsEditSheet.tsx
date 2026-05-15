"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { TIME_OPTIONS, SITUATION_OPTIONS } from "@/lib/onboarding/options";

type Props = {
  initialTimes: string[];
  initialSituations: string[];
  saving: boolean;
  onClose: () => void;
  onSave: (next: { times: string[]; situations: string[] }) => void;
};

function CloseGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" aria-hidden>
      <path
        d="M2 5.2l1.8 1.8L8 2.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Composite editor for the "Risicomomenten" section: two multi-selects
 * (time-of-day + situation), exactly mirroring StepPatroon from onboarding.
 */
export function RiskMomentsEditSheet({
  initialTimes,
  initialSituations,
  saving,
  onClose,
  onSave,
}: Props) {
  const [times, setTimes] = useState<string[]>(initialTimes);
  const [situations, setSituations] = useState<string[]>(initialSituations);

  function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Bewerk risicomomenten"
    >
      <button
        type="button"
        aria-label="Sluit"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative flex w-full max-w-[430px] flex-col",
          "max-h-[85vh]",
          "rounded-t-[var(--radius-lg)] border-t border-[var(--color-border-strong)]",
          "bg-surface px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3",
          "shadow-[0_-20px_60px_-20px_rgba(139,92,246,0.35)]",
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-[var(--color-border-strong)]" />

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              Risicomomenten
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Wanneer en waar
            </h2>
          </div>
          <button
            type="button"
            aria-label="Sluit"
            onClick={onClose}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              "bg-surface-elevated text-muted",
              "hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            <CloseGlyph />
          </button>
        </div>

        <div className="mt-4 flex flex-1 flex-col gap-5 overflow-y-auto pb-3 pr-1">
          <Section title="Tijd">
            <div className="grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map((opt) => (
                <ChipButton
                  key={opt.id}
                  label={opt.label}
                  selected={times.includes(opt.id)}
                  onClick={() => setTimes((p) => toggle(p, opt.id))}
                />
              ))}
            </div>
          </Section>
          <Section title="Situaties">
            <div className="grid grid-cols-2 gap-2">
              {SITUATION_OPTIONS.map((opt) => (
                <ChipButton
                  key={opt.id}
                  label={opt.label}
                  selected={situations.includes(opt.id)}
                  onClick={() =>
                    setSituations((p) => toggle(p, opt.id))
                  }
                />
              ))}
            </div>
          </Section>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <GhostButton onClick={onClose} disabled={saving}>
            Annuleer
          </GhostButton>
          <PrimaryButton
            onClick={() => onSave({ times, situations })}
            loading={saving}
            disabled={saving}
            fullWidth
          >
            Opslaan
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        {title}
      </span>
      {children}
    </div>
  );
}

function ChipButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border px-3 py-2.5",
        "text-left text-xs font-semibold transition-all duration-200",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
        selected
          ? [
              "border-purple/60 bg-purple/10 text-foreground",
              "shadow-[0_0_22px_-14px_var(--color-purple-glow)]",
            ]
          : [
              "border-[var(--color-border)] bg-surface/60 text-foreground/85",
              "hover:border-[var(--color-border-strong)]",
            ],
      )}
    >
      <span className="truncate">{label}</span>
      <span
        aria-hidden
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
          selected
            ? "border-purple-bright bg-purple-bright text-background"
            : "border-[var(--color-border-strong)]",
        )}
      >
        {selected && <CheckIcon />}
      </span>
    </button>
  );
}

export default RiskMomentsEditSheet;
