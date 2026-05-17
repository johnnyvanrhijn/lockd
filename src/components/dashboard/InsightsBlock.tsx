"use client";

import { cn } from "@/lib/utils/cn";
import type { Insight, InsightTone } from "@/lib/insights/engine";

const TONE_CLASSES: Record<InsightTone, string> = {
  neutral: "border-[var(--color-border)] bg-surface/60",
  purple:
    "border-purple/40 bg-purple/8 shadow-[0_18px_50px_-32px_rgba(139,92,246,0.45)]",
  warning:
    "border-warning/40 bg-warning/8 shadow-[0_18px_50px_-32px_rgba(251,146,60,0.4)]",
  success:
    "border-success/40 bg-success/8 shadow-[0_18px_50px_-32px_rgba(74,222,128,0.35)]",
};

const TONE_EYEBROW: Record<InsightTone, string> = {
  neutral: "text-purple-bright",
  purple: "text-purple-bright",
  warning: "text-warning",
  success: "text-success",
};

type Props = {
  insights: ReadonlyArray<Insight>;
};

export function InsightsBlock({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Inzichten
        </h2>
      </div>
      <div className="flex flex-col gap-2">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className={cn(
              "rounded-[var(--radius-md)] border p-4",
              TONE_CLASSES[insight.tone],
            )}
          >
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.22em]",
                TONE_EYEBROW[insight.tone],
              )}
            >
              {insight.eyebrow}
            </span>
            <h3 className="mt-1 text-sm font-semibold text-foreground">
              {insight.title}
            </h3>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              {insight.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default InsightsBlock;
