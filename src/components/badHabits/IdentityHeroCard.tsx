"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "@/components/ui/GlassCard";
import { CircularProgress } from "@/components/ui/CircularProgress";

type Props = {
  /** LOCKD streak: consecutive days where consistency >= 80%. */
  lockdStreak: number;
  /** Best LOCKD streak ever (supporting line). */
  bestStreak: number;
  /** Active habits today; 0 if user has nothing to commit to yet. */
  activeCount: number;
  /** Number of habits the user kept their standard on so far today. */
  successCount: number;
  /** Whether the hero is tappable. */
  onOpenHistory?: () => void;
};

type HeroState = "empty" | "open" | "partial" | "complete";

function resolveState(
  activeCount: number,
  successCount: number,
): HeroState {
  if (activeCount === 0) return "empty";
  if (successCount === 0) return "open";
  if (successCount >= activeCount) return "complete";
  return "partial";
}

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
 * Hero card on the dashboard. State machine:
 *
 *  empty    no active habits — invite to open profile.
 *  open     habits active, none checked today — big = streak, ring empty.
 *  partial  some checked today — big = "X/Y", ring partial, reactive feedback.
 *  complete all checked — big = streak, ring full green, celebratory subline.
 *
 * Tappable: opens the history heatmap.
 */
export function IdentityHeroCard({
  lockdStreak,
  bestStreak,
  activeCount,
  successCount,
  onOpenHistory,
}: Props) {
  const isClickable = Boolean(onOpenHistory);
  const state = resolveState(activeCount, successCount);
  const isComplete = state === "complete";

  const ringValue = activeCount > 0 ? successCount : 0;
  const ringMax = activeCount > 0 ? activeCount : 1;
  const ringTone = isComplete ? "success" : "purple";

  // Big metric varies per state.
  const headline: ReactNode = (() => {
    switch (state) {
      case "empty":
        return <HeadlineNumber>0</HeadlineNumber>;
      case "open":
        return <HeadlineNumber>{lockdStreak}</HeadlineNumber>;
      case "partial":
        return (
          <span className="flex items-baseline gap-1 leading-none tabular-nums">
            <span className="text-5xl font-semibold tracking-tight text-foreground">
              {successCount}
            </span>
            <span className="text-2xl font-medium text-muted">/</span>
            <span className="text-2xl font-medium text-muted">
              {activeCount}
            </span>
          </span>
        );
      case "complete":
        return <HeadlineNumber>{lockdStreak}</HeadlineNumber>;
    }
  })();

  const headlineSuffix: string = (() => {
    switch (state) {
      case "empty":
        return "dagen op rij";
      case "open":
        return lockdStreak === 1 ? "dag op rij" : "dagen op rij";
      case "partial":
        return "vandaag staat";
      case "complete":
        return lockdStreak === 1
          ? "dag volledig beschermd"
          : "dagen volledig beschermd";
    }
  })();

  const subline: string = (() => {
    switch (state) {
      case "empty":
        return "Open je profiel om gewoontes te kiezen.";
      case "open":
        return "Tik op een standaard hieronder — vandaag is open.";
      case "partial": {
        const remaining = activeCount - successCount;
        return remaining === 1
          ? "Nog 1 om dag binnen te halen."
          : `Nog ${remaining} om dag binnen te halen.`;
      }
      case "complete":
        return bestStreak > lockdStreak
          ? `Best ooit: ${bestStreak} dagen — ga ervoor.`
          : "Vandaag, helemaal beschermd.";
    }
  })();

  const ringLabel: string = (() => {
    switch (state) {
      case "empty":
        return "Leeg";
      case "open":
        return "Open";
      case "partial":
        return "Bezig";
      case "complete":
        return "Klaar";
    }
  })();

  const accentClass = isComplete ? "text-success" : "text-purple-bright";

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
      <GlassCard
        tone={isComplete ? "success" : "purple"}
        glow={isComplete ? "success" : "soft"}
        padding="lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span
              className={cn(
                "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em]",
                accentClass,
              )}
            >
              <ShieldGlow />
              <span>Vandaag</span>
            </span>
            <div className="flex items-baseline gap-2">
              {headline}
              <span className="text-sm font-medium text-foreground/85">
                {headlineSuffix}
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
              tone={ringTone}
              label={
                activeCount > 0
                  ? `${successCount} van ${activeCount} standaarden vandaag`
                  : "Nog geen gewoontes geselecteerd"
              }
            >
              <div className="flex flex-col items-center">
                {activeCount > 0 ? (
                  <span className="flex items-baseline gap-0.5 leading-none tabular-nums text-foreground">
                    <span className="text-[28px] font-semibold">
                      {successCount}
                    </span>
                    <span className="text-base text-muted">/</span>
                    <span className="text-base font-medium text-muted">
                      {activeCount}
                    </span>
                  </span>
                ) : (
                  <span className="text-xl font-semibold leading-none text-muted">
                    —
                  </span>
                )}
                <span
                  className={cn(
                    "mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                    accentClass,
                  )}
                >
                  {ringLabel}
                </span>
              </div>
            </CircularProgress>
          </div>
        </div>

        {activeCount > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-[11px]">
            <span className="text-muted">
              {state === "complete"
                ? `Streak: ${lockdStreak}d`
                : `Streak: ${lockdStreak}d · best ${bestStreak}d`}
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
