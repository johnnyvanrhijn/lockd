"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CommitmentStatus = "pending" | "success" | "fail";
export type CommitmentVariant = "full" | "compact";
export type CommitmentHabitType = "bad" | "good";

type Props = {
  /** Internal habit name, e.g. "Roken". Shown as secondary on full variant. */
  name: string;
  /** First-person commitment statement, e.g. "Niet gerookt vandaag". */
  dailyStatement: string;
  /** Bad vs good habit. Drives copy and tone. */
  habitType?: CommitmentHabitType;
  /** Current individual streak (days). 0 when no streak yet. */
  streakDays: number;
  /** What the user has chosen for today (active log date). */
  status: CommitmentStatus;
  /** Tap on the success action. Same action twice = parent should clear. */
  onSuccess: () => void;
  /** Tap on the fail action. Same dual-tap rule. */
  onFail: () => void;
  /** Disable both buttons while an optimistic write is pending. */
  disabled?: boolean;
  /** Layout. 'full' = card with statement headline. 'compact' = single row. */
  variant?: CommitmentVariant;
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

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className ?? "h-3.5 w-3.5"}>
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className ?? "h-3.5 w-3.5"}>
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

function StreakChip({
  days,
  size = "md",
}: {
  days: number;
  size?: "sm" | "md";
}) {
  const locked = days >= 30;
  return (
    <span
      aria-label={
        locked ? `${days} dagen, locked in` : `${days} dagen streak`
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold tabular-nums",
        size === "md"
          ? "px-2 py-0.5 text-[11px]"
          : "px-1.5 py-0.5 text-[10px]",
        locked
          ? "bg-success/15 text-success"
          : days > 0
            ? "bg-purple/15 text-purple-bright"
            : "bg-surface-elevated text-muted",
      )}
    >
      <FlameGlyph />
      {days}
      <span className="text-[10px] font-medium opacity-80">d</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Copy resolution                                                           */
/* -------------------------------------------------------------------------- */

function resolveVerbs(habitType: CommitmentHabitType): {
  successLabel: string;
  failLabel: string;
  successPill: string;
  failPill: string;
} {
  if (habitType === "good") {
    return {
      successLabel: "Gedaan",
      failLabel: "Gemist",
      successPill: "Sterk",
      failPill: "Gemist",
    };
  }
  // bad habit — default
  return {
    successLabel: "Sterk",
    failLabel: "Gevallen",
    successPill: "Sterk",
    failPill: "Gevallen",
  };
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Per-habit commitment card on the dashboard.
 *
 * Two layouts:
 *  - `full`    headline = dailyStatement, secondary = habit name + streak,
 *              two clear action buttons.
 *  - `compact` single 44px row: streak · statement · ✓/✗ icon buttons.
 *
 * Bad vs good habit changes the action verbs and tone:
 *  - bad  ✓ Sterk / ✗ Gevallen   (success = absence of behavior)
 *  - good ✓ Gedaan / ✗ Gemist    (success = presence of behavior)
 */
export function HabitCommitmentCard({
  name,
  dailyStatement,
  habitType = "bad",
  streakDays,
  status,
  onSuccess,
  onFail,
  disabled,
  variant = "full",
}: Props) {
  const [animKey, setAnimKey] = useState(0);
  function handle(action: "success" | "fail", fn: () => void) {
    setAnimKey((k) => k + 1);
    fn();
  }

  const verbs = resolveVerbs(habitType);

  /* ────────────── Compact layout ────────────── */

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          "rounded-[var(--radius-sm)] border bg-surface/60 backdrop-blur-md",
          "transition-colors duration-200",
          status === "success"
            ? "border-success/30"
            : status === "fail"
              ? "border-danger/30"
              : "border-[var(--color-border)]",
        )}
      >
        {animKey > 0 && status !== "pending" && (
          <span
            key={`pulse-${animKey}-${status}`}
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-[var(--radius-sm)]",
              status === "success"
                ? "lockd-pulse-once-success"
                : "lockd-pulse-once-danger",
            )}
          />
        )}
        <div className="flex items-center gap-2 px-3 py-2">
          <StreakChip days={streakDays} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground/90">
              {dailyStatement}
            </p>
            <p className="truncate text-[10px] uppercase tracking-[0.15em] text-muted">
              {name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              key={`s-${animKey}-${status}`}
              type="button"
              disabled={disabled}
              onClick={() => handle("success", onSuccess)}
              aria-pressed={status === "success"}
              aria-label={`${verbs.successLabel} — ${name}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border transition-all",
                "active:scale-[0.92]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/60",
                "disabled:cursor-not-allowed disabled:opacity-50",
                status === "success"
                  ? "border-success/50 bg-success/20 text-success shadow-[0_0_18px_-8px_rgba(74,222,128,0.5)]"
                  : "border-[var(--color-border)] bg-surface-elevated/70 text-foreground/70 hover:border-success/40 hover:text-success",
              )}
            >
              <CheckGlyph className="h-4 w-4" />
            </button>
            <button
              key={`f-${animKey}-${status}`}
              type="button"
              disabled={disabled}
              onClick={() => handle("fail", onFail)}
              aria-pressed={status === "fail"}
              aria-label={`${verbs.failLabel} — ${name}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border transition-all",
                "active:scale-[0.92]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/60",
                "disabled:cursor-not-allowed disabled:opacity-50",
                status === "fail"
                  ? "border-danger/50 bg-danger/15 text-danger"
                  : "border-[var(--color-border)] bg-surface-elevated/70 text-muted hover:border-danger/40 hover:text-danger",
              )}
            >
              <CrossGlyph className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────── Full layout ────────────── */

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
      {animKey > 0 && status !== "pending" && (
        <span
          key={`pulse-${animKey}-${status}`}
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[var(--radius-md)]",
            status === "success"
              ? "lockd-pulse-once-success"
              : "lockd-pulse-once-danger",
          )}
        />
      )}

      {/* Top row: streak + meta + pill */}
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <StreakChip days={streakDays} />
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
          <span className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            {name}
          </span>
        </div>
        {status === "success" && (
          <StatusPill tone="success">{verbs.successPill}</StatusPill>
        )}
        {status === "fail" && (
          <StatusPill tone="danger">{verbs.failPill}</StatusPill>
        )}
        {status === "pending" && <StatusPill tone="muted">Open</StatusPill>}
      </div>

      {/* Headline: the daily commitment statement */}
      <div className="px-4 pb-1 pt-1.5">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground">
          {dailyStatement}
        </h3>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-3 pt-2">
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
          <CheckGlyph />
          {verbs.successLabel}
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
              ? ["border-danger/45 bg-danger/12 text-danger"]
              : [
                  "border-[var(--color-border)] bg-surface-elevated/70 text-muted",
                  "hover:border-danger/30 hover:text-foreground/80",
                ],
          )}
        >
          <CrossGlyph />
          {verbs.failLabel}
        </button>
      </div>
    </div>
  );
}

export default HabitCommitmentCard;
