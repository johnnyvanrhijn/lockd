"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { GoalRow } from "@/lib/goals/client";
import { CATEGORY_LABEL, type GoalCategory } from "@/lib/goals/templates";

type Props = {
  goal: GoalRow;
};

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")}
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

/**
 * Compact active mission widget for the dashboard. The card itself navigates
 * to /goals/[id]; the "Mijn waarom" row is a separate toggle that expands
 * the full why text inline without leaving the dashboard.
 */
export function ActiveMissionWidget({ goal }: Props) {
  const router = useRouter();
  const [whyOpen, setWhyOpen] = useState(false);
  const pct = Math.round(goal.progress_percentage);

  function openDetail() {
    router.push(`/goals/${goal.id}`);
  }

  return (
    <div
      className={cn(
        "block w-full rounded-[var(--radius-md)] border p-4",
        "border-purple/40 bg-purple/8",
        "shadow-[0_18px_50px_-32px_rgba(139,92,246,0.45)]",
      )}
    >
      <button
        type="button"
        onClick={openDetail}
        className={cn(
          "block w-full text-left",
          "transition-transform duration-200 active:scale-[0.997]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60 rounded-[var(--radius-sm)]",
        )}
        aria-label="Open missie details"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
            Actieve missie
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/85">
            Dag {goal.current_day}/{goal.duration_days}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-tight text-foreground">
          {goal.title}
        </h3>
        <div className="mt-2 flex items-baseline gap-1.5 text-sm">
          {goal.category && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {CATEGORY_LABEL[goal.category as GoalCategory] ?? goal.category}
            </span>
          )}
          <span className="ml-auto font-semibold tabular-nums text-purple-bright">
            {pct}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-purple-bright/80"
            style={{ width: `${pct}%` }}
          />
        </div>
      </button>

      {goal.why && (
        <button
          type="button"
          onClick={() => setWhyOpen((v) => !v)}
          aria-expanded={whyOpen}
          className={cn(
            "mt-3 flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)]",
            "border border-[var(--color-border)] bg-surface/40 px-3 py-2 text-left",
            "transition-colors duration-150 hover:border-[var(--color-border-strong)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
          )}
        >
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted/80">
              Mijn waarom
            </span>
            <span
              className={cn(
                "text-[12px] leading-relaxed text-foreground/85",
                !whyOpen && "line-clamp-1",
              )}
            >
              {goal.why}
            </span>
          </span>
          <span className="shrink-0 text-purple-bright">
            <Chevron open={whyOpen} />
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={openDetail}
        className={cn(
          "mt-3 flex w-full items-center justify-end gap-1 rounded-full",
          "text-[11px] font-medium text-purple-bright",
          "transition-colors duration-150 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
        )}
      >
        Bekijk voortgang <ArrowRight />
      </button>
    </div>
  );
}

export default ActiveMissionWidget;
