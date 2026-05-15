import type { SVGProps } from "react";
import { cn } from "@/lib/utils/cn";

type SpinnerProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

/**
 * Inline loading spinner. Inherits the current text color so it matches
 * whichever surface it's placed on.
 */
export function Spinner({ size = 16, className, ...rest }: SpinnerProps) {
  return (
    <svg
      {...rest}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 1-9 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Spinner;
