"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "@/components/ui/GlassCard";
import { CircularProgress } from "@/components/ui/CircularProgress";

type Props = {
  /** LOCKD streak: consecutive days where consistency >= 80%. */
  lockdStreak: number;
  /** Best LOCKD streak ever (for the supporting line). */
  bestStreak: number;
  /** Active habits today; null if user has nothing to commit to yet. */
  activeCount: number;
  /** Number of habits the user kept their standard on so far. */
  successCount: number;
  /** Consistency % for today, or null when no habits are active. */
  pct: number | null;
  /** Whether the hero is tappable. */
  onOpenHistory?: () => void;
};

function ShieldGlow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-7 w-7">
      <path
        d="M12 2.5l8 3v6.5C20 16.5 16.6 20.5 12 22 7.4 20.5 4 16.5 4 12V5.5l8-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12.5l2.5 2.5L15.5 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeadlineNumber({ children }: { children: ReactNode }) {
  return (
    <span className="text-5xl font-semibold leading-none tracking-tight text-foreground tabular-nums">
      {children}
    </span>
  );
}

/**
 * Hero card on the dashboard. Frames the day around identity ("Standaarden
 * beschermd") rather than failure ("days without X"). Tappable — opens the
 * history heatmap.
 */
export function IdentityHeroCard({
  lockdStreak,
  bestStreak: _bestStreak,
  activeCount,
  successCount,
  pct,
  onOpenHistory,
}: Props) {
  void _bestStreak;
  const hasHabits = activeCount > 0;
  const isClickable = Boolean(onOpenHistory);

  const ringValue = hasHabits ? successCount : 0;
  const ringMax = hasHabits ? activeCount : 1;

  const subline = hasHabits
    ? "Elke keuze bevestigt wie je bent."
    : "Open je profiel om gewoontes te kiezen.";

  return (
    <button
      type="button"
      onClick={onOpenHistory}
      disabled={!isClickable}
      aria-label="Open je geschiedenis"
      className={cn(
        "block w-full text-left",
        "rounded-[var(--radius-md)]",
        "transition-transform duration-200",
        isClickable && "active:scale-[0.995]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
      )}
    >
      <GlassCard tone="purple" glow="soft" padding="lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              <ShieldGlow />
              <span>Vandaag</span>
            </span>
            <div className="flex items-baseline gap-2">
              <HeadlineNumber>{lockdStreak}</HeadlineNumber>
              <span className="text-sm font-medium text-foreground/85">
                {lockdStreak === 1
                  ? "dag volgens je standaarden"
                  : "dagen volgens je standaarden"}
              </span>
            </div>
            <span className="text-xs text-muted">{subline}</span>
          </div>

          <div className="shrink-0">
            <CircularProgress
              value={ringValue}
              max={ringMax}
              size={108}
              strokeWidth={8}
              label={
                hasHabits
                  ? `${successCount} van ${activeCount} standaarden vandaag`
                  : "Nog geen gewoontes geselecteerd"
              }
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-semibold leading-none tabular-nums text-foreground">
                  {pct ?? 0}
                  <span className="text-base text-muted">%</span>
                </span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-bright">
                  Voltooid
                </span>
              </div>
            </CircularProgress>
          </div>
        </div>

        {hasHabits && (
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-[11px]">
            <span className="text-muted">
              {successCount}/{activeCount} standaarden gehouden
            </span>
            <span className="inline-flex items-center gap-1 text-purple-bright">
              Geschiedenis
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className="h-3 w-3"
              >
                <path
                  d="M5 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        )}
      </GlassCard>
    </button>
  );
}

export default IdentityHeroCard;
