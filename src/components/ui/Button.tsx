import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "./Spinner";

export const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2",
    "font-medium tracking-tight",
    "rounded-[var(--radius-sm)]",
    "transition-all duration-200",
    "active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
  ],
  {
    variants: {
      variant: {
        primary: [
          "text-white",
          "bg-gradient-to-b from-purple-bright to-purple",
          "shadow-[0_10px_30px_-12px_var(--color-purple-glow)]",
          "hover:brightness-110 hover:shadow-[0_14px_36px_-12px_var(--color-purple-glow)]",
          "disabled:hover:brightness-100",
        ],
        secondary: [
          "text-foreground",
          "bg-surface-elevated/70 backdrop-blur-xl",
          "border border-[var(--color-border)]",
          "hover:bg-surface-elevated hover:border-[var(--color-border-strong)]",
        ],
        ghost: [
          "text-muted",
          "bg-transparent",
          "hover:text-foreground hover:bg-surface-glass",
        ],
        danger: [
          "text-white",
          "bg-danger",
          "shadow-[0_10px_30px_-12px_rgba(251,113,133,0.45)]",
          "hover:brightness-110",
        ],
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-6 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    variant,
    size,
    fullWidth,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        buttonVariants({ variant, size, fullWidth }),
        className,
      )}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2",
          loading && "opacity-0",
        )}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </button>
  );
});

export default Button;
