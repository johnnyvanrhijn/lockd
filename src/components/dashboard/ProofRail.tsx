"use client";

import { useEffect, useRef, useState } from "react";
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
 * Horizontal snap-scroll carousel with three visual clarity boosts:
 *  - Smaller card width so a second card always peeks visibly
 *  - Right-edge fade gradient signaling more content
 *  - Dot pagination below tracking the active card
 *
 * Falls back to a single empty-state card if no impact data exists.
 */
export function ProofRail({ impact, onOpenHistory }: Props) {
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
            Maand →
          </button>
        )}
      </div>

      <ProofCarousel cards={cards} />
    </section>
  );
}

function ProofCarousel({ cards }: { cards: ReadonlyArray<Card> }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Sync activeIdx with the most-visible card using IntersectionObserver.
  // Cheaper than a scroll listener (no per-frame work) and accurate enough
  // for snap-scroll where one card is dominant at a time.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardEls = Array.from(el.querySelectorAll<HTMLElement>("[data-proof-card]"));
    if (cardEls.length === 0) return;

    const visibility = new Map<HTMLElement, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target as HTMLElement, entry.intersectionRatio);
        }
        let bestEl: HTMLElement | null = null;
        let bestRatio = -1;
        for (const [card, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestEl = card;
          }
        }
        if (bestEl) {
          const idx = cardEls.indexOf(bestEl);
          if (idx >= 0) setActiveIdx(idx);
        }
      },
      { root: el, threshold: [0.25, 0.5, 0.75, 1] },
    );

    for (const card of cardEls) observer.observe(card);
    return () => observer.disconnect();
  }, [cards.length]);

  return (
    <>
      <div className="relative -mx-4">
        <div
          ref={scrollerRef}
          className={cn(
            "flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2",
            "scrollbar-hidden",
          )}
          style={{ scrollPaddingInline: "1rem" }}
        >
          {cards.map((c, idx) => (
            <article
              key={c.id}
              data-proof-card
              className={cn(
                "snap-start shrink-0",
                "w-[58%] min-w-[200px] max-w-[260px]",
                "rounded-[var(--radius-md)]",
                "border bg-surface/70 p-4",
                "transition-[transform,border-color,box-shadow] duration-300 ease-out",
                "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                "will-change-transform",
                idx === activeIdx
                  ? [
                      "border-purple/35",
                      "shadow-[0_22px_60px_-32px_var(--color-purple-glow)]",
                      "[transform:scale(1.015)]",
                    ]
                  : [
                      "border-[var(--color-border)]",
                      "shadow-[0_18px_50px_-32px_rgba(139,92,246,0.45)]",
                      "[transform:scale(1)]",
                    ],
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
        </div>
        {/* Right-edge fade hint */}
        {cards.length > 1 && (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute right-0 top-0 h-full w-12",
              "bg-gradient-to-l from-background to-transparent",
            )}
          />
        )}
        {/* Left-edge fade once user has scrolled */}
        {cards.length > 1 && activeIdx > 0 && (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 top-0 h-full w-8",
              "bg-gradient-to-r from-background to-transparent",
            )}
          />
        )}
      </div>

      {cards.length > 1 && (
        <div
          aria-label={`Pagina ${activeIdx + 1} van ${cards.length}`}
          className="flex items-center justify-center gap-1.5"
        >
          {cards.map((c, idx) => (
            <span
              key={c.id}
              aria-hidden
              className={cn(
                "lockd-dot-indicator h-1.5 rounded-full",
                idx === activeIdx
                  ? "w-5 bg-purple-bright"
                  : "w-1.5 bg-[var(--color-border-strong)]",
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default ProofRail;
