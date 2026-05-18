"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "@/components/ui/GlassCard";

type Props = {
  goalId: string;
  currentDay: number;
  durationDays: number;
  title: string;
};

const MILESTONES = [7, 14, 30] as const;

function storageKey(goalId: string, day: number): string {
  return `lockd_mission_milestone_${goalId}_${day}`;
}

function milestoneFor(currentDay: number): number | null {
  for (const m of MILESTONES) {
    if (currentDay === m) return m;
  }
  return null;
}

function copyFor(day: number, title: string): { eyebrow: string; line: string } {
  if (day === 7) {
    return {
      eyebrow: "Mijlpaal · 7 dagen",
      line: `Eén week ${title.toLowerCase()}. Dit is wie je aan het worden bent.`,
    };
  }
  if (day === 14) {
    return {
      eyebrow: "Mijlpaal · 14 dagen",
      line: "Halverwege voor velen. Voor jou: bewijs dat het werkt.",
    };
  }
  return {
    eyebrow: "Mijlpaal · 30 dagen",
    line: "30 dagen. Een gewoonte heeft tijd gehad om jouw nieuwe normaal te worden.",
  };
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path
        d="M12 3l2.5 6.2 6.5.5-5 4.4 1.6 6.4L12 17.3 6.4 20.5 8 14.1 3 9.7l6.5-.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * One-shot celebration card. Renders only on milestone days (7/14/30) and only
 * if not yet dismissed for this goal+day. Dismissal persists in localStorage
 * so it never re-appears for the same milestone.
 */
export function MilestoneCelebration({
  goalId,
  currentDay,
  durationDays,
  title,
}: Props) {
  const milestone = milestoneFor(currentDay);
  // Lazy init reads localStorage synchronously during first render. Browser
  // env is guaranteed in this "use client" tree; the try/catch covers private
  // mode etc. Storage-unavailable falls through to "not dismissed yet".
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (!milestone) return true;
    if (milestone > durationDays) return true;
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(storageKey(goalId, milestone)) === "1";
    } catch {
      return false;
    }
  });

  function dismiss() {
    if (!milestone) return;
    try {
      window.localStorage.setItem(storageKey(goalId, milestone), "1");
    } catch {
      // Ignore.
    }
    setDismissed(true);
  }

  if (!milestone || dismissed) return null;

  const copy = copyFor(milestone, title);

  return (
    <GlassCard
      tone="success"
      glow="success"
      padding="md"
      className="relative overflow-hidden"
    >
      <button
        type="button"
        aria-label="Sluit mijlpaal"
        onClick={dismiss}
        className={cn(
          "absolute right-2 top-2 flex h-7 w-7 items-center justify-center",
          "rounded-full text-success/70 hover:text-success",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/60",
        )}
      >
        <CloseGlyph />
      </button>
      <div className="flex flex-col gap-2 pr-6">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-success">
          <StarGlyph />
          {copy.eyebrow}
        </span>
        <p className="text-sm leading-relaxed text-foreground">{copy.line}</p>
      </div>
    </GlassCard>
  );
}

export default MilestoneCelebration;
