import { cn } from "@/lib/utils/cn";
import type { Mood } from "./MoodBadge";

type MoodSelectorProps = {
  value: Mood | null;
  onChange: (mood: Mood) => void;
  /** Hide the "unknown" mood from the selector. Defaults to true. */
  hideUnknown?: boolean;
  className?: string;
};

const moodOrder: ReadonlyArray<{ mood: Mood; emoji: string; label: string }> = [
  { mood: "strong", emoji: "💪", label: "Strong" },
  { mood: "okay", emoji: "🙂", label: "Okay" },
  { mood: "struggle", emoji: "😬", label: "Struggle" },
  { mood: "heavy", emoji: "🌑", label: "Heavy" },
  { mood: "unknown", emoji: "❔", label: "Onbekend" },
];

export function MoodSelector({
  value,
  onChange,
  hideUnknown = true,
  className,
}: MoodSelectorProps) {
  const moods = hideUnknown
    ? moodOrder.filter((m) => m.mood !== "unknown")
    : moodOrder;

  return (
    <div
      role="radiogroup"
      aria-label="Mood"
      className={cn("flex w-full items-center justify-between gap-2", className)}
    >
      {moods.map(({ mood, emoji, label }) => {
        const isSelected = value === mood;
        return (
          <button
            key={mood}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(mood)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1.5",
              "rounded-[var(--radius-sm)] py-3",
              "border transition-all duration-150",
              "active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70",
              isSelected
                ? "border-purple bg-purple/15"
                : "border-[var(--color-border)] bg-surface-glass hover:border-[var(--color-border-strong)]",
            )}
          >
            <span aria-hidden className="text-2xl leading-none">
              {emoji}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium tracking-tight",
                isSelected ? "text-foreground" : "text-muted",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default MoodSelector;
