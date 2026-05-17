"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Total duration in seconds. */
  durationSeconds: number;
  /** Fires when the countdown reaches 0. */
  onComplete: () => void;
  /** Eyebrow label inside the ring (default: "Resterend"). */
  label?: string;
  size?: number;
  strokeWidth?: number;
  /** External pause control. */
  paused?: boolean;
};

/**
 * Circular countdown progress ring. Counts down from `durationSeconds` and
 * fires `onComplete` exactly once when the timer hits zero. The visible
 * dashOffset transitions on every tick so the ring sweeps smoothly.
 */
export function CountdownRing({
  durationSeconds,
  onComplete,
  label = "Resterend",
  size = 260,
  strokeWidth = 6,
  paused = false,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    if (paused) return;
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onComplete, paused]);

  const elapsed = durationSeconds - secondsLeft;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - elapsed / durationSeconds);

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient
            id="countdown-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#countdown-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-bright">
          {label}
        </span>
        <span className="text-[56px] font-semibold leading-none tabular-nums tracking-tight text-foreground">
          {mm}:{ss.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

export default CountdownRing;
