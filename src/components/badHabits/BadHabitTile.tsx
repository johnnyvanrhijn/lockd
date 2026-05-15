"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
  title: ReactNode;
  selected?: boolean;
};

/**
 * A compact tile used in the bad-habits 4×4 selection grid in onboarding.
 *
 * Visual states mirror the rest of the design system: neutral glass at rest,
 * Iris-tinted border + soft glow when selected, dimmed when disabled. The
 * label is centered and clamps to two lines so longer Dutch words ("Series
 * bingen", "Slechte grenzen") never break the grid rhythm.
 */
export function BadHabitTile({
  title,
  selected = false,
  className,
  type = "button",
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      type={type}
      role="checkbox"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className={cn(
        "relative flex aspect-square w-full items-center justify-center",
        "rounded-[var(--radius-md)] p-2 text-center",
        "border bg-surface/70 backdrop-blur-xl",
        "transition-all duration-200",
        "active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? [
              "border-purple/60 bg-purple/10",
              "shadow-[0_0_28px_-12px_var(--color-purple-glow)]",
            ]
          : [
              "border-[var(--color-border)]",
              "hover:border-[var(--color-border-strong)] hover:bg-surface-elevated/70",
            ],
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      <span
        className={cn(
          "block text-xs font-semibold leading-tight",
          "line-clamp-2 break-words",
          selected ? "text-foreground" : "text-foreground/85",
        )}
      >
        {title}
      </span>
      {selected && (
        <span
          aria-hidden
          className={cn(
            "absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center",
            "rounded-full bg-purple-bright text-background",
          )}
        >
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none">
            <path
              d="M2 5.2l1.8 1.8L8 2.8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
}

export default BadHabitTile;
