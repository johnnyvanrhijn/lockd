"use client";

import { cn } from "@/lib/utils/cn";

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Confirmation modal shown when the user taps Close mid-flow. Per brand: no
 * guilt, no shame. Two equally weighted options — one supportive, one neutral.
 */
export function CloseConfirmDialog({ onCancel, onConfirm }: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="struggle-close-title"
    >
      <button
        type="button"
        aria-label="Sluit dialoog"
        onClick={onCancel}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />
      <div
        className={cn(
          "relative w-full max-w-[400px] px-4",
          "pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-2",
        )}
      >
        <div
          className={cn(
            "lockd-fade-rise flex flex-col gap-5 rounded-[var(--radius-lg)]",
            "border border-[var(--color-border-strong)] bg-surface",
            "px-5 py-6 text-center",
            "shadow-[0_-20px_60px_-20px_rgba(139,92,246,0.4)]",
          )}
        >
          <h2
            id="struggle-close-title"
            className="text-lg font-semibold leading-snug text-foreground"
          >
            Weet je zeker dat je dit moment alleen wilt dragen?
          </h2>
          <p className="text-xs text-muted">
            Soms is één minuut genoeg om de drang te zien zakken.
          </p>

          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "flex w-full items-center justify-center rounded-[var(--radius-sm)]",
                "h-12 bg-purple text-sm font-semibold text-foreground",
                "transition-all duration-200 active:scale-[0.98]",
                "shadow-[0_0_28px_-8px_var(--color-purple-glow)]",
                "hover:bg-purple-bright",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
              )}
            >
              Blijf nog 1 minuut
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                "flex w-full items-center justify-center rounded-[var(--radius-sm)]",
                "h-12 text-sm font-medium text-muted",
                "transition-colors hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/40",
              )}
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CloseConfirmDialog;
