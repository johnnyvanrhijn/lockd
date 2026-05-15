import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type LoadingSkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** Tailwind width class, e.g. "w-1/2". Defaults to full width. */
  width?: string;
  /** Tailwind height class, e.g. "h-6". Defaults to "h-4". */
  height?: string;
  /** Tailwind radius class, e.g. "rounded-full". Defaults to "rounded-md". */
  rounded?: string;
};

export function LoadingSkeleton({
  width = "w-full",
  height = "h-4",
  rounded = "rounded-md",
  className,
  ...rest
}: LoadingSkeletonProps) {
  return (
    <div
      {...rest}
      aria-hidden
      className={cn(
        "relative overflow-hidden bg-surface-elevated",
        "before:absolute before:inset-0",
        "before:-translate-x-full before:animate-[shimmer_1.6s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        width,
        height,
        rounded,
        className,
      )}
    />
  );
}

export default LoadingSkeleton;
