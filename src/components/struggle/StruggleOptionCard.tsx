"use client";

import { cn } from "@/lib/utils/cn";

type Props = {
  title: string;
  description?: string;
  /** Optional trailing meta (e.g. "90s"). */
  meta?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

/**
 * Card variant for the intervention picker. Larger touch target than a chip,
 * primary text + description, optional meta on the right.
 */
export function StruggleOptionCard({
  title,
  description,
  meta,
  selected,
  onSelect,
  disabled,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group flex w-full items-start gap-3 rounded-[var(--radius-sm)]",
        "border px-4 py-3.5 text-left",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
        selected
          ? "border-purple/60 bg-purple/12 shadow-[0_0_28px_-14px_var(--color-purple-glow)]"
          : "border-[var(--color-border)] bg-surface/60 hover:border-[var(--color-border-strong)]",
        disabled && "cursor-not-allowed opacity-50",
        "active:scale-[0.997]",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {description && (
          <span className="text-[11px] leading-relaxed text-muted">
            {description}
          </span>
        )}
      </div>
      {meta && (
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-bright">
          {meta}
        </span>
      )}
    </button>
  );
}

export default StruggleOptionCard;
