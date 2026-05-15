"use client";

import { type ChangeEvent } from "react";
import { cn } from "@/lib/utils/cn";
import type { AnswerValue, Question } from "@/lib/badHabits/questions";

type Props = {
  question: Question;
  value: AnswerValue;
  onChange: (next: AnswerValue) => void;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" aria-hidden>
      <path
        d="M2 5.2l1.8 1.8L8 2.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Renders one question of any type. Designed to stack inside a single
 * onboarding step so the user fills out all the questions for one habit
 * before advancing.
 */
export function QuestionField({ question, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-foreground">
        {question.question}
      </label>

      {question.type === "single" && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => {
            const isSelected = value === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(opt.key)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-4 py-3",
                  "text-left text-sm font-medium",
                  "transition-all duration-200",
                  "active:scale-[0.99]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                  isSelected
                    ? [
                        "border-purple/60 bg-purple/10 text-foreground",
                        "shadow-[0_0_24px_-14px_var(--color-purple-glow)]",
                      ]
                    : [
                        "border-[var(--color-border)] bg-surface/60 text-foreground/85",
                        "hover:border-[var(--color-border-strong)]",
                      ],
                )}
              >
                <span>{opt.label}</span>
                <span
                  aria-hidden
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    isSelected
                      ? "border-purple-bright bg-purple-bright text-background"
                      : "border-[var(--color-border-strong)]",
                  )}
                >
                  {isSelected && <CheckIcon />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === "multi" && (
        <div className="grid grid-cols-2 gap-2">
          {question.options.map((opt) => {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            const isSelected = arr.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => {
                  const next = isSelected
                    ? arr.filter((k) => k !== opt.key)
                    : [...arr, opt.key];
                  onChange(next);
                }}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border px-3 py-2.5",
                  "text-left text-xs font-semibold",
                  "transition-all duration-200",
                  "active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                  isSelected
                    ? [
                        "border-purple/60 bg-purple/10 text-foreground",
                        "shadow-[0_0_22px_-14px_var(--color-purple-glow)]",
                      ]
                    : [
                        "border-[var(--color-border)] bg-surface/60 text-foreground/85",
                        "hover:border-[var(--color-border-strong)]",
                      ],
                )}
              >
                <span className="truncate">{opt.label}</span>
                <span
                  aria-hidden
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border",
                    isSelected
                      ? "border-purple-bright bg-purple-bright text-background"
                      : "border-[var(--color-border-strong)]",
                  )}
                >
                  {isSelected && <CheckIcon />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === "slider" && (
        <SliderInput
          min={question.slider.min}
          max={question.slider.max}
          step={question.slider.step}
          suffix={question.slider.suffix}
          value={
            typeof value === "number" ? value : (question.defaultAnswer as number)
          }
          onChange={(v) => onChange(v)}
        />
      )}
    </div>
  );
}

function SliderInput({
  min,
  max,
  step,
  suffix,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface/60 px-4 py-3.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted">
          {min}
          {suffix}–{max}
          {suffix}
        </span>
        <span className="text-xl font-semibold tabular-nums text-foreground">
          {Number.isInteger(value) ? value : value.toFixed(1)}
          <span className="text-sm text-muted">{suffix}</span>
        </span>
      </div>
      <div className="relative h-9 select-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(Number(e.target.value))
          }
          className={cn(
            "absolute inset-0 w-full appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-purple-bright",
            "[&::-webkit-slider-thumb]:shadow-[0_0_18px_-2px_var(--color-purple-glow)]",
            "[&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-background",
            "[&::-webkit-slider-thumb]:cursor-grab",
            "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-purple-bright",
            "[&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-background",
          )}
        />
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-bright to-purple"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default QuestionField;
