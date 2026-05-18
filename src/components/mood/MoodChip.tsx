"use client";

import { cn } from "@/lib/utils/cn";
import type { MoodOption } from "@/lib/mood/options";
import { MoodIcon } from "./MoodIcons";

type Props = {
  option: MoodOption;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export function MoodChip({ option, selected, disabled, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={option.label}
      className={cn(
        "group flex min-w-0 flex-1 flex-col items-center gap-2 rounded-[var(--radius-sm)]",
        "border bg-surface/60 px-1.5 py-3",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
        selected
          ? "border-purple/60 bg-purple/12 shadow-[0_0_24px_-12px_var(--color-purple-glow)]"
          : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
        disabled && "cursor-not-allowed opacity-50",
        "active:scale-[0.97]",
      )}
    >
      <span
        key={selected ? "active" : "idle"}
        aria-hidden
        className={cn(
          "transition-colors",
          selected
            ? "lockd-mood-confirm text-purple-bright"
            : "text-foreground/70 group-hover:text-foreground",
        )}
      >
        <MoodIcon id={option.id} className="h-7 w-7" />
      </span>
      <span
        className={cn(
          "text-[10.5px] font-medium leading-tight",
          selected ? "text-foreground" : "text-muted",
        )}
      >
        {option.label}
      </span>
    </button>
  );
}

export default MoodChip;
