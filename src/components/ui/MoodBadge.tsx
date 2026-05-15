import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type Mood = "strong" | "okay" | "struggle" | "heavy" | "unknown";

type MoodBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  mood: Mood;
  /** Show the textual label next to the emoji. Defaults to true. */
  showLabel?: boolean;
};

const moodConfig: Record<
  Mood,
  { emoji: string; label: string; wrapper: string }
> = {
  strong: {
    emoji: "💪",
    label: "Strong",
    wrapper: "bg-success/12 text-success border-success/25",
  },
  okay: {
    emoji: "🙂",
    label: "Okay",
    wrapper: "bg-info/12 text-info border-info/25",
  },
  struggle: {
    emoji: "😬",
    label: "Struggle",
    wrapper: "bg-warning/12 text-warning border-warning/25",
  },
  heavy: {
    emoji: "🌑",
    label: "Heavy",
    wrapper: "bg-danger/12 text-danger border-danger/25",
  },
  unknown: {
    emoji: "❔",
    label: "Onbekend",
    wrapper: "bg-surface-elevated text-muted border-[var(--color-border)]",
  },
};

export function MoodBadge({
  mood,
  showLabel = true,
  className,
  ...rest
}: MoodBadgeProps) {
  const config = moodConfig[mood];

  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-full border px-2.5 py-1",
        "text-xs font-medium tracking-tight",
        config.wrapper,
        className,
      )}
    >
      <span aria-hidden className="text-sm leading-none">
        {config.emoji}
      </span>
      {showLabel && config.label}
    </span>
  );
}

export default MoodBadge;
