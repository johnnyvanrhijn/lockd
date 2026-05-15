"use client";

import { useEffect, useMemo, useState } from "react";
import { StruggleShell } from "../StruggleShell";
import { BreathingHalo } from "../BreathingHalo";
import { cn } from "@/lib/utils/cn";
import {
  TIMER_BEATS,
  TIMER_DURATION_SECONDS,
} from "@/lib/struggle/copy";

type Props = {
  onComplete: () => void;
  onClose: () => void;
};

const SIZE = 260;
const STROKE = 6;

/**
 * Screen 7 — guided timer. 90 seconds. Soft halo behind. Spoken beats appear
 * as on-screen captions every 15s (the audio "Luister" button is a non-active
 * "Binnenkort" badge for v1).
 */
export function TimerStep({ onComplete, onClose }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onComplete]);

  const elapsed = TIMER_DURATION_SECONDS - secondsLeft;
  const beat = useMemo(() => {
    let active = TIMER_BEATS[0];
    for (const b of TIMER_BEATS) {
      if (b.atSecond <= elapsed) active = b;
    }
    return active;
  }, [elapsed]);

  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference * (1 - elapsed / TIMER_DURATION_SECONDS);

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  return (
    <StruggleShell eyebrow="Stap 6" onClose={onClose} pulledDown>
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 flex items-center justify-center"
        >
          <BreathingHalo size={SIZE + 40} slow />
        </div>

        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden
        >
          <defs>
            <linearGradient
              id="timer-gradient"
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
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            fill="none"
            stroke="url(#timer-gradient)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1s linear",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-bright">
            Resterend
          </span>
          <span className="text-[56px] font-semibold leading-none tabular-nums tracking-tight text-foreground">
            {mm}:{ss.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <p
        key={beat.atSecond}
        className="lockd-fade-rise text-[15px] font-medium leading-relaxed text-foreground/90"
      >
        {beat.text}
      </p>

      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
          "border border-[var(--color-border)] bg-surface/50",
          "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted",
        )}
        aria-label="Audio modus binnenkort beschikbaar"
        title="Binnenkort beschikbaar"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="h-3.5 w-3.5"
        >
          <path
            d="M11 4L6 8H3v8h3l5 4V4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M15 9c1 1 1 5 0 6M18 7c2 2 2 8 0 10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        Luister · binnenkort
      </span>
    </StruggleShell>
  );
}

export default TimerStep;
