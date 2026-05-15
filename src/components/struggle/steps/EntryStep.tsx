"use client";

import { cn } from "@/lib/utils/cn";
import { StruggleShell } from "../StruggleShell";
import { BreathingHalo } from "../BreathingHalo";

type Props = {
  onContinue: () => void;
  onClose: () => void;
};

/**
 * Screen 1 — entry. Soft breathing halo, large typography, two actions:
 * primary ("Ik wil hulp") and secondary ("Sluiten"). No subtitle clutter.
 */
export function EntryStep({ onContinue, onClose }: Props) {
  return (
    <StruggleShell onClose={onClose} pulledDown>
      <div className="relative flex h-[180px] items-center justify-center">
        <BreathingHalo size={220} />
      </div>

      <h1 className="text-[34px] font-semibold leading-[1.1] tracking-tight text-foreground">
        Je bent niet je{" "}
        <span className="text-purple-bright">impuls</span>.
      </h1>
      <p className="text-sm leading-relaxed text-muted">
        Laten we 60 seconden winnen.
      </p>

      <div className="mt-6 flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={onContinue}
          className={cn(
            "flex w-full items-center justify-center rounded-[var(--radius-sm)]",
            "h-14 bg-purple text-sm font-semibold text-foreground",
            "transition-all duration-200 active:scale-[0.98]",
            "shadow-[0_0_32px_-8px_var(--color-purple-glow)]",
            "hover:bg-purple-bright",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
          )}
        >
          Ik wil hulp
        </button>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "flex w-full items-center justify-center",
            "h-12 text-sm font-medium text-muted",
            "transition-colors hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/40 rounded-[var(--radius-sm)]",
          )}
        >
          Sluiten
        </button>
      </div>
    </StruggleShell>
  );
}

export default EntryStep;
