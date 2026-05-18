"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";

/**
 * Rotating prompts — picked deterministically per local day so users see one
 * stable prompt per day. Short, identity-framed, not therapeutic.
 */
const PROMPTS: ReadonlyArray<string> = [
  "Waar was je vandaag trots op?",
  "Wat triggerde je gisteren?",
  "Wat probeer je morgen anders te doen?",
  "Welke standaard hield je vandaag?",
  "Wat kostte je het meeste moeite?",
  "Waarom ben je hieraan begonnen?",
  "Wat heeft je vandaag verrast?",
];

function dailyPrompt(): string {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() -
      new Date(now.getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return PROMPTS[dayOfYear % PROMPTS.length];
}

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

type Props = {
  saving: boolean;
  onClose: () => void;
  onSave: (body: string) => void;
};

export function ReflectionWriter({ saving, onClose, onSave }: Props) {
  const prompt = useMemo(() => dailyPrompt(), []);
  const [body, setBody] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Autofocus once mounted (after sheet animation settles).
    const t = setTimeout(() => ref.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const canSubmit = !saving && body.trim().length >= 2;

  function handleSubmit() {
    if (!canSubmit) return;
    onSave(body.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Schrijf een reflectie"
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
              Vandaag
            </span>
            <h2 className="text-lg font-semibold leading-snug text-foreground">
              {prompt}
            </h2>
            <p className="text-xs text-muted">
              Niet voor anderen. Voor jezelf.
            </p>
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

        <div className="mt-4 flex flex-1 flex-col">
          <textarea
            ref={ref}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder="Begin met typen…"
            className={cn(
              "w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)]",
              "bg-surface-elevated px-3 py-2.5",
              "text-sm leading-relaxed text-foreground placeholder:text-muted/60",
              "outline-none transition-colors",
              "focus:border-purple/60 focus:ring-2 focus:ring-purple-bright/40",
            )}
            aria-label="Reflectie"
          />
          <div className="mt-1 flex items-center justify-end">
            <span className="text-[11px] tabular-nums text-muted/70">
              {body.length}/2000
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3">
          <GhostButton onClick={onClose} disabled={saving}>
            Annuleer
          </GhostButton>
          <PrimaryButton
            onClick={handleSubmit}
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

export default ReflectionWriter;
