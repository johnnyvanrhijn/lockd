"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { TONE_OPTIONS, SUPPORT_OPTIONS } from "@/lib/onboarding/options";

export type ToneId = "soft" | "neutral" | "direct" | "confronting";

type Props = {
  initialTone: ToneId;
  initialSupport: string[];
  initialActive: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (next: {
    tone: ToneId;
    support: string[];
    active: boolean;
  }) => void;
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
 * Composite editor for the "Ondersteuning" section: tone of voice (single),
 * support modes (multi), and the active-intervention toggle.
 */
export function SupportEditSheet({
  initialTone,
  initialSupport,
  initialActive,
  saving,
  onClose,
  onSave,
}: Props) {
  const [tone, setTone] = useState<ToneId>(initialTone);
  const [support, setSupport] = useState<string[]>(initialSupport);
  const [active, setActive] = useState(initialActive);

  function toggleSupport(id: string) {
    setSupport((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Bewerk ondersteuning"
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
          "max-h-[90vh]",
          "rounded-t-[var(--radius-lg)] border-t border-[var(--color-border-strong)]",
          "bg-surface px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3",
          "shadow-[0_-20px_60px_-20px_rgba(139,92,246,0.35)]",
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-[var(--color-border-strong)]" />

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              Ondersteuning
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Hoe wil je geholpen worden?
            </h2>
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

        <div className="mt-4 flex flex-1 flex-col gap-5 overflow-y-auto pb-3 pr-1">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
              Tone
            </span>
            <div className="flex flex-col gap-2">
              {TONE_OPTIONS.map((t) => {
                const isSelected = tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setTone(t.id as ToneId)}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border px-4 py-3 text-left",
                      "transition-all duration-200 active:scale-[0.99]",
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
                    )}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {t.label}
                      </span>
                      <span className="text-[11px] text-muted">
                        {t.description}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
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
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
              Wat helpt jou?
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORT_OPTIONS.map((opt) => {
                const isSelected = support.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggleSupport(opt.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border px-3 py-2.5",
                      "text-left text-xs font-semibold",
                      "transition-all duration-200 active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                      isSelected
                        ? [
                            "border-purple/60 bg-purple/10 text-foreground",
                            "shadow-[0_0_22px_-14px_var(--color-purple-glow)]",
                          ]
                        : [
                            "border-[var(--color-border)] bg-surface/60 text-foreground/85",
                            "hover:border-[var(--color-border-strong)]",
                          ],
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
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
          </div>

          <div
            className={cn(
              "flex items-center justify-between gap-3",
              "rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface/60 px-4 py-3",
            )}
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                Actief ingrijpen
              </span>
              <span className="text-[11px] text-muted">
                LOCKD onderbreekt jou actief op risicomomenten.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setActive((v) => !v)}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                active
                  ? "bg-purple shadow-[0_0_18px_-6px_var(--color-purple-glow)]"
                  : "bg-surface-elevated",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-foreground shadow",
                  "transition-transform duration-200",
                  active ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <GhostButton onClick={onClose} disabled={saving}>
            Annuleer
          </GhostButton>
          <PrimaryButton
            onClick={() => onSave({ tone, support, active })}
            loading={saving}
            disabled={saving}
            fullWidth
          >
            Opslaan
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default SupportEditSheet;
