"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";

export type OptionEntry = {
  id: string;
  label: string;
  description?: string;
};

type Props = {
  title: string;
  eyebrow: string;
  subtitle?: string;
  options: ReadonlyArray<OptionEntry>;
  multi: boolean;
  initialSelected: string[];
  /** For multi: optional cap (disables other options when reached). */
  maxSelections?: number;
  /** Whether a single-select can have no choice. Default false (forces one). */
  allowEmptySingle?: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (selected: string[]) => void;
};

function CloseGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" aria-hidden>
      <path
        d="M2 5.2l1.8 1.8L8 2.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Generic single/multi-select bottom-sheet for editing onboarding answers
 * inline from /profiel. Mirrors the look of the onboarding option lists so
 * the user feels at home, without redirecting through the full flow.
 */
export function OptionListEditSheet({
  title,
  eyebrow,
  subtitle,
  options,
  multi,
  initialSelected,
  maxSelections,
  allowEmptySingle = false,
  saving,
  onClose,
  onSave,
}: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const atMax =
    multi && typeof maxSelections === "number" && selected.length >= maxSelections;

  function toggle(id: string) {
    if (!multi) {
      setSelected([id]);
      return;
    }
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (typeof maxSelections === "number" && prev.length >= maxSelections) {
        return prev;
      }
      return [...prev, id];
    });
  }

  const canSubmit =
    !saving && (multi ? selected.length > 0 || true : selected.length > 0 || allowEmptySingle);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Bewerk ${title}`}
    >
      <button
        type="button"
        aria-label="Sluit"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative flex w-full max-w-[430px] flex-col",
          "max-h-[85vh]",
          "rounded-t-[var(--radius-lg)] border-t border-[var(--color-border-strong)]",
          "bg-surface px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3",
          "shadow-[0_-20px_60px_-20px_rgba(139,92,246,0.35)]",
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-[var(--color-border-strong)]" />

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              {eyebrow}
            </span>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="Sluit"
            onClick={onClose}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              "bg-surface-elevated text-muted",
              "hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            <CloseGlyph />
          </button>
        </div>

        <div className="mt-4 flex flex-1 flex-col gap-2 overflow-y-auto pb-3 pr-1">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const disabled = !isSelected && atMax;
            return (
              <button
                key={opt.id}
                type="button"
                role={multi ? "checkbox" : "radio"}
                aria-checked={isSelected}
                aria-disabled={disabled || undefined}
                disabled={disabled}
                onClick={() => toggle(opt.id)}
                className={cn(
                  "flex w-full items-start justify-between gap-3",
                  "rounded-[var(--radius-sm)] border px-4 py-3 text-left",
                  "transition-all duration-200",
                  "active:scale-[0.99]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                  isSelected
                    ? [
                        "border-purple/60 bg-purple/10",
                        "shadow-[0_0_24px_-14px_var(--color-purple-glow)]",
                      ]
                    : [
                        "border-[var(--color-border)] bg-surface/60",
                        "hover:border-[var(--color-border-strong)]",
                      ],
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span className="text-[11px] leading-relaxed text-muted">
                      {opt.description}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex shrink-0 items-center justify-center border",
                    multi ? "h-4 w-4 rounded-[4px]" : "h-5 w-5 rounded-full",
                    isSelected
                      ? "border-purple-bright bg-purple-bright text-background"
                      : "border-[var(--color-border-strong)]",
                  )}
                >
                  {isSelected && <CheckIcon />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <GhostButton onClick={onClose} disabled={saving}>
            Annuleer
          </GhostButton>
          <PrimaryButton
            onClick={() => onSave(selected)}
            loading={saving}
            disabled={!canSubmit}
            fullWidth
          >
            Opslaan
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default OptionListEditSheet;
