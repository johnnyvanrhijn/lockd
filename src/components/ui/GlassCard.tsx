import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const glassCardVariants = cva(
  [
    "relative",
    "rounded-[var(--radius-md)]",
    "border border-[var(--color-border)]",
    "bg-surface/70 backdrop-blur-xl",
    "shadow-[var(--shadow-card)]",
  ],
  {
    variants: {
      tone: {
        default: "",
        elevated: "bg-surface-elevated/80 border-[var(--color-border-strong)]",
        purple:
          "border-purple/30 bg-gradient-to-br from-purple/15 via-surface/70 to-surface/70",
        success: "border-success/25 bg-success/5",
        danger: "border-danger/25 bg-danger/5",
      },
      glow: {
        none: "",
        soft: "shadow-[var(--shadow-glow)]",
        strong: "shadow-[var(--shadow-glow-strong)]",
        success: "shadow-[var(--shadow-glow-success)]",
        danger: "shadow-[var(--shadow-glow-danger)]",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
      },
      interactive: {
        true: [
          "cursor-pointer transition-all duration-200",
          "hover:border-[var(--color-border-strong)] hover:bg-surface-elevated/80",
          "active:scale-[0.99]",
        ],
      },
    },
    defaultVariants: {
      tone: "default",
      glow: "none",
      padding: "md",
    },
  },
);

export type GlassCardProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof glassCardVariants> & {
    children: ReactNode;
  };

export function GlassCard({
  children,
  className,
  tone,
  glow,
  padding,
  interactive,
  ...rest
}: GlassCardProps) {
  return (
    <div
      {...rest}
      className={cn(
        glassCardVariants({ tone, glow, padding, interactive }),
        className,
      )}
    >
      {(glow === "soft" || glow === "strong") && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[var(--radius-md)]",
            "bg-gradient-to-br from-purple/15 via-transparent to-transparent",
          )}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

export default GlassCard;
