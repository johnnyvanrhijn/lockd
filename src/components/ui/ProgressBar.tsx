import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ProgressTone = "purple" | "success" | "warning" | "danger";

type ProgressBarProps = {
  /** Current value, 0..max (defaults to 0..100). */
  value: number;
  max?: number;
  tone?: ProgressTone;
  /** Optional label rendered above the track. */
  label?: ReactNode;
  /** Show "{value}/{max}" copy on the right side of the label row. */
  showValue?: boolean;
  className?: string;
};

const toneFill: Record<ProgressTone, string> = {
  purple: "bg-gradient-to-r from-purple-bright to-purple",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({
  value,
  max = 100,
  tone = "purple",
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const pct = (clamped / safeMax) * 100;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted">{label}</span>}
          {showValue && (
            <span className="ml-auto font-medium text-foreground">
              {clamped}/{safeMax}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        className={cn(
          "h-2 w-full overflow-hidden rounded-full",
          "bg-surface-elevated",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", toneFill[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
