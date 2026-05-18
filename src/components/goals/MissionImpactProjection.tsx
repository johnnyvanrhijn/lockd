import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";
import type { SuggestedHabit } from "@/lib/goals/templates";
import {
  aggregateImpact,
  formatHours,
  formatKcal,
  formatMoney,
  formatFatMass,
  type ImpactInput,
} from "@/lib/badHabits/impact";
import type { AnswersByQuestion } from "@/lib/badHabits/questions";

type Props = {
  /** Sabotage habits chosen for the new mission. */
  sabotage: ReadonlyArray<SuggestedHabit>;
  /** Mission duration in days — drives projected savings. */
  durationDays: number;
  /** User's existing habit answers, keyed by habit_id (master). */
  habitAnswers: Record<string, AnswersByQuestion>;
};

/**
 * Step-4 projection card. Shows the user a tangible estimate of what they
 * gain by protecting these sabotage habits for the chosen duration.
 *
 * Only renders when at least one sabotage habit is linked to a master habit
 * AND we have answers to estimate from — otherwise we'd be guessing.
 */
export function MissionImpactProjection({
  sabotage,
  durationDays,
  habitAnswers,
}: Props) {
  const linked = sabotage.filter(
    (h) => h.habitId && habitAnswers[h.habitId],
  );
  if (linked.length === 0 || durationDays <= 0) return null;

  const inputs: ImpactInput[] = linked.map((h) => ({
    habitId: h.habitId!,
    answers: habitAnswers[h.habitId!] ?? {},
    cleanDays: durationDays,
  }));
  const impact = aggregateImpact(inputs);

  const lines: Array<{ label: string; value: string; tone: "purple" | "success" }> = [];
  if (impact.money >= 1) {
    lines.push({
      label: "Bespaard",
      value: formatMoney(impact.money),
      tone: "success",
    });
  }
  if (impact.hours >= 0.5) {
    lines.push({
      label: "Teruggewonnen",
      value: formatHours(impact.hours),
      tone: "purple",
    });
  }
  if (impact.kcal >= 100) {
    lines.push({
      label: "Vermeden",
      value: formatKcal(impact.kcal),
      tone: "purple",
    });
  }
  if (impact.fatKg >= 0.2) {
    lines.push({
      label: "Lichter",
      value: formatFatMass(impact.fatKg),
      tone: "success",
    });
  }

  if (lines.length === 0) return null;

  return (
    <GlassCard tone="purple" glow="soft" padding="md">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
            Dit win je terug
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
            {durationDays} {durationDays === 1 ? "dag" : "dagen"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {lines.map((row) => (
            <div
              key={row.label}
              className={cn(
                "flex flex-col gap-0.5 rounded-[var(--radius-sm)]",
                "border border-[var(--color-border)] bg-surface/60 p-3",
              )}
            >
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {row.value}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                {row.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-muted">
          Geschat op basis van de gewoontes die je beschermt en jouw eigen
          antwoorden. Niet exact, wel zichtbaar.
        </p>
      </div>
    </GlassCard>
  );
}

export default MissionImpactProjection;
