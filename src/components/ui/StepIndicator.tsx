import { cn } from "@/lib/utils/cn";

type StepIndicatorProps = {
  total: number;
  /** 1-based current step. */
  current: number;
  className?: string;
};

export function StepIndicator({
  total,
  current,
  className,
}: StepIndicatorProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(current, 1), safeTotal);

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={safeTotal}
      aria-valuenow={safeCurrent}
      aria-label={`Stap ${safeCurrent} van ${safeTotal}`}
      className={cn("flex items-center gap-1.5", className)}
    >
      {Array.from({ length: safeTotal }).map((_, i) => {
        const isActive = i + 1 <= safeCurrent;
        const isCurrent = i + 1 === safeCurrent;

        return (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-200",
              isActive
                ? isCurrent
                  ? "bg-gradient-to-r from-purple-bright to-purple"
                  : "bg-purple"
                : "bg-surface-elevated",
            )}
          />
        );
      })}
    </div>
  );
}

export default StepIndicator;
