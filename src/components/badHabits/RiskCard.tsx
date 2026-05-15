"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";
import type { RiskAssessment } from "@/lib/badHabits/risk";

type Props = {
  risk: RiskAssessment;
  /** Optional second line ("80% van je terugvallen valt tussen ..."). */
  windowSentence?: string | null;
};

function PulseGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M3 12h4l2-6 4 12 2-6h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function bucket(
  score: number,
): { tone: "calm" | "warning" | "danger"; label: string } {
  if (score >= 70) return { tone: "danger", label: "Hoog" };
  if (score >= 40) return { tone: "warning", label: "Mid" };
  return { tone: "calm", label: "Laag" };
}

/**
 * Risk card — surfaces a 0..100 chance-of-relapse score with a one-line
 * explanation. Designed to feel like an oncologist's heads-up: confident,
 * brief, never alarmist. Hidden when there's no actionable signal.
 */
export function RiskCard({ risk, windowSentence }: Props) {
  if (risk.source === "none") return null;

  const b = bucket(risk.scoreNow);

  return (
    <GlassCard padding="md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.25em]",
              b.tone === "danger" && "text-danger",
              b.tone === "warning" && "text-warning",
              b.tone === "calm" && "text-purple-bright",
            )}
          >
            <PulseGlyph />
            Risico nu · {b.label}
          </span>
          <p className="text-sm font-medium text-foreground">{risk.reason}</p>
          {windowSentence && (
            <p className="text-[11px] leading-relaxed text-muted">
              {windowSentence}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex shrink-0 flex-col items-end gap-0.5 text-right",
            "rounded-[var(--radius-sm)] px-3 py-2",
            "border",
            b.tone === "danger" && "border-danger/30 bg-danger/10 text-danger",
            b.tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
            b.tone === "calm" && "border-purple/30 bg-purple/10 text-purple-bright",
          )}
        >
          <span className="text-2xl font-semibold leading-none tabular-nums">
            {risk.scoreNow}
            <span className="text-base opacity-70">%</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-80">
            Kans
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

export default RiskCard;
