"use client";

import { type ChangeEvent, useState } from "react";
import { StruggleShell } from "../StruggleShell";
import { cn } from "@/lib/utils/cn";

type Props = {
  onSelect: (value: number) => void;
  onClose: () => void;
};

/**
 * Screen 4 — urge intensity. 1–10 slider; tapping "Bevestig" advances. We
 * deliberately don't auto-advance here: dragging the slider sometimes lands
 * on the wrong number, so a single confirmation tap respects intent.
 */
export function IntensityStep({ onSelect, onClose }: Props) {
  const [value, setValue] = useState(5);
  const pct = ((value - 1) / 9) * 100;

  function tone(): "calm" | "warning" | "danger" {
    if (value <= 3) return "calm";
    if (value <= 6) return "warning";
    return "danger";
  }
  const t = tone();

  return (
    <StruggleShell
      eyebrow="Stap 3"
      onClose={onClose}
      actions={
        <button
          type="button"
          onClick={() => onSelect(value)}
          className={cn(
            "flex w-full items-center justify-center rounded-[var(--radius-sm)]",
            "h-14 bg-purple text-sm font-semibold text-foreground",
            "transition-all duration-200 active:scale-[0.98]",
            "shadow-[0_0_28px_-8px_var(--color-purple-glow)]",
            "hover:bg-purple-bright",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
          )}
        >
          Bevestig
        </button>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
        Hoe sterk voelt de{" "}
        <span className="text-purple-bright">drang</span>?
      </h1>

      <div className="mt-4 flex flex-col items-center gap-3">
        <span
          className={cn(
            "text-[80px] font-semibold leading-none tabular-nums tracking-tight",
            t === "calm" && "text-foreground",
            t === "warning" && "text-warning",
            t === "danger" && "text-danger",
          )}
        >
          {value}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
          1 = laag · 10 = hoog
        </span>
      </div>

      <div className="relative mt-2 h-10 w-full select-none">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setValue(Number(e.target.value))
          }
          aria-label="Drang-intensiteit"
          className={cn(
            "absolute inset-0 w-full appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-purple-bright",
            "[&::-webkit-slider-thumb]:shadow-[0_0_22px_-2px_var(--color-purple-glow)]",
            "[&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-background",
            "[&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-purple-bright",
            "[&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-background",
          )}
        />
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-bright to-purple"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex w-full justify-between px-1 text-[10px] uppercase tracking-[0.2em] text-muted">
        <span>Laag</span>
        <span>Hoog</span>
      </div>
    </StruggleShell>
  );
}

export default IntensityStep;
