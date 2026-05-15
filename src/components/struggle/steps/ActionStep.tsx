"use client";

import { StruggleShell } from "../StruggleShell";
import { cn } from "@/lib/utils/cn";

type Props = {
  action: string;
  onStart: () => void;
  onClose: () => void;
};

/**
 * Screen 6 — single interruption action. One sentence; one CTA ("Start").
 */
export function ActionStep({ action, onStart, onClose }: Props) {
  return (
    <StruggleShell
      eyebrow="Stap 5"
      onClose={onClose}
      actions={
        <button
          type="button"
          onClick={onStart}
          className={cn(
            "flex w-full items-center justify-center rounded-[var(--radius-sm)]",
            "h-14 bg-purple text-sm font-semibold text-foreground",
            "transition-all duration-200 active:scale-[0.98]",
            "shadow-[0_0_28px_-8px_var(--color-purple-glow)]",
            "hover:bg-purple-bright",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
          )}
        >
          Start
        </button>
      }
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
        Verplaats je aandacht
      </span>
      <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-foreground">
        {action}
      </h1>
      <p className="text-xs leading-relaxed text-muted">
        Het hoeft niet groot. Het hoeft alleen anders.
      </p>
    </StruggleShell>
  );
}

export default ActionStep;
