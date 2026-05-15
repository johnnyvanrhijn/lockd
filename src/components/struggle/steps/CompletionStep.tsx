"use client";

import { StruggleShell } from "../StruggleShell";
import { cn } from "@/lib/utils/cn";
import { getBadHabitName } from "@/lib/badHabits/catalog";

type Stat = { label: string; value: string };

type Props = {
  habitId: string;
  newStreakDays: number;
  /** Optional € saved one-day equivalent for the chosen habit. */
  moneySavedPerDay: number | null;
  /** True when the user's existing log for today was a Terugval (we left it). */
  alreadyFailed: boolean;
  onDone: () => void;
  onReflect: () => void;
};

/**
 * Screen 8 — completion. No confetti. Three stat tiles, two equally-weighted
 * actions. Identity statement only.
 */
export function CompletionStep({
  habitId,
  newStreakDays,
  moneySavedPerDay,
  alreadyFailed,
  onDone,
  onReflect,
}: Props) {
  const habitName = getBadHabitName(habitId);

  const stats: Stat[] = [
    {
      label: "Streak",
      value: `${newStreakDays} ${newStreakDays === 1 ? "dag" : "dagen"}`,
    },
    { label: "Drang", value: "weerstaan" },
  ];
  if (moneySavedPerDay !== null && moneySavedPerDay > 0) {
    const v =
      moneySavedPerDay >= 10
        ? `€${Math.round(moneySavedPerDay)}`
        : `€${moneySavedPerDay.toFixed(2).replace(/\.00$/, "")}`;
    stats.push({ label: "Vandaag bespaard", value: v });
  }

  return (
    <StruggleShell
      showClose={false}
      pulledDown
      actions={
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={onDone}
            className={cn(
              "flex w-full items-center justify-center rounded-[var(--radius-sm)]",
              "h-14 bg-purple text-sm font-semibold text-foreground",
              "transition-all duration-200 active:scale-[0.98]",
              "shadow-[0_0_28px_-8px_var(--color-purple-glow)]",
              "hover:bg-purple-bright",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            Klaar
          </button>
          <button
            type="button"
            onClick={onReflect}
            className={cn(
              "flex w-full items-center justify-center",
              "h-12 text-sm font-medium text-muted",
              "transition-colors hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/40 rounded-[var(--radius-sm)]",
            )}
          >
            Reflecteren
          </button>
        </div>
      }
    >
      <h1 className="text-[42px] font-semibold leading-[1.05] tracking-tight text-foreground">
        <span className="text-purple-bright">Beschermd.</span>
      </h1>
      <p className="text-sm leading-relaxed text-muted">
        {alreadyFailed
          ? `Vandaag's terugval blijft staan. ${habitName} weerstaan vanaf nu.`
          : `Je standaard bleef intact voor ${habitName.toLowerCase()}.`}
      </p>

      <div className="mt-4 grid w-full grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "flex flex-col items-start gap-1 rounded-[var(--radius-sm)]",
              "border border-[var(--color-border)] bg-surface/60 px-3 py-2.5",
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              {s.label}
            </span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </StruggleShell>
  );
}

export default CompletionStep;
