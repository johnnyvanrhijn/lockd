import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ToggleRowProps = {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className,
}: ToggleRowProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex w-full items-center gap-4",
        "rounded-[var(--radius-sm)] py-3",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-xs text-muted">{description}</span>
        )}
      </div>

      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            "h-7 w-12 rounded-full p-0.5 transition-colors duration-200",
            "bg-surface-elevated border border-[var(--color-border)]",
            "peer-checked:bg-gradient-to-r peer-checked:from-purple-bright peer-checked:to-purple",
            "peer-checked:border-transparent",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-purple-bright/70 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          )}
        >
          <span
            className={cn(
              "block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
              checked ? "translate-x-5" : "translate-x-0",
            )}
          />
        </span>
      </span>
    </label>
  );
}

export default ToggleRow;
