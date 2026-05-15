import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "./Spinner";

const iconButtonVariants = cva(
  [
    "relative inline-flex items-center justify-center",
    "rounded-[var(--radius-sm)]",
    "transition-all duration-200",
    "active:scale-[0.95]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
  ],
  {
    variants: {
      variant: {
        primary: [
          "text-white",
          "bg-gradient-to-b from-purple-bright to-purple",
          "shadow-[0_8px_24px_-10px_var(--color-purple-glow)]",
          "hover:brightness-110",
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
      },
      size: {
        sm: "h-9 w-9 [&_svg]:h-4 [&_svg]:w-4",
        md: "h-11 w-11 [&_svg]:h-5 [&_svg]:w-5",
        lg: "h-14 w-14 [&_svg]:h-6 [&_svg]:w-6",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof iconButtonVariants> & {
    /** Required for a11y — describes the action triggered by the button. */
    "aria-label": string;
    icon: ReactNode;
    loading?: boolean;
  };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      className,
      variant,
      size,
      loading = false,
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
        className={cn(iconButtonVariants({ variant, size }), className)}
      >
        {loading ? <Spinner /> : icon}
      </button>
    );
  },
);

export default IconButton;
