import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "./GlassCard";
import { StatusBadge, type StatusTone } from "./StatusBadge";

type HabitCardProps = {
  /** Display name of the habit (e.g. "Geen porn"). */
  name: ReactNode;
  /** Optional emoji or small icon shown on the left. */
  icon?: ReactNode;
  /** Current streak length in days. */
  streakDays?: number;
  /** Status pill on the right side. Maps to one of the StatusBadge tones. */
  status?: {
    label: ReactNode;
    tone: StatusTone;
  };
  /** Optional supporting copy under the name. */
  meta?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function HabitCard({
  name,
  icon,
  streakDays,
  status,
  meta,
  onClick,
  className,
}: HabitCardProps) {
  return (
    <GlassCard
      interactive={onClick ? true : undefined}
      onClick={onClick}
      className={cn("flex items-center gap-4", className)}
    >
      {icon && (
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center",
            "rounded-[var(--radius-sm)] bg-surface-elevated",
            "text-xl",
          )}
        >
          {icon}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-base font-semibold text-foreground">
          {name}
        </span>
        {meta && <span className="truncate text-xs text-muted">{meta}</span>}
        {typeof streakDays === "number" && (
          <span className="text-xs text-muted">
            <span className="font-medium text-foreground">{streakDays}</span>{" "}
            {streakDays === 1 ? "dag" : "dagen"} streak
          </span>
        )}
      </div>

      {status && (
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      )}
    </GlassCard>
  );
}

export default HabitCard;
