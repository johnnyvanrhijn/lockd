"use client";

import { useMemo, useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import {
  GOOD_HABITS,
  GOOD_HABIT_CATEGORIES,
  MAX_GOOD_HABITS,
  getAntidotesForHabits,
  type MasterHabit,
} from "@/lib/badHabits/catalog";
import { cn } from "@/lib/utils/cn";

type Props = {
  total: number;
  current: number;
  /** Bad-habit IDs the user already chose — drives antidote suggestions. */
  focusBadHabits: string[];
  /** Existing good-habit selections (for back-navigation / re-edit). */
  focusGoodHabits: string[];
  saving: boolean;
  onBack: () => void;
  onNext: (habits: string[]) => void;
};

function PlusGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M8 3v10M3 8h10"
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

function GoodHabitChip({
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
        selected
          ? [
              "border-success/55 bg-success/10 text-foreground",
              "shadow-[0_0_24px_-14px_rgba(74,222,128,0.6)]",
            ]
          : [
              "border-[var(--color-border)] bg-surface/60",
              "text-foreground/85",
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
        {selected ? <CheckGlyph /> : <PlusGlyph />}
      </span>
    </button>
  );
}

export function StepGoodHabits({
  total,
  current,
  focusBadHabits,
  focusGoodHabits,
  saving,
  onBack,
  onNext,
}: Props) {
  // Pre-rank antidote suggestions once per render — derived from chosen bad
  // habits. Up to 6, so the recommended row has 3 plus a few alternates.
  const suggestions = useMemo(
    () => getAntidotesForHabits(focusBadHabits, 6),
    [focusBadHabits],
  );

  // Build the initial selection:
  //  - If user already picked good habits (re-edit), use those.
  //  - Otherwise, pre-select the top 3 antidotes.
  const initialSelection = useMemo<string[]>(() => {
    if (focusGoodHabits.length > 0) return focusGoodHabits.slice(0, MAX_GOOD_HABITS);
    return suggestions.slice(0, MAX_GOOD_HABITS).map((h) => h.id);
  }, [focusGoodHabits, suggestions]);

  const [selected, setSelected] = useState<string[]>(initialSelection);
  const atMax = selected.length >= MAX_GOOD_HABITS;

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_GOOD_HABITS) return prev;
      return [...prev, id];
    });
  }

  // Group good habits by category for the "alle gewoontes" section, in the
  // catalog order. Suggested IDs are dropped from this list to avoid double-
  // display when the user already sees them at the top.
  const suggestionIds = new Set(suggestions.map((s) => s.id));
  const byCategory = useMemo(() => {
    const groups = new Map<string, MasterHabit[]>();
    for (const h of GOOD_HABITS) {
      if (suggestionIds.has(h.id)) continue;
      const arr = groups.get(h.category) ?? [];
      arr.push(h);
      groups.set(h.category, arr);
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions]);

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow="Wel doen"
      title={
        <>
          Wat doe je{" "}
          <span className="text-purple-bright">in plaats?</span>
        </>
      }
      subtitle={
        suggestions.length > 0
          ? "We hebben er een paar voorgesteld op basis van wat je achter wilt laten. Kies maximaal 3."
          : "Kies maximaal 3 gewoontes die je wil opbouwen."
      }
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(selected)}
            disabled={saving}
            loading={saving}
            fullWidth
          >
            {selected.length === 0 ? "Overslaan" : "Volgende"}
          </PrimaryButton>
        </div>
      }
      footer={
        <span
          className={cn(
            "text-[11px] tabular-nums",
            atMax ? "text-success" : "text-muted",
          )}
        >
          {selected.length}/{MAX_GOOD_HABITS} geselecteerd
          {atMax && " — maximaal bereikt"}
        </span>
      }
    >
      <div className="flex flex-col gap-5">
        {suggestions.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-success">
              Aanbevolen voor jou
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((h) => {
                const isSelected = selected.includes(h.id);
                const disabled = !isSelected && atMax;
                return (
                  <GoodHabitChip
                    key={h.id}
                    habit={h}
                    selected={isSelected}
                    disabled={disabled}
                    onClick={() => toggle(h.id)}
                  />
                );
              })}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">
            Alle gewoontes
          </h2>
          <div className="flex flex-col gap-3">
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
                        <GoodHabitChip
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
          </div>
        </section>
      </div>
    </OnboardingShell>
  );
}
