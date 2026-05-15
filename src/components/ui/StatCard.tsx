import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "./GlassCard";

type Trend = "up" | "down" | "flat";

type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  /** Optional small unit/suffix shown next to the value (e.g. "dagen"). */
  unit?: ReactNode;
  /** Optional supporting copy under the value. */
  hint?: ReactNode;
  /** Optional icon shown in the top-right corner. */
  icon?: ReactNode;
  /** Movement vs. a previous period. Renders a colored badge with delta. */
  trend?: {
    direction: Trend;
    label: ReactNode;
  };
  className?: string;
};

const trendStyles: Record<Trend, { wrapper: string; arrow: string }> = {
  up: { wrapper: "bg-success/15 text-success", arrow: "↑" },
  down: { wrapper: "bg-danger/15 text-danger", arrow: "↓" },
  flat: { wrapper: "bg-surface-glass text-muted", arrow: "→" },
};

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <GlassCard className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          {label}
        </span>
        {icon && <span className="text-muted [&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
      </div>

      {(hint || trend) && (
        <div className="flex items-center justify-between gap-2">
          {hint && <span className="text-xs text-muted">{hint}</span>}
          {trend && (
            <span
              className={cn(
                "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trendStyles[trend.direction].wrapper,
              )}
            >
              <span aria-hidden>{trendStyles[trend.direction].arrow}</span>
              {trend.label}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}

export default StatCard;
