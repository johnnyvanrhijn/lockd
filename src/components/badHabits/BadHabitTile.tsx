"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
  title: ReactNode;
  selected?: boolean;
  /** Optional Lucide-style icon. Rendered above the label when present. */
  icon?: ReactNode;
};

/**
 * Compact tile used in the bad-habits 3×N selection grid in onboarding.
 *
 * Visual states mirror the rest of the design system: neutral glass at rest,
 * Iris-tinted border + soft glow when selected, dimmed when disabled. When
 * an icon is provided it sits above a centered label; without an icon the
 * label centers vertically.
 */
export function BadHabitTile({
  title,
  selected = false,
  icon,
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
        "relative flex aspect-square w-full flex-col items-center justify-center gap-1.5",
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
      {icon && (
        <span
          aria-hidden
          className={cn(
            "flex h-8 w-8 items-center justify-center",
            "[&_svg]:h-6 [&_svg]:w-6",
            "transition-colors duration-200",
            selected ? "text-purple-bright" : "text-foreground/70",
          )}
        >
          {icon}
        </span>
      )}
      <span
        className={cn(
          "block text-[12px] font-semibold leading-tight",
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
