import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { IconBadge } from "./IconBadge";

type StreakHabitRowProps = {
  /** Display name (e.g. "Niet gerookt"). */
  name: ReactNode;
  /** Leading icon, rendered inside an IconBadge container. */
  icon: ReactNode;
  /** Subtitle copy under the name (e.g. "Sinds 12 mei"). */
  sinceLabel?: ReactNode;
  /** Current streak length in days. */
  days: number;
  /** Whether the user has already checked in today. */
  checkedToday?: boolean;
  /** Callback for the right-side check-in button. */
  onCheck?: () => void;
  className?: string;
};

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M3.5 8.5l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StreakHabitRow({
  name,
  icon,
  sinceLabel,
  days,
  checkedToday = false,
  onCheck,
  className,
}: StreakHabitRowProps) {
  const dayLabel = days === 1 ? "dag" : "dagen";

  return (
    <div className={cn("flex items-center gap-3 py-3.5", className)}>
      <IconBadge icon={icon} tone="neutral" size="md" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-foreground">
          {name}
        </span>
        {sinceLabel && (
          <span className="truncate text-xs text-muted">{sinceLabel}</span>
        )}
      </div>

      <div className="flex flex-col items-end leading-none">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {days}
        </span>
        <span className="mt-1 text-[11px] text-muted">{dayLabel}</span>
      </div>

      <button
        type="button"
        onClick={onCheck}
        aria-pressed={checkedToday}
        aria-label={
          checkedToday ? "Check-in voltooid voor vandaag" : "Check-in vandaag"
        }
        className={cn(
          "ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          "transition-all duration-200 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checkedToday
            ? "bg-purple text-white shadow-[0_0_24px_-6px_var(--color-purple-glow)]"
            : "border border-[var(--color-border-strong)] text-muted hover:text-foreground hover:border-purple/60",
        )}
      >
        <CheckGlyph />
      </button>
    </div>
  );
}

export default StreakHabitRow;
