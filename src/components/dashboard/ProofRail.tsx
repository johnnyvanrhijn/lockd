"use client";

import { cn } from "@/lib/utils/cn";
import type { AggregatedImpact } from "@/lib/badHabits/impact";
import {
  formatHours,
  formatKcal,
  formatMoney,
  formatFatMass,
} from "@/lib/badHabits/impact";

type Props = {
  impact: AggregatedImpact;
  /** Optional risk-window sentence for the trailing "context" card. */
  riskWindow?: string | null;
  /** Click on history footer. */
  onOpenHistory?: () => void;
};

type Card = {
  id: string;
  eyebrow: string;
  value: string;
  body: string;
};

/**
 * Horizontal snap-scroll carousel of proof-of-change metrics. One card per
 * dominant metric (€, uren, kcal, fat). Always renders at least one card —
 * falls back to a "begin met loggen" prompt if all metrics are zero.
 */
export function ProofRail({ impact, riskWindow, onOpenHistory }: Props) {
  const cards: Card[] = [];

  if (impact.hours >= 0.1) {
    cards.push({
      id: "hours",
      eyebrow: "Teruggewonnen",
      value: formatHours(impact.hours),
      body: "Tijd die niet naar oude patronen ging.",
    });
  }
  if (impact.kcal >= 50) {
    cards.push({
      id: "kcal",
      eyebrow: "Vermeden",
      value: formatKcal(impact.kcal),
      body: "Door keuzes die je vooruit helpen.",
    });
  }
  if (impact.money >= 1) {
    cards.push({
      id: "money",
      eyebrow: "Bespaard",
      value: formatMoney(impact.money),
      body: "Geld dat niet naar oude gewoontes ging.",
    });
  }
  if (impact.fatKg >= 0.3) {
    cards.push({
      id: "fat",
      eyebrow: "Lichter",
      value: formatFatMass(impact.fatKg),
      body: "Geprojecteerd op basis van vermeden kcal.",
    });
  }
  if (impact.counts && impact.counts.length > 0) {
    const top = [...impact.counts].sort((a, b) => b.total - a.total)[0];
    if (top && top.total >= 5) {
      cards.push({
        id: `count-${top.habitId}`,
        eyebrow: top.label,
        value: `${Math.round(top.total)}${top.unit && top.unit !== "x" ? top.unit : ""}`,
        body: "Urges die je hebt overwonnen.",
      });
    }
  }

  if (cards.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
            Wat je terugwint
          </h2>
        </div>
        <div
          className={cn(
            "rounded-[var(--radius-md)]",
            "border border-[var(--color-border)] bg-surface/60 px-4 py-5",
          )}
        >
          <p className="text-xs text-muted">
            Voeg vragen toe in je profiel om je impact zichtbaar te maken.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Wat je terugwint
        </h2>
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="text-[11px] font-medium text-muted hover:text-foreground"
          >
            Maand
          </button>
        )}
      </div>

      <div
        className={cn(
          "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1",
          "scrollbar-hidden",
        )}
        style={{ scrollPaddingInline: "1rem" }}
      >
        {cards.map((c) => (
          <article
            key={c.id}
            className={cn(
              "snap-start shrink-0",
              "w-[68%] min-w-[220px] max-w-[280px]",
              "rounded-[var(--radius-md)]",
              "border border-[var(--color-border)] bg-surface/70 p-4",
              "shadow-[0_18px_50px_-32px_rgba(139,92,246,0.45)]",
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
              {c.eyebrow}
            </span>
            <div className="mt-2 text-3xl font-semibold leading-none tabular-nums text-foreground">
              {c.value}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              {c.body}
            </p>
          </article>
        ))}
        {riskWindow && (
          <article
            className={cn(
              "snap-start shrink-0",
              "w-[68%] min-w-[220px] max-w-[280px]",
              "rounded-[var(--radius-md)]",
              "border border-purple/30 bg-purple/8 p-4",
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
              Risico-venster
            </span>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {riskWindow}
            </p>
          </article>
        )}
      </div>
    </section>
  );
}

export default ProofRail;
