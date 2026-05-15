import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  size?: "md" | "lg";
};

const sizeClasses: Record<NonNullable<PrimaryButtonProps["size"]>, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

export function PrimaryButton({
  children,
  className,
  fullWidth = false,
  size = "lg",
  type = "button",
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-[var(--radius-button)] font-medium tracking-tight",
        "text-white",
        "bg-gradient-to-b from-purple-bright to-purple",
        "shadow-[0_10px_30px_-12px_var(--color-purple-glow)]",
        "transition-all duration-200",
        "hover:brightness-110 hover:shadow-[0_14px_36px_-12px_var(--color-purple-glow)]",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100",
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
