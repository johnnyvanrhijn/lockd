"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";

export type StreakEntry = {
  habitId: string;
  name: string;
  days: number;
};

type Props = {
  /** All currently-tracked habits with their individual streaks. */
  streaks: ReadonlyArray<StreakEntry>;
};

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M12 3.5c.4 2.4 1.8 3.5 3 5 1.4 1.7 2.5 3.5 2.5 5.5a5.5 5.5 0 0 1-11 0c0-1.6.7-3 1.5-4 .4.9 1 1.4 1.8 1.6-.5-1.6-.2-3.4 1-5.2.4-.7.8-1.6 1.2-2.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Top-3 individual streaks rendered as premium chips. Hidden when no habit
 * has reached 1 day yet, so a fresh user isn't shown a placeholder block.
 */
export function StreaksRail({ streaks }: Props) {
  const top = [...streaks].sort((a, b) => b.days - a.days).slice(0, 3);
  const hasAny = top.some((s) => s.days >= 1);
  if (!hasAny) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
        Jouw streaks
      </h2>
      <GlassCard padding="md">
        <div className="flex flex-col gap-2">
          {top.map((s, idx) => (
            <StreakChip key={s.habitId} entry={s} rank={idx + 1} />
          ))}
        </div>
      </GlassCard>
    </section>
  );
}

function StreakChip({ entry, rank }: { entry: StreakEntry; rank: number }) {
  const hot = entry.days >= 7;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        "rounded-[var(--radius-sm)] border px-3 py-2.5",
        "transition-colors",
        hot
          ? [
              "border-purple/45 bg-purple/10",
              "shadow-[0_0_24px_-14px_var(--color-purple-glow)]",
            ]
          : "border-[var(--color-border)] bg-surface/60",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            "text-[10px] font-semibold tabular-nums",
            "border",
            hot
              ? "border-purple-bright/40 bg-purple/20 text-purple-bright"
              : "border-[var(--color-border-strong)] bg-surface-elevated text-muted",
          )}
        >
          {rank}
        </span>
        <span className="truncate text-sm font-semibold text-foreground">
          {entry.name}
        </span>
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1",
          "text-xs font-semibold tabular-nums",
          hot
            ? "bg-purple/20 text-purple-bright"
            : "bg-surface-elevated text-muted",
          "[&_svg]:h-3.5 [&_svg]:w-3.5",
        )}
      >
        <FlameIcon />
        {entry.days}
        <span className="text-[10px] font-medium opacity-80">
          {entry.days === 1 ? "dag" : "dagen"}
        </span>
      </div>
    </div>
  );
}

export default StreaksRail;
