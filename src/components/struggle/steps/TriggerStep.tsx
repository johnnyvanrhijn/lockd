"use client";

import { StruggleShell } from "../StruggleShell";
import { cn } from "@/lib/utils/cn";
import { TRIGGER_OPTIONS, type Trigger } from "@/lib/struggle/copy";

type Props = {
  onSelect: (trigger: Trigger) => void;
  onClose: () => void;
};

/**
 * Screen 3 — trigger identification. Chip grid; one selection; auto-advance.
 */
export function TriggerStep({ onSelect, onClose }: Props) {
  return (
    <StruggleShell eyebrow="Stap 2" onClose={onClose}>
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
        Wat speelt{" "}
        <span className="text-purple-bright">nu</span>?
      </h1>
      <p className="text-sm text-muted">Eén tap is genoeg.</p>

      <div className="mt-4 grid w-full grid-cols-2 gap-2">
        {TRIGGER_OPTIONS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onSelect(t.key)}
            className={cn(
              "flex items-center justify-center rounded-[var(--radius-sm)] border px-3 py-3.5",
              "border-[var(--color-border)] bg-surface/60 text-sm font-semibold text-foreground/90",
              "transition-all duration-200 active:scale-[0.98]",
              "hover:border-purple/55 hover:bg-purple/8 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </StruggleShell>
  );
}

export default TriggerStep;
