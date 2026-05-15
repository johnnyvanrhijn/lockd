"use client";

import { useMemo, useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { BadHabitTile } from "@/components/badHabits/BadHabitTile";
import {
  DEFAULT_BAD_HABITS,
  EXTRA_BAD_HABITS,
  MAX_BAD_HABITS,
  getBadHabit,
} from "@/lib/badHabits/catalog";
import { cn } from "@/lib/utils/cn";

type Props = {
  total: number;
  current: number;
  focusHabits: string[];
  saving: boolean;
  onBack: () => void;
  onNext: (habits: string[]) => void;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn(
        "h-4 w-4 transition-transform duration-200",
        open && "rotate-180",
      )}
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepFocus({
  total,
  current,
  focusHabits,
  saving,
  onBack,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<string[]>(focusHabits);
  // Auto-open the extras section if any extra is already selected (e.g. when
  // the user returned via "Bewerk").
  const initiallyHasExtras = useMemo(
    () => focusHabits.some((id) => getBadHabit(id)?.isDefault === false),
    [focusHabits],
  );
  const [extrasOpen, setExtrasOpen] = useState(initiallyHasExtras);

  const atMax = selected.length >= MAX_BAD_HABITS;

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_BAD_HABITS) return prev;
      return [...prev, id];
    });
  }

  const canSubmit = selected.length > 0 && !saving;

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Jouw standaarden"
      title={
        <>
          Waar wil je meer{" "}
          <span className="text-purple-bright">controle</span> over?
        </>
      }
      subtitle="Kies maximaal 5 eigenschappen die je achter je wilt laten."
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
        <span
          className={cn(
            "text-[11px] tabular-nums",
            atMax ? "text-purple-bright" : "text-muted",
          )}
        >
          {selected.length}/{MAX_BAD_HABITS} geselecteerd
          {atMax && " — maximaal bereikt"}
        </span>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-2">
          {DEFAULT_BAD_HABITS.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const disabled = !isSelected && atMax;
            return (
              <BadHabitTile
                key={opt.id}
                title={opt.name}
                selected={isSelected}
                disabled={disabled}
                onClick={() => toggle(opt.id)}
              />
            );
          })}
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-surface/40">
          <button
            type="button"
            onClick={() => setExtrasOpen((v) => !v)}
            aria-expanded={extrasOpen}
            className={cn(
              "flex w-full items-center justify-between px-4 py-3.5",
              "text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60 rounded-[var(--radius-md)]",
            )}
          >
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                Meer eigenschappen
              </span>
              <span className="text-[11px] text-muted">
                {EXTRA_BAD_HABITS.length} extra opties
              </span>
            </span>
            <span className="text-muted">
              <ChevronIcon open={extrasOpen} />
            </span>
          </button>

          {extrasOpen && (
            <div className="border-t border-[var(--color-border)] px-3 pb-3 pt-3">
              <div className="grid grid-cols-2 gap-2">
                {EXTRA_BAD_HABITS.map((opt) => {
                  const isSelected = selected.includes(opt.id);
                  const disabled = !isSelected && atMax;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-disabled={disabled || undefined}
                      disabled={disabled}
                      onClick={() => toggle(opt.id)}
                      className={cn(
                        "flex items-center justify-between gap-2",
                        "rounded-[var(--radius-sm)] border px-3 py-2.5",
                        "text-left text-xs font-semibold",
                        "transition-all duration-200",
                        "active:scale-[0.98]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                        isSelected
                          ? [
                              "border-purple/60 bg-purple/10 text-foreground",
                              "shadow-[0_0_24px_-14px_var(--color-purple-glow)]",
                            ]
                          : [
                              "border-[var(--color-border)] bg-surface/60",
                              "text-foreground/85",
                              "hover:border-[var(--color-border-strong)]",
                            ],
                        disabled && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span className="truncate">{opt.name}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-purple-bright bg-purple-bright text-background"
                            : "border-[var(--color-border-strong)]",
                        )}
                      >
                        {isSelected && (
                          <svg
                            viewBox="0 0 10 10"
                            className="h-2.5 w-2.5"
                            fill="none"
                          >
                            <path
                              d="M2 5.2l1.8 1.8L8 2.8"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </OnboardingShell>
  );
}
