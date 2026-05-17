"use client";

import { cn } from "@/lib/utils/cn";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  /** Optional value to display contextually (e.g. "Eerst: 8"). */
  contextLabel?: string;
};

/**
 * 1–10 urge intensity slider. The big number above is the primary
 * affordance; the slider track adapts color across three zones so the user
 * gets an immediate read on what kind of intensity they just declared.
 */
export function UrgeSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  contextLabel,
}: Props) {
  const tone = toneFor(value);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <span
        className={cn(
          "text-[64px] font-semibold leading-none tabular-nums tracking-tight",
          tone === "neutral" && "text-foreground",
          tone === "warning" && "text-warning",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
      </span>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        aria-label="Drang intensiteit"
        className={cn(
          "w-full appearance-none bg-transparent",
          "h-8",
          "lockd-urge-slider",
        )}
        style={
          {
            "--urge-fill":
              tone === "neutral"
                ? "var(--color-purple-bright)"
                : tone === "warning"
                  ? "var(--color-warning)"
                  : "var(--color-danger)",
            "--urge-pct": `${((value - min) / (max - min)) * 100}%`,
          } as React.CSSProperties
        }
      />

      <div className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
        <span>1 · laag</span>
        <span>10 · hoog</span>
      </div>

      {contextLabel && (
        <span className="text-[11px] text-muted">{contextLabel}</span>
      )}
    </div>
  );
}

function toneFor(v: number): "neutral" | "warning" | "danger" {
  if (v <= 4) return "neutral";
  if (v <= 7) return "warning";
  return "danger";
}

export default UrgeSlider;
