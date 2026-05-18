"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MoodChip } from "./MoodChip";
import { MOOD_OPTIONS, getMoodOption, type MoodId } from "@/lib/mood/options";
import { logMood, updateMoodNote } from "@/lib/mood/client";
import { cn } from "@/lib/utils/cn";

type InitialMood = {
  id: string;
  mood: MoodId;
  note: string | null;
} | null;

type Props = {
  logDate: string;
  initialMood: InitialMood;
};

const NOTE_PROMPT: Record<MoodId, string> = {
  prima: "Wat houdt je nu in balans?",
  gestrest: "Wat zit erachter?",
  moe: "Wat trekt nu energie?",
  geirriteerd: "Waar zit de spanning?",
  somber: "Wat speelt er nu?",
};

/**
 * Mood check-in card with inline WHY-expansion.
 *
 * UX contract:
 *  - Tap a mood chip → instant save (mood_logs row, note=null).
 *  - Inline expansion below shows an optional textarea + Opslaan / Sla over.
 *  - Opslaan → update_mood_note on the row just created. Stays in mood_logs;
 *    /reflectie picks up notes as separate reflection entries.
 *  - Tap a different mood → save a new row, swap expansion.
 *  - Tap the same mood again → reopen the expansion for that row.
 */
export function EmotionalCheckIn({ logDate, initialMood }: Props) {
  const [selected, setSelected] = useState<MoodId | null>(initialMood?.mood ?? null);
  const [currentRowId, setCurrentRowId] = useState<string | null>(
    initialMood?.id ?? null,
  );
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState<string>(initialMood?.note ?? "");
  const [saving, setSaving] = useState<MoodId | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePick(moodId: MoodId) {
    if (saving) return;
    setError(null);

    // Same mood tap → just reopen the expansion.
    if (moodId === selected && currentRowId) {
      setNoteOpen((v) => !v);
      return;
    }

    // Optimistic UI.
    const prev = selected;
    setSelected(moodId);
    setSaving(moodId);
    setNoteOpen(true);
    setNote("");

    try {
      const id = await logMood(moodId, logDate, null);
      setCurrentRowId(id);
    } catch (err) {
      console.error("[mood] log_mood failed:", err);
      setSelected(prev);
      setNoteOpen(false);
      setError("Kon je check-in niet opslaan.");
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveNote() {
    if (!currentRowId || savingNote) return;
    const trimmed = note.trim();
    setSavingNote(true);
    setError(null);
    try {
      await updateMoodNote(currentRowId, trimmed);
      setNoteOpen(false);
    } catch (err) {
      console.error("[mood] update_mood_note failed:", err);
      setError("Kon notitie niet opslaan.");
    } finally {
      setSavingNote(false);
    }
  }

  function handleSkipNote() {
    setNoteOpen(false);
  }

  const promptText = selected ? NOTE_PROMPT[selected] : "Wat zit erachter?";
  const selectedLabel = selected ? getMoodOption(selected)?.label ?? "" : "";

  return (
    <GlassCard padding="md" className="overflow-hidden">
      {selected && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-32",
            "bg-[radial-gradient(ellipse_60%_70%_at_50%_100%,rgba(167,139,250,0.18),transparent_70%)]",
            "transition-opacity duration-500",
          )}
        />
      )}
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Hoe voel je je nu?
          </h2>
          {selected && !noteOpen && (
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-bright">
              Gelogd
            </span>
          )}
        </div>

        <div className="flex items-stretch gap-1.5">
          {MOOD_OPTIONS.map((opt) => (
            <MoodChip
              key={opt.id}
              option={opt}
              selected={selected === opt.id}
              disabled={saving !== null && saving !== opt.id}
              onSelect={() => handlePick(opt.id)}
            />
          ))}
        </div>

        {noteOpen && selected && (
          <div
            className={cn(
              "lockd-fade-rise flex flex-col gap-2.5",
              "border-t border-[var(--color-border)] pt-3",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-bright">
                {selectedLabel} · {promptText}
              </span>
              <span className="text-[10px] tabular-nums text-muted">
                {note.length}/200
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              rows={2}
              placeholder="Eén of twee zinnen is genoeg."
              autoFocus
              className={cn(
                "w-full resize-none rounded-[var(--radius-sm)]",
                "bg-surface-elevated/60 px-3 py-2",
                "text-[13px] leading-relaxed text-foreground placeholder:text-muted",
                "outline-none focus:bg-surface-elevated/90 focus:shadow-[inset_0_0_0_1px_var(--color-purple)]",
              )}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={savingNote || note.trim().length === 0}
                className={cn(
                  "flex-1 rounded-full px-3 min-h-[44px] text-[11px] font-semibold",
                  "border border-purple/40 bg-purple/15 text-purple-bright",
                  "transition-colors hover:bg-purple/25",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                )}
              >
                {savingNote ? "Opslaan…" : "Opslaan"}
              </button>
              <button
                type="button"
                onClick={handleSkipNote}
                disabled={savingNote}
                className={cn(
                  "rounded-full px-4 min-h-[44px] text-[11px] font-medium",
                  "text-muted hover:text-foreground transition-colors",
                )}
              >
                Sla over
              </button>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-[11px] text-danger">
            {error}
          </p>
        )}
      </div>
    </GlassCard>
  );
}



export default EmotionalCheckIn;
