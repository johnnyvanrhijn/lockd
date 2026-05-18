"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CommitmentStatus = "pending" | "success" | "fail";

type Props = {
  name: string;
  /** Current individual streak (days). 0 when no streak yet. */
  streakDays: number;
  /** What the user has chosen for today (active log date). */
  status: CommitmentStatus;
  /** Tap on the success action. If the same action is tapped twice, parent should undo. */
  onSuccess: () => void;
  /** Tap on the fail action. Same dual-tap rule. */
  onFail: () => void;
  /** Disable both buttons while an optimistic write is pending. */
  disabled?: boolean;
};

function FlameGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M12 3.5c.4 2.4 1.8 3.5 3 5 1.4 1.7 2.5 3.5 2.5 5.5a5.5 5.5 0 0 1-11 0c0-1.6.7-3 1.5-4 .4.9 1 1.4 1.8 1.6-.5-1.6-.2-3.4 1-5.2.4-.7.8-1.6 1.2-2.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M8 1.5l5.5 2v4.2c0 3-2.3 5.6-5.5 6.8C4.8 13.3 2.5 10.7 2.5 7.7V3.5l5.5-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M5.6 8l1.6 1.6L10.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BreakGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M11 2L7 7h3l-2 7 4-7H9l2-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "danger" | "muted";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]",
        tone === "success" && "bg-success/15 text-success",
        tone === "danger" && "bg-danger/15 text-danger",
        tone === "muted" && "bg-surface-elevated text-muted",
      )}
    >
      {children}
    </span>
  );
}

/**
 * The dashboard's per-habit card. Frames each habit as "have I held my
 * standard today?" rather than "did I do the bad thing?". Two clear actions,
 * never a checkbox.
 */
export function HabitCommitmentCard({
  name,
  streakDays,
  status,
  onSuccess,
  onFail,
  disabled,
}: Props) {
  const [animKey, setAnimKey] = useState(0);
  function handle(action: "success" | "fail", fn: () => void) {
    setAnimKey((k) => k + 1);
    fn();
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "rounded-[var(--radius-md)] border bg-surface/70 backdrop-blur-xl",
        "transition-colors duration-200",
        status === "success"
          ? "border-success/30"
          : status === "fail"
            ? "border-danger/30"
            : "border-[var(--color-border)]",
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-label={
              streakDays >= 30
                ? `${streakDays} dagen, locked in`
                : `${streakDays} dagen streak`
            }
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              streakDays >= 30
                ? "bg-success/15 text-success"
                : streakDays > 0
                  ? "bg-purple/15 text-purple-bright"
                  : "bg-surface-elevated text-muted",
            )}
          >
            <FlameGlyph />
            {streakDays}
            <span className="text-[10px] font-medium opacity-80">d</span>
          </span>
          {streakDays >= 30 && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                "text-[10px] font-semibold uppercase tracking-[0.14em]",
                "bg-success/12 text-success",
              )}
            >
              Locked in
            </span>
          )}
          <h3 className="truncate text-sm font-semibold text-foreground">
            {name}
          </h3>
        </div>
        {status === "success" && <StatusPill tone="success">Sterk</StatusPill>}
        {status === "fail" && <StatusPill tone="danger">Reset</StatusPill>}
        {status === "pending" && <StatusPill tone="muted">Open</StatusPill>}
      </div>

      <div className="flex gap-2 p-3 pt-3">
        <button
          key={`s-${animKey}-${status}`}
          type="button"
          disabled={disabled}
          onClick={() => handle("success", onSuccess)}
          aria-pressed={status === "success"}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-3",
            "min-h-[44px] border text-xs font-semibold transition-all duration-200",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            status === "success"
              ? [
                  "border-success/45 bg-success/15 text-success",
                  "shadow-[0_0_24px_-12px_rgba(74,222,128,0.55)]",
                ]
              : [
                  "border-[var(--color-border)] bg-surface-elevated/70 text-foreground/85",
                  "hover:border-success/30 hover:text-foreground",
                ],
          )}
        >
          <ShieldGlyph />
          Stand gehouden
        </button>
        <button
          key={`f-${animKey}-${status}`}
          type="button"
          disabled={disabled}
          onClick={() => handle("fail", onFail)}
          aria-pressed={status === "fail"}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-3",
            "min-h-[44px] border text-xs font-semibold transition-all duration-200",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            status === "fail"
              ? [
                  "border-danger/45 bg-danger/12 text-danger",
                ]
              : [
                  "border-[var(--color-border)] bg-surface-elevated/70 text-muted",
                  "hover:border-danger/30 hover:text-foreground/80",
                ],
          )}
        >
          <BreakGlyph />
          Terugval
        </button>
      </div>
    </div>
  );
}

export default HabitCommitmentCard;
