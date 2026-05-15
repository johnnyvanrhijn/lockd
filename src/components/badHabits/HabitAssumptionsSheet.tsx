"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { QuestionField } from "@/components/badHabits/QuestionField";
import {
  type AnswerValue,
  type AnswersByQuestion,
  buildDefaultAnswers,
  getQuestionsForHabit,
} from "@/lib/badHabits/questions";
import { getBadHabitName } from "@/lib/badHabits/catalog";

type Props = {
  habitId: string;
  initialAnswers: AnswersByQuestion;
  saving: boolean;
  onClose: () => void;
  onSave: (answers: AnswersByQuestion) => void;
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

/**
 * Bottom-sheet for editing the assumptions/answers of one habit. Mirrors the
 * onboarding screen's content but lives in the profile flow so users can
 * fine-tune impact baselines later.
 */
export function HabitAssumptionsSheet({
  habitId,
  initialAnswers,
  saving,
  onClose,
  onSave,
}: Props) {
  const questions = getQuestionsForHabit(habitId);
  const habitName = getBadHabitName(habitId);

  // Parent renders this sheet with `key={habitId}`, so this initializer is
  // the only place the state needs to read from props.
  const [answers, setAnswers] = useState<AnswersByQuestion>(() => ({
    ...buildDefaultAnswers(habitId),
    ...initialAnswers,
  }));

  function setAnswer(qid: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Bewerk aannames voor ${habitName}`}
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
              Aannames
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              {habitName}
            </h2>
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

        <div className="mt-4 flex flex-1 flex-col gap-5 overflow-y-auto pb-4 pr-1">
          {questions.length === 0 ? (
            <p className="text-sm text-muted">
              Geen aanpasbare aannames voor deze gewoonte.
            </p>
          ) : (
            questions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={answers[q.id] ?? q.defaultAnswer}
                onChange={(v) => setAnswer(q.id, v)}
              />
            ))
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <GhostButton onClick={onClose} disabled={saving}>
            Annuleer
          </GhostButton>
          <PrimaryButton
            onClick={() => onSave(answers)}
            loading={saving}
            disabled={saving}
            fullWidth
          >
            Opslaan
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default HabitAssumptionsSheet;
