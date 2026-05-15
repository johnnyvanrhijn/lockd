"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Shown in the top-left as a faint label ("Stap 3 / 7"). */
  eyebrow?: string;
  /** Whether to render the close (X) affordance in the top-right. */
  showClose?: boolean;
  onClose?: () => void;
  /** Slot content; vertically centered within the available height. */
  children: ReactNode;
  /** Pinned-bottom action slot (single CTA, per spec). */
  actions?: ReactNode;
  /** Increase top padding to push content lower (used on entry / completion). */
  pulledDown?: boolean;
};

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Per-step shell for the intervention overlay. Enforces the single-action-
 * per-screen rule, generous whitespace, and the close affordance contract.
 * All step components mount inside this shell.
 */
export function StruggleShell({
  eyebrow,
  showClose = true,
  onClose,
  children,
  actions,
  pulledDown = false,
}: Props) {
  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Top chrome */}
      <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.28em]",
            eyebrow ? "text-muted/80" : "opacity-0",
          )}
        >
          {eyebrow ?? "•"}
        </span>
        {showClose ? (
          <button
            type="button"
            aria-label="Sluit"
            onClick={onClose}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              "text-muted hover:text-foreground",
              "transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            <CloseGlyph />
          </button>
        ) : (
          <span aria-hidden className="h-9 w-9" />
        )}
      </div>

      {/* Body */}
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center px-6",
          pulledDown ? "pt-4" : "pt-2",
          "pb-[max(env(safe-area-inset-bottom),1.5rem)]",
        )}
      >
        <div className="lockd-fade-rise flex w-full max-w-[360px] flex-col items-center gap-6 text-center">
          {children}
        </div>
      </div>

      {/* Pinned action */}
      {actions && (
        <div className="px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
          <div className="mx-auto w-full max-w-[360px]">{actions}</div>
        </div>
      )}
    </div>
  );
}

export default StruggleShell;
