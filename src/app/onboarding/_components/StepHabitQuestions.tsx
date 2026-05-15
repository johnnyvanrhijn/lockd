"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/ui/OnboardingShell";
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
import { cn } from "@/lib/utils/cn";

type Props = {
  total: number;
  current: number;
  habitId: string;
  /** Index of this habit within the user's selection (1-based) for the header. */
  habitIndex: number;
  /** Total habits in the user's selection. */
  habitCount: number;
  /** Existing answers loaded from the DB (may be partial). */
  initialAnswers: AnswersByQuestion;
  saving: boolean;
  onBack: () => void;
  /** Called with all answers (defaults filled in for blanks). */
  onNext: (answers: AnswersByQuestion) => void;
  /** Called when user taps "Sla over" — saves defaults and advances. */
  onSkip: (defaults: AnswersByQuestion) => void;
};

export function StepHabitQuestions({
  total,
  current,
  habitId,
  habitIndex,
  habitCount,
  initialAnswers,
  saving,
  onBack,
  onNext,
  onSkip,
}: Props) {
  const questions = getQuestionsForHabit(habitId);
  const habitName = getBadHabitName(habitId);

  // Merge defaults with any saved answers so the form starts populated.
  // Parent re-mounts this component (via `key={habitId}`) when the user moves
  // to a different habit's screen, so this initializer is the only place the
  // state needs to be set from props.
  const [answers, setAnswers] = useState<AnswersByQuestion>(() => ({
    ...buildDefaultAnswers(habitId),
    ...initialAnswers,
  }));

  function setAnswer(qid: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  return (
    <OnboardingShell
      total={total}
      current={current}
      eyebrow={`Habit ${habitIndex}/${habitCount}`}
      title={
        <>
          Stem <span className="text-purple-bright">{habitName.toLowerCase()}</span>{" "}
          op je leven af
        </>
      }
      subtitle="Een paar korte vragen. Dit bepaalt jouw impact-cijfers en risico-momenten."
      actions={
        <div className="flex items-center gap-2 px-4 pb-2">
          <GhostButton onClick={onBack} disabled={saving}>
            Terug
          </GhostButton>
          <PrimaryButton
            onClick={() => onNext(answers)}
            loading={saving}
            disabled={saving}
            fullWidth
          >
            Volgende
          </PrimaryButton>
        </div>
      }
      footer={
        <button
          type="button"
          onClick={() => onSkip(buildDefaultAnswers(habitId))}
          disabled={saving}
          className={cn(
            "text-[11px] font-medium underline-offset-4 hover:underline",
            "text-muted hover:text-foreground",
            "transition-colors disabled:opacity-50",
          )}
        >
          Sla over · gebruik gemiddelden
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        {questions.length === 0 ? (
          <p className="text-sm text-muted">
            Geen extra vragen nodig voor deze gewoonte.
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
    </OnboardingShell>
  );
}
