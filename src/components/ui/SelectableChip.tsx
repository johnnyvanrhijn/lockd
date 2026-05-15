import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SelectableChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  selected?: boolean;
  leftIcon?: ReactNode;
};

export function SelectableChip({
  children,
  selected = false,
  leftIcon,
  className,
  type = "button",
  disabled,
  ...rest
}: SelectableChipProps) {
  return (
    <button
      {...rest}
      type={type}
      role="checkbox"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-full border px-3.5 py-1.5",
        "text-sm font-medium tracking-tight",
        "transition-all duration-150",
        "active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-purple bg-purple/15 text-purple-bright"
          : "border-[var(--color-border)] bg-surface-glass text-muted hover:text-foreground hover:border-[var(--color-border-strong)]",
        className,
      )}
    >
      {leftIcon && <span className="[&_svg]:h-4 [&_svg]:w-4">{leftIcon}</span>}
      {children}
    </button>
  );
}

export default SelectableChip;
