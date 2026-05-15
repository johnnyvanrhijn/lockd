"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { BadHabitTile } from "@/components/badHabits/BadHabitTile";
import { getHabitIcon } from "@/components/badHabits/HabitIcons";
import {
  DEFAULT_BAD_HABITS,
  EXTRA_BAD_HABITS,
  MAX_BAD_HABITS,
  getBadHabit,
} from "@/lib/badHabits/catalog";

type Props = {
  /** The user's currently active habit_ids. */
  initialSelected: string[];
  saving: boolean;
  onClose: () => void;
  /** Called with the new full active list (atomic replacement). */
  onSave: (next: string[]) => void;
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

/**
 * Bottom-sheet that mirrors the onboarding 4×4 grid + extras dropdown, but
 * pre-seeded with the user's current active selection. Tapping Opslaan calls
 * `sync_user_bad_habits` via the parent's onSave callback.
 *
 * Identical max-5 cap as onboarding. Habits removed here are *deactivated*,
 * not deleted, so their answers and historical logs are preserved if the
 * user re-adds them later.
 */
export function HabitManagerSheet({
  initialSelected,
  saving,
  onClose,
  onSave,
}: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const initiallyHasExtras = useMemo(
    () => initialSelected.some((id) => getBadHabit(id)?.isDefault === false),
    [initialSelected],
  );
  const [extrasOpen, setExtrasOpen] = useState(initiallyHasExtras);

  const atMax = selected.length >= MAX_BAD_HABITS;
  const canSubmit = selected.length > 0 && !saving;

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_BAD_HABITS) return prev;
      return [...prev, id];
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Beheer gewoontes"
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
          "max-h-[90vh]",
          "rounded-t-[var(--radius-lg)] border-t border-[var(--color-border-strong)]",
          "bg-surface px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3",
          "shadow-[0_-20px_60px_-20px_rgba(139,92,246,0.35)]",
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-[var(--color-border-strong)]" />

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              Jouw standaarden
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Beheer gewoontes
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

        <div className="mt-1 flex flex-1 flex-col gap-4 overflow-y-auto pb-3 pr-1 pt-3">
          <div className="grid grid-cols-3 gap-2.5">
            {DEFAULT_BAD_HABITS.map((opt) => {
              const isSelected = selected.includes(opt.id);
              const disabled = !isSelected && atMax;
              return (
                <BadHabitTile
                  key={opt.id}
                  title={opt.name}
                  icon={getHabitIcon(opt.id)}
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
                "flex w-full items-center justify-between px-4 py-3",
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

          <p className="px-1 text-[11px] text-muted">
            Gewoontes die je hier weghaalt blijven in je geschiedenis bestaan.
            Antwoorden komen terug zodra je ze opnieuw activeert.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <span
            className={cn(
              "text-[11px] tabular-nums",
              atMax ? "text-purple-bright" : "text-muted",
            )}
          >
            {selected.length}/{MAX_BAD_HABITS} actief
          </span>
          <div className="flex flex-1 items-center gap-2">
            <GhostButton onClick={onClose} disabled={saving}>
              Annuleer
            </GhostButton>
            <PrimaryButton
              onClick={() => onSave(selected)}
              loading={saving}
              disabled={!canSubmit}
              fullWidth
            >
              Opslaan
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HabitManagerSheet;
