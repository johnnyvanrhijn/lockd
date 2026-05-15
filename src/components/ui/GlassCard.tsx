import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Adds a subtle purple glow halo around the card. */
  glow?: boolean;
  /** Removes internal padding so children control spacing. */
  flush?: boolean;
};

export function GlassCard({
  children,
  className,
  glow = false,
  flush = false,
  ...rest
}: GlassCardProps) {
  return (
    <div
      {...rest}
      className={cn(
        "relative rounded-[var(--radius-card)]",
        "border border-[var(--color-border-subtle)]",
        "bg-surface/70 backdrop-blur-xl",
        "shadow-[var(--shadow-card)]",
        flush ? "p-0" : "p-5",
        glow && "shadow-[var(--shadow-glow)]",
        className,
      )}
    >
      {glow && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[var(--radius-card)]",
            "bg-gradient-to-br from-purple/15 via-transparent to-transparent",
          )}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

export default GlassCard;
