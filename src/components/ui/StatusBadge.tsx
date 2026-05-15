import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * StatusBadge tones come in two layers:
 *
 *   semantic — generic UI states (success, warning, danger, info, neutral)
 *   lockd    — domain states for behavioral tracking
 *              (locked_in, struggling, off_track, clean, relapse)
 *
 * Both share the same visual palette under the hood, so a domain tone is
 * just a styled alias for a semantic tone with a different default label.
 */
export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "locked_in"
  | "struggling"
  | "off_track"
  | "clean"
  | "relapse";

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: StatusTone;
  /** Show a small filled dot before the label. */
  dot?: boolean;
  size?: "sm" | "md";
};

const toneStyles: Record<StatusTone, { wrapper: string; dot: string }> = {
  success: {
    wrapper: "bg-success/12 text-success border-success/25",
    dot: "bg-success",
  },
  warning: {
    wrapper: "bg-warning/12 text-warning border-warning/25",
    dot: "bg-warning",
  },
  danger: {
    wrapper: "bg-danger/12 text-danger border-danger/25",
    dot: "bg-danger",
  },
  info: {
    wrapper: "bg-info/12 text-info border-info/30",
    dot: "bg-info",
  },
  neutral: {
    wrapper: "bg-surface-elevated text-muted border-[var(--color-border)]",
    dot: "bg-muted",
  },
  // Domain aliases — colors mirror the semantic tones above.
  locked_in: {
    wrapper: "bg-success/12 text-success border-success/25",
    dot: "bg-success",
  },
  struggling: {
    wrapper: "bg-warning/12 text-warning border-warning/25",
    dot: "bg-warning",
  },
  off_track: {
    wrapper: "bg-danger/12 text-danger border-danger/25",
    dot: "bg-danger",
  },
  clean: {
    wrapper: "bg-purple/15 text-purple-bright border-purple/30",
    dot: "bg-purple-bright",
  },
  relapse: {
    wrapper: "bg-danger/12 text-danger border-danger/25",
    dot: "bg-danger",
  },
};

const sizeStyles: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export function StatusBadge({
  children,
  className,
  tone = "neutral",
  dot = true,
  size = "md",
  ...rest
}: StatusBadgeProps) {
  const tones = toneStyles[tone];

  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-full border font-medium tracking-tight",
        sizeStyles[size],
        tones.wrapper,
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn("h-1.5 w-1.5 rounded-full", tones.dot)}
        />
      )}
      {children}
    </span>
  );
}

export default StatusBadge;
