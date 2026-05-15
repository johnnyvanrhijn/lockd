import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "purple" | "success" | "warning" | "danger";

type CircularProgressProps = {
  /** Current value (0..max). */
  value: number;
  max?: number;
  /** Diameter in pixels. */
  size?: number;
  /** Stroke width in pixels for both the track and the fill arc. */
  strokeWidth?: number;
  tone?: Tone;
  /** Slot for an icon or number rendered centered inside the ring. */
  children?: ReactNode;
  /** Accessible label. Falls back to "X of Y". */
  label?: string;
  className?: string;
};

const toneStops: Record<Tone, { from: string; to: string }> = {
  purple: { from: "#A78BFA", to: "#8B5CF6" },
  success: { from: "#86EFAC", to: "#4ADE80" },
  warning: { from: "#FCD34D", to: "#FB923C" },
  danger: { from: "#FDA4AF", to: "#FB7185" },
};

export function CircularProgress({
  value,
  max = 100,
  size = 160,
  strokeWidth = 10,
  tone = "purple",
  children,
  label,
  className,
}: CircularProgressProps) {
  const safeMax = Math.max(1, max);
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const pct = clamped / safeMax;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  const stops = toneStops[tone];
  const gradientId = `lockd-progress-gradient-${tone}`;

  return (
    <div
      role="img"
      aria-label={label ?? `${clamped} van ${safeMax}`}
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="block -rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={stops.from} />
            <stop offset="100%" stopColor={stops.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition:
              "stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>
      {children && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default CircularProgress;
