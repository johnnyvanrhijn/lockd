import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  size?: "md" | "lg";
};

const sizeClasses: Record<NonNullable<SecondaryButtonProps["size"]>, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

export function SecondaryButton({
  children,
  className,
  fullWidth = false,
  size = "lg",
  type = "button",
  ...rest
}: SecondaryButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-[var(--radius-button)] font-medium tracking-tight",
        "text-foreground",
        "bg-surface-elevated/70 backdrop-blur-xl",
        "border border-[var(--color-border-subtle)]",
        "transition-all duration-200",
        "hover:bg-surface-elevated hover:border-[var(--color-border-strong)]",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default SecondaryButton;
