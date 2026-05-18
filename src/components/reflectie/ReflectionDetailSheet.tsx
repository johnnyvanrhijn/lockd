"use client";

import { cn } from "@/lib/utils/cn";
import { GhostButton } from "@/components/ui/GhostButton";
import { MoodIcon } from "@/components/mood/MoodIcons";
import { MOOD_OPTIONS } from "@/lib/mood/options";
import { UrgeDropPair } from "./UrgeDropPair";
import type { ReflectionEntry } from "@/lib/reflectie/helpers";

const KIND_LABEL: Record<ReflectionEntry["kind"], string> = {
  open: "Vrije reflectie",
  missie: "Missie afgerond",
  struggle: "Struggle moment",
  mood: "Stemming",
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

function formatFullDate(iso: string): string {
  const dt = new Date(iso);
  return dt.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type Props = {
  entry: ReflectionEntry;
  onClose: () => void;
};

export function ReflectionDetailSheet({ entry, onClose }: Props) {
  const moodOpt =
    entry.kind === "mood" && entry.moodId
      ? MOOD_OPTIONS.find((m) => m.id === entry.moodId)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Reflectie details"
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
              {KIND_LABEL[entry.kind]}
            </span>
            <h2 className="text-lg font-semibold leading-snug text-foreground">
              {formatFullDate(entry.createdAt)}
            </h2>
            {entry.goalTitle && entry.kind !== "mood" && (
              <p className="text-xs text-muted">{entry.goalTitle}</p>
            )}
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

        <div className="mt-4 flex flex-1 flex-col gap-4 overflow-y-auto pb-3 pr-1">
          {/* Mood icon for stemming entries */}
          {moodOpt && (
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-surface/60 px-3 py-2.5">
              <MoodIcon
                id={moodOpt.id}
                className="h-7 w-7 shrink-0 text-purple-bright"
              />
              <span className="text-sm font-semibold text-foreground">
                {moodOpt.label}
              </span>
            </div>
          )}

          {/* Urge drop for struggle entries */}
          {entry.kind === "struggle" &&
            entry.urgeBefore !== null &&
            entry.urgeBefore !== undefined &&
            entry.urgeAfter !== null &&
            entry.urgeAfter !== undefined && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
                  Drang
                </span>
                <UrgeDropPair
                  before={entry.urgeBefore}
                  after={entry.urgeAfter}
                />
              </div>
            )}

          {/* Full body */}
          {entry.body && entry.body.trim().length > 0 && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {entry.body}
            </p>
          )}

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {entry.tags.map((tag, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5",
                    "text-[11px] font-medium text-muted",
                    "bg-surface-glass border border-[var(--color-border)]",
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3">
          <GhostButton onClick={onClose} fullWidth>
            Sluit
          </GhostButton>
        </div>
      </div>
    </div>
  );
}

export default ReflectionDetailSheet;
