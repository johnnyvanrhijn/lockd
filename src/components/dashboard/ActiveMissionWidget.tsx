"use client";

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

/**
 * Compact active mission widget for the dashboard. Click → /goals/[id].
 * Hides itself when no active mission.
 */
export function ActiveMissionWidget({ goal }: Props) {
  const router = useRouter();
  const pct = Math.round(goal.progress_percentage);

  return (
    <button
      type="button"
      onClick={() => router.push(`/goals/${goal.id}`)}
      className={cn(
        "block w-full rounded-[var(--radius-md)] border p-4 text-left",
        "border-purple/40 bg-purple/8",
        "transition-transform duration-200 active:scale-[0.997]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
        "shadow-[0_18px_50px_-32px_rgba(139,92,246,0.45)]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
          Actieve missie
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/85">
          {goal.category
            ? CATEGORY_LABEL[goal.category as GoalCategory] ?? goal.category
            : ""}
        </span>
      </div>
      <h3 className="mt-2 text-lg font-semibold leading-tight text-foreground">
        {goal.title}
      </h3>
      <div className="mt-2 flex items-baseline gap-1.5 text-sm">
        <span className="font-semibold tabular-nums text-foreground">
          Dag {goal.current_day}
        </span>
        <span className="text-muted">van {goal.duration_days}</span>
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
      <p className="mt-2 text-[11px] leading-relaxed text-muted line-clamp-1">
        Waarom: {goal.why}
      </p>
      <div className="mt-3 flex items-center justify-end text-[11px] text-purple-bright">
        Bekijk voortgang <ArrowRight />
      </div>
    </button>
  );
}

export default ActiveMissionWidget;
