"use client";

import { StruggleShell } from "../StruggleShell";
import { cn } from "@/lib/utils/cn";
import { getHabitIcon } from "@/components/badHabits/HabitIcons";

type HabitOption = {
  habit_id: string;
  name: string;
  streak: number;
};

type Props = {
  habits: ReadonlyArray<HabitOption>;
  onSelect: (habitId: string) => void;
  onClose: () => void;
};

/**
 * Screen 2 — habit picker. The user taps the habit they're struggling with;
 * the flow auto-advances on tap (no Next button). Stacked tiles with icon +
 * name + small streak hint for context.
 */
export function HabitPickStep({ habits, onSelect, onClose }: Props) {
  return (
    <StruggleShell eyebrow="Stap 1" onClose={onClose}>
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
        Voor welke wil je nu{" "}
        <span className="text-purple-bright">standhouden</span>?
      </h1>
      <p className="text-sm text-muted">Tap waar de drang nu zit.</p>

      <div className="mt-4 flex w-full flex-col gap-2">
        {habits.length === 0 ? (
          <p className="text-xs text-muted">
            Geen actieve gewoontes. Sluit en kies eerst je standaarden.
          </p>
        ) : (
          habits.map((h) => (
            <button
              key={h.habit_id}
              type="button"
              onClick={() => onSelect(h.habit_id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-[var(--radius-sm)] border px-4 py-3.5",
                "border-[var(--color-border)] bg-surface/60 text-left",
                "transition-all duration-200 active:scale-[0.99]",
                "hover:border-purple/45 hover:bg-purple/8",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
                  "bg-surface-elevated text-foreground/85",
                  "[&_svg]:h-5 [&_svg]:w-5",
                )}
              >
                {getHabitIcon(h.habit_id)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  {h.name}
                </span>
                <span className="text-[11px] text-muted">
                  {h.streak === 0
                    ? "Geen streak nog"
                    : `${h.streak} ${h.streak === 1 ? "dag" : "dagen"} stand`}
                </span>
              </div>
              <span aria-hidden className="text-muted">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                  <path
                    d="M5 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          ))
        )}
      </div>
    </StruggleShell>
  );
}

export default HabitPickStep;
