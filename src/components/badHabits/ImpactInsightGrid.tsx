"use client";

import { type ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";
import {
  formatCount,
  formatFatMass,
  formatHours,
  formatKcal,
  formatMoney,
  type AggregatedImpact,
} from "@/lib/badHabits/impact";

type Tile = {
  key: string;
  kind: "money" | "hours" | "kcal" | "fat" | "count" | "risk";
  value: string;
  label: string;
  /** Used to rank which tile becomes the hero. */
  rank: number;
};

type Props = {
  impact: AggregatedImpact;
  /** Optional "Hoogste risico" window, e.g. "22:00–00:00". */
  riskWindow?: string | null;
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

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 5h14M3 11l4-6 4 6a4 4 0 0 1-8 0Zm10 0l4-6 4 6a4 4 0 0 1-8 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.5V12l3 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function iconForKind(kind: Tile["kind"]): ReactNode {
  switch (kind) {
    case "money":
      return <CoinIcon />;
    case "hours":
      return <HourglassIcon />;
    case "kcal":
      return <FlameIcon />;
    case "fat":
      return <ScaleIcon />;
    case "count":
      return <FlameIcon />;
    case "risk":
      return <ClockIcon />;
  }
}

/**
 * "Proof of change" — the dashboard's transformation evidence. Renders the
 * single largest impact metric as a hero card, with secondary metrics below
 * in a compact grid. Tiles only appear when there's something to show, so a
 * fresh user doesn't see a wall of zeros.
 */
export function ImpactInsightGrid({ impact, riskWindow, onOpenHistory }: Props) {
  const tiles: Tile[] = [];

  // Rank: money > hours > kcal > fat. (Money "wins" because € is the most
  // visceral proof for most users; this matches the brief's example list.)
  if (impact.money > 0) {
    tiles.push({
      key: "money",
      kind: "money",
      value: formatMoney(impact.money),
      label: "Bespaard",
      rank: 100,
    });
  }
  if (impact.hours > 0) {
    tiles.push({
      key: "hours",
      kind: "hours",
      value: formatHours(impact.hours),
      label: "Teruggewonnen",
      rank: 80,
    });
  }
  if (impact.kcal > 0) {
    tiles.push({
      key: "kcal",
      kind: "kcal",
      value: formatKcal(impact.kcal),
      label: "Kcal vermeden",
      rank: 60,
    });
  }
  // Gate fat-mass conversion: needs enough accumulated kcal so the number
  // feels credible (>= 0.3 kg ≈ 30 days at sugar baseline).
  if (impact.fatKg >= 0.3) {
    tiles.push({
      key: "fat",
      kind: "fat",
      value: formatFatMass(impact.fatKg),
      label: "Vetmassa niet opgeslagen",
      rank: 50,
    });
  }
  // Bonus count tile (e.g. "sigaretten vermeden") — surfaces the biggest one.
  const biggestCount = [...impact.counts].sort((a, b) => b.total - a.total)[0];
  if (biggestCount && biggestCount.total >= 5) {
    tiles.push({
      key: `count-${biggestCount.habitId}`,
      kind: "count",
      value: formatCount(biggestCount.total, biggestCount.unit),
      label: biggestCount.label,
      rank: 40,
    });
  }
  if (riskWindow) {
    tiles.push({
      key: "risk-window",
      kind: "risk",
      value: riskWindow,
      label: "Hoogste risico",
      rank: 30,
    });
  }

  if (tiles.length === 0) return null;

  // Hero = highest-ranked tile; grid = the rest.
  tiles.sort((a, b) => b.rank - a.rank);
  const [hero, ...rest] = tiles;
  const gridCols =
    rest.length === 1 ? "grid-cols-1" : rest.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Bewijs van verandering
        </h2>
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              "text-muted hover:text-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            Bekijk →
          </button>
        )}
      </div>

      <HeroStatCard tile={hero} />

      {rest.length > 0 && (
        <div className={cn("grid gap-2", gridCols)}>
          {rest.map((t) => (
            <SmallStatCard key={t.key} tile={t} />
          ))}
        </div>
      )}
    </section>
  );
}

function HeroStatCard({ tile }: { tile: Tile }) {
  return (
    <GlassCard tone="purple" glow="soft" padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
            {tile.label}
          </span>
          <span className="text-[40px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
            {tile.value}
          </span>
        </div>
        <span
          aria-hidden
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center",
            "rounded-[var(--radius-md)] bg-purple/20 text-purple-bright",
            "shadow-[0_0_28px_-12px_var(--color-purple-glow)]",
            "[&_svg]:h-6 [&_svg]:w-6",
          )}
        >
          {iconForKind(tile.kind)}
        </span>
      </div>
    </GlassCard>
  );
}

function SmallStatCard({ tile }: { tile: Tile }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)]",
        "bg-surface/70 backdrop-blur-xl px-3.5 py-3",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)]",
          "bg-surface-elevated text-muted",
          "[&_svg]:h-3.5 [&_svg]:w-3.5",
        )}
      >
        {iconForKind(tile.kind)}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-semibold leading-none tabular-nums text-foreground">
          {tile.value}
        </span>
        <span className="text-[10px] leading-tight text-muted">{tile.label}</span>
      </div>
    </div>
  );
}

export default ImpactInsightGrid;
