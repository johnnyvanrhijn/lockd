import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const iconBadgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "shrink-0 rounded-[var(--radius-sm)]",
  ],
  {
    variants: {
      tone: {
        purple: "bg-purple/20 text-purple-bright",
        success: "bg-success/15 text-success",
        warning: "bg-warning/15 text-warning",
        danger: "bg-danger/15 text-danger",
        info: "bg-info/15 text-info",
        neutral: "bg-surface-elevated text-muted",
      },
      size: {
        sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
        md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
        lg: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
      },
      shape: {
        square: "rounded-[var(--radius-sm)]",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      tone: "purple",
      size: "md",
      shape: "square",
    },
  },
);

export type IconBadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof iconBadgeVariants> & {
    icon: ReactNode;
  };

export function IconBadge({
  icon,
  className,
  tone,
  size,
  shape,
  ...rest
}: IconBadgeProps) {
  return (
    <span
      {...rest}
      className={cn(iconBadgeVariants({ tone, size, shape }), className)}
    >
      {icon}
    </span>
  );
}

export default IconBadge;
