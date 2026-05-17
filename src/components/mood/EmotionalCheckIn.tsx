"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MoodChip } from "./MoodChip";
import { MOOD_OPTIONS, type MoodId } from "@/lib/mood/options";
import { logMood } from "@/lib/mood/client";

type Props = {
  logDate: string;
  initialMood: MoodId | null;
  onChange?: (mood: MoodId) => void;
};

/**
 * Emotional check-in card. Single-tap save. Optimistic: the active chip flips
 * immediately, the RPC runs in the background. If it fails we revert and
 * surface the error inline.
 */
export function EmotionalCheckIn({ logDate, initialMood, onChange }: Props) {
  const [selected, setSelected] = useState<MoodId | null>(initialMood);
  const [saving, setSaving] = useState<MoodId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePick(moodId: MoodId) {
    if (saving) return;
    const prev = selected;
    setSelected(moodId);
    setSaving(moodId);
    setError(null);
    try {
      await logMood(moodId, logDate);
      onChange?.(moodId);
    } catch (err) {
      console.error("[mood] log_mood failed:", err);
      setSelected(prev);
      setError("Kon je check-in niet opslaan.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <GlassCard padding="md">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Hoe voel je je nu?
          </h2>
          {selected && (
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
