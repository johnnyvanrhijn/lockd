import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  leftIcon?: ReactNode;
  /** Render as full-width by default; pass `false` to inline-size. */
  fullWidth?: boolean;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      hint,
      error,
      leftIcon,
      fullWidth = true,
      id,
      className,
      type = "text",
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? `text-field-${reactId}`;
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    return (
      <div className={cn(fullWidth && "w-full", "flex flex-col gap-2")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "relative flex items-center",
            "rounded-[var(--radius-sm)] border bg-surface-elevated/70 backdrop-blur-xl",
            "transition-colors duration-150",
            "focus-within:ring-2 focus-within:ring-purple-bright/70 focus-within:ring-offset-2 focus-within:ring-offset-background",
            error
              ? "border-danger/60 focus-within:border-danger"
              : "border-[var(--color-border)] focus-within:border-purple",
          )}
        >
          {leftIcon && (
            <span className="pointer-events-none flex h-full items-center pl-4 text-muted [&_svg]:h-5 [&_svg]:w-5">
              {leftIcon}
            </span>
          )}
          <input
            {...rest}
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "min-w-0 flex-1 bg-transparent outline-none",
              "px-4 py-3.5 text-base font-medium text-foreground placeholder:text-muted/70",
              leftIcon && "pl-2",
              className,
            )}
          />
        </div>
        {error ? (
          <span id={`${inputId}-error`} className="text-xs text-danger">
            {error}
          </span>
        ) : hint ? (
          <span id={`${inputId}-hint`} className="text-xs text-muted">
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);

export default TextField;
