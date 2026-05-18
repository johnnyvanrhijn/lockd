"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import {
  GOOD_HABITS,
  GOOD_HABIT_CATEGORIES,
  MAX_GOOD_HABITS,
  type MasterHabit,
} from "@/lib/badHabits/catalog";

type Props = {
  /** Currently active good-habit IDs. */
  initialSelected: string[];
  saving: boolean;
  onClose: () => void;
  /** Atomic replacement: receives the new full active list. */
  onSave: (next: string[]) => void;
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

function CheckGlyph() {
  return (
    <svg viewBox="0 0 10 10" fill="none" aria-hidden className="h-2.5 w-2.5">
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

function GoodHabitRow({
  habit,
  selected,
  disabled,
  onClick,
}: {
  habit: MasterHabit;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-2",
        "rounded-[var(--radius-sm)] border px-3 py-2.5",
        "text-left text-xs font-semibold",
        "transition-all duration-200",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/60",
        selected
          ? [
              "border-success/55 bg-success/10 text-foreground",
              "shadow-[0_0_24px_-14px_rgba(74,222,128,0.6)]",
            ]
          : [
              "border-[var(--color-border)] bg-surface/60 text-foreground/85",
              "hover:border-[var(--color-border-strong)]",
            ],
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{habit.name}</span>
        <span className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          {habit.dailyStatement}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-success bg-success text-background"
            : "border-[var(--color-border-strong)] text-transparent",
        )}
      >
        {selected && <CheckGlyph />}
      </span>
    </button>
  );
}

/**
 * Bottom-sheet for managing the user's good-habit selection (max 3).
 *
 * Mirrors the visual language of HabitManagerSheet but with success/green
 * accents instead of purple, no icon tiles (good habits are label-only), and
 * a category-grouped list. Same removal semantics: deselecting deactivates
 * in user_bad_habits without deleting history.
 */
export function GoodHabitManagerSheet({
  initialSelected,
  saving,
  onClose,
  onSave,
}: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const byCategory = useMemo(() => {
    const groups = new Map<string, MasterHabit[]>();
    for (const h of GOOD_HABITS) {
      const arr = groups.get(h.category) ?? [];
      arr.push(h);
      groups.set(h.category, arr);
    }
    return groups;
  }, []);

  const atMax = selected.length >= MAX_GOOD_HABITS;
  const canSubmit = !saving;

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_GOOD_HABITS) return prev;
      return [...prev, id];
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Beheer wel-doen gewoontes"
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
          "shadow-[0_-20px_60px_-20px_rgba(74,222,128,0.30)]",
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-[var(--color-border-strong)]" />

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-success">
              Wel doen
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Beheer wel-doen gewoontes
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
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/60",
            )}
          >
            <CloseGlyph />
          </button>
        </div>

        <div className="mt-1 flex flex-1 flex-col gap-4 overflow-y-auto pb-3 pr-1 pt-3">
          {GOOD_HABIT_CATEGORIES.map((cat) => {
            const items = byCategory.get(cat.id) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={cat.id} className="flex flex-col gap-1.5">
                <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  {cat.label}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((h) => {
                    const isSelected = selected.includes(h.id);
                    const disabled = !isSelected && atMax;
                    return (
                      <GoodHabitRow
                        key={h.id}
                        habit={h}
                        selected={isSelected}
                        disabled={disabled}
                        onClick={() => toggle(h.id)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p className="px-1 text-[11px] text-muted">
            Gewoontes die je hier weghaalt blijven in je geschiedenis bestaan.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <span
            className={cn(
              "text-[11px] tabular-nums",
              atMax ? "text-success" : "text-muted",
            )}
          >
            {selected.length}/{MAX_GOOD_HABITS} actief
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

export default GoodHabitManagerSheet;
