"use client";

import { useState } from "react";
import { StruggleShell } from "../StruggleShell";
import { cn } from "@/lib/utils/cn";

type Props = {
  saving: boolean;
  onSave: (body: string) => void;
  onSkip: () => void;
};

/**
 * Inline reflection composer. Lives inside the same overlay (no route change)
 * so the calm aesthetic carries through. Empty submissions are blocked by the
 * RPC anyway; we also disable the button locally.
 */
export function ReflectionStep({ saving, onSave, onSkip }: Props) {
  const [body, setBody] = useState("");
  const trimmed = body.trim();

  return (
    <StruggleShell
      showClose={false}
      pulledDown
      actions={
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => onSave(trimmed)}
            disabled={!trimmed || saving}
            className={cn(
              "flex w-full items-center justify-center rounded-[var(--radius-sm)]",
              "h-14 bg-purple text-sm font-semibold text-foreground",
              "transition-all duration-200 active:scale-[0.98]",
              "shadow-[0_0_28px_-8px_var(--color-purple-glow)]",
              "hover:bg-purple-bright",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            {saving ? "Opslaan…" : "Opslaan"}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className={cn(
              "flex w-full items-center justify-center",
              "h-12 text-sm font-medium text-muted",
              "transition-colors hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/40 rounded-[var(--radius-sm)]",
            )}
          >
            Sla over
          </button>
        </div>
      }
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-bright">
        Reflectie
      </span>
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
        Wat ging er door je{" "}
        <span className="text-purple-bright">heen</span>?
      </h1>
      <p className="text-xs text-muted">Niet voor anderen. Voor jezelf.</p>

      <textarea
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        maxLength={600}
        placeholder="Eén zin is genoeg."
        className={cn(
          "mt-2 w-full resize-none rounded-[var(--radius-sm)]",
          "border border-[var(--color-border)] bg-surface/60 px-4 py-3",
          "text-sm leading-relaxed text-foreground placeholder:text-muted",
          "outline-none",
          "focus:border-purple/60 focus:shadow-[0_0_24px_-12px_var(--color-purple-glow)]",
        )}
      />
      <span className="self-end text-[10px] text-muted tabular-nums">
        {body.length}/600
      </span>
    </StruggleShell>
  );
}

export default ReflectionStep;
