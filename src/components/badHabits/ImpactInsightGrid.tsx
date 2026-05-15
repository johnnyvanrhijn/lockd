"use client";

import { type ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";
import {
  formatCount,
  formatHours,
  formatKcal,
  formatMoney,
  type AggregatedImpact,
} from "@/lib/badHabits/impact";

type Props = {
  impact: AggregatedImpact;
  onOpenHistory?: () => void;
};

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5s-2.5.5-2.5 2 2 2 2.5 2 2.5.5 2.5 2-1.5 2-2.5 2-2-.5-2.5-1.5M12 6.5v11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HourglassIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M7 4h10v3l-4 5 4 5v3H7v-3l4-5-4-5V4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function StatTile({
  icon,
  value,
  label,
  tone = "neutral",
}: {
  icon: ReactNode;
  value: string;
  label: string;
  tone?: "neutral" | "iris";
}) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2">
      <span
        aria-hidden
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]",
          "[&_svg]:h-4 [&_svg]:w-4",
          tone === "iris"
            ? "bg-purple/15 text-purple-bright"
            : "bg-surface-elevated text-muted",
        )}
      >
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-semibold leading-none tabular-nums text-foreground">
          {value}
        </span>
        <span className="text-[11px] leading-tight text-muted">{label}</span>
      </div>
    </div>
  );
}

/**
 * "Proof of change" — the dashboard's transformation evidence. Tiles only
 * appear when there's a non-zero value to show, so a freshly-onboarded user
 * doesn't see a wall of zeros.
 */
export function ImpactInsightGrid({ impact, onOpenHistory }: Props) {
  const tiles: ReactNode[] = [];

  if (impact.money > 0) {
    tiles.push(
      <StatTile
        key="money"
        icon={<CoinIcon />}
        value={formatMoney(impact.money)}
        label="Bespaard"
        tone="iris"
      />,
    );
  }
  if (impact.hours > 0) {
    tiles.push(
      <StatTile
        key="hours"
        icon={<HourglassIcon />}
        value={formatHours(impact.hours)}
        label="Teruggewonnen"
      />,
    );
  }
  if (impact.kcal > 0) {
    tiles.push(
      <StatTile
        key="kcal"
        icon={<FlameIcon />}
        value={formatKcal(impact.kcal)}
        label="Kcal vermeden"
      />,
    );
  }
  // Show one bonus count tile if there's a particularly large one.
  const biggestCount = [...impact.counts].sort((a, b) => b.total - a.total)[0];
  if (biggestCount && biggestCount.total >= 5 && tiles.length < 3) {
    tiles.push(
      <StatTile
        key={`count-${biggestCount.habitId}`}
        icon={<FlameIcon />}
        value={formatCount(biggestCount.total, biggestCount.unit)}
        label={biggestCount.label}
      />,
    );
  }

  if (tiles.length === 0) return null;

  const cols = tiles.length === 1 ? "grid-cols-1" : tiles.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <GlassCard padding="lg">
      <div className="flex flex-col items-stretch gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
            Bewijs van verandering
          </h2>
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className={cn(
                "text-[11px] font-medium text-muted",
                "hover:text-foreground transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                "rounded-full px-2 py-0.5",
              )}
            >
              Bekijk →
            </button>
          )}
        </div>
        <div className={cn("grid gap-3", cols)}>{tiles}</div>
      </div>
    </GlassCard>
  );
}

export default ImpactInsightGrid;
