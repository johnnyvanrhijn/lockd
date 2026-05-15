"use client";

import { StruggleShell } from "../StruggleShell";
import { cn } from "@/lib/utils/cn";
import { getBadHabitName } from "@/lib/badHabits/catalog";
import type { MirrorData, StruggleContext } from "@/lib/struggle/types";

type Props = {
  habitId: string;
  context: StruggleContext;
  mirror: MirrorData;
  onContinue: () => void;
  onClose: () => void;
};

/**
 * Screen 5 — Reality Mirror. Shows real data when it exists (previous urge,
 * current streak, best streak, pattern). For first-time users (< 5 events)
 * we fall back to 2 onboarding facts + an identity statement, never inventing
 * numbers.
 */
export function MirrorStep({
  habitId,
  context,
  mirror,
  onContinue,
  onClose,
}: Props) {
  const habitName = getBadHabitName(habitId);

  const facts: Array<{ label: string; value: string }> = [];

  if (mirror.isFirstFew) {
    // Onboarding-grounded framing for new users.
    if (context.onboardingFacts.desiredOutcomes.length > 0) {
      facts.push({
        label: "Jouw doel",
        value:
          context.onboardingFacts.desiredOutcomes.slice(0, 2).join(" · "),
      });
    }
    facts.push({
      label: "Vandaag bescherm je",
      value: habitName,
    });
  } else {
    if (mirror.previousUrgeAt) {
      facts.push({ label: "Vorige drang", value: mirror.previousUrgeAt });
    }
    if (mirror.currentStreak > 0) {
      facts.push({
        label: "Huidige streak",
        value: `${mirror.currentStreak} ${mirror.currentStreak === 1 ? "dag" : "dagen"}`,
      });
    } else if (mirror.bestStreak > 0) {
      facts.push({
        label: "Sterkste streak",
        value: `${mirror.bestStreak} ${mirror.bestStreak === 1 ? "dag" : "dagen"}`,
      });
    }
  }

  const headline = mirror.isFirstFew
    ? "Dit is jouw eerste test."
    : mirror.currentStreak > 0
      ? "Je hebt dit eerder overwonnen."
      : "Deze momenten voelen tijdelijk.";

  return (
    <StruggleShell
      eyebrow="Stap 4"
      onClose={onClose}
      actions={
        <button
          type="button"
          onClick={onContinue}
          className={cn(
            "flex w-full items-center justify-center rounded-[var(--radius-sm)]",
            "h-14 bg-purple text-sm font-semibold text-foreground",
            "transition-all duration-200 active:scale-[0.98]",
            "shadow-[0_0_28px_-8px_var(--color-purple-glow)]",
            "hover:bg-purple-bright",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
          )}
        >
          Ga door
        </button>
      }
    >
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
        {headline}
      </h1>

      {facts.length > 0 && (
        <div
          className={cn(
            "mt-2 flex w-full flex-col divide-y divide-[var(--color-border)]",
            "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-surface/60",
          )}
        >
          {facts.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                {f.label}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {f.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {mirror.patternSentence && (
        <p className="px-2 text-[12px] leading-relaxed text-muted">
          {mirror.patternSentence}
        </p>
      )}

      <p className="px-2 text-[13px] leading-relaxed text-foreground/85">
        {mirror.isFirstFew
          ? "Je hoeft niet te winnen. Je hoeft alleen niet te verliezen."
          : "Deze drang piekt en zakt. Hij wint alleen als je beweegt."}
      </p>
    </StruggleShell>
  );
}

export default MirrorStep;
