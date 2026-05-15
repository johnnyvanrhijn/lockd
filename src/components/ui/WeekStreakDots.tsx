import { cn } from "@/lib/utils/cn";

export type WeekDayStatus = "complete" | "pending";

export type WeekDay = {
  /** Single-letter label (e.g. "M", "D", "W"). */
  letter: string;
  status: WeekDayStatus;
};

type WeekStreakDotsProps = {
  days: ReadonlyArray<WeekDay>;
  /** Optional accessible label override. */
  ariaLabel?: string;
  className?: string;
};

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="h-3 w-3"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.5 6.5l2.2 2.2L9.5 3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WeekStreakDots({
  days,
  ariaLabel = "Streak deze week",
  className,
}: WeekStreakDotsProps) {
  return (
    <ol
      aria-label={ariaLabel}
      className={cn(
        "flex w-full items-center justify-between gap-1",
        className,
      )}
    >
      {days.map((day, i) => {
        const isComplete = day.status === "complete";
        return (
          <li
            key={i}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
              {day.letter}
            </span>
            <span
              aria-hidden
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full",
                "transition-colors duration-200",
                isComplete
                  ? "bg-purple text-white shadow-[0_0_18px_-6px_var(--color-purple-glow)]"
                  : "border border-[var(--color-border-strong)] text-transparent",
              )}
            >
              {isComplete && <CheckGlyph />}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default WeekStreakDots;
