import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SelectableCardProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "title"
> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  selected?: boolean;
};

export function SelectableCard({
  title,
  description,
  icon,
  selected = false,
  className,
  type = "button",
  disabled,
  ...rest
}: SelectableCardProps) {
  return (
    <button
      {...rest}
      type={type}
      role="checkbox"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className={cn(
        "group relative flex w-full flex-col items-start gap-2",
        "rounded-[var(--radius-md)] p-4 text-left",
        "border border-[var(--color-border)] bg-surface/70 backdrop-blur-xl",
        "transition-all duration-200",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? [
              "border-purple/60 bg-purple/10",
              "shadow-[0_0_40px_-12px_var(--color-purple-glow)]",
            ]
          : "hover:border-[var(--color-border-strong)] hover:bg-surface-elevated/70",
        className,
      )}
    >
      <div className="flex w-full items-start gap-3">
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center",
              "rounded-[var(--radius-sm)]",
              "[&_svg]:h-5 [&_svg]:w-5",
              selected
                ? "bg-purple/25 text-purple-bright"
                : "bg-surface-elevated text-muted",
            )}
          >
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {description && (
            <span className="text-xs text-muted">{description}</span>
          )}
        </div>
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            "border transition-colors",
            selected
              ? "border-purple-bright bg-purple-bright text-background"
              : "border-[var(--color-border-strong)] bg-transparent",
          )}
        >
          {selected && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
              <path
                d="M2.5 6.5l2.2 2.2L9.5 3.8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
    </button>
  );
}

export default SelectableCard;
