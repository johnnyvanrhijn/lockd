import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: StatusTone;
  /** Show a small filled dot before the label. */
  dot?: boolean;
};

const toneClasses: Record<StatusTone, { wrapper: string; dot: string }> = {
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
    wrapper: "bg-purple/15 text-purple-bright border-purple/30",
    dot: "bg-purple-bright",
  },
  neutral: {
    wrapper:
      "bg-surface-elevated text-muted border-[var(--color-border-subtle)]",
    dot: "bg-muted",
  },
};

export function StatusBadge({
  children,
  className,
  tone = "neutral",
  dot = true,
  ...rest
}: StatusBadgeProps) {
  const tones = toneClasses[tone];

  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-full border px-2.5 py-1",
        "text-xs font-medium tracking-tight",
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
