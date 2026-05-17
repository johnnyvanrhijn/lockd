"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  abandonGoal,
  getGoalDetail,
  upsertGoalSnapshot,
  type GoalDetail,
} from "@/lib/goals/client";
import {
  STATUS_LABEL_TEXT,
  SIGNAL_LABEL_TEXT,
  computeBehaviorSignal,
  computeRemainingDays,
  computeTimeProgress,
  deriveStatusLabel,
  formatGoalDate,
  isCompletionEligible,
  projectionSentence,
  type BehaviorSignal,
} from "@/lib/goals/engine";
import { CATEGORY_LABEL, type GoalCategory } from "@/lib/goals/templates";
import { cn } from "@/lib/utils/cn";

function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ViewData = {
  detail: GoalDetail;
  timeProgressPct: number;
  remainingDays: number;
  signal: BehaviorSignal;
  statusLabel: ReturnType<typeof deriveStatusLabel>;
};

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const goalId = params.id;

  const [view, setView] = useState<ViewData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [abandoning, setAbandoning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await upsertGoalSnapshot(goalId).catch(() => undefined);
        const detail = await getGoalDetail(goalId);
        if (cancelled) return;

        const sabotage = detail.habits.filter((h) => h.relation_type === "sabotage");
        const linkedSabotage = sabotage.filter((h) => Boolean(h.habit_id));
        const sabFails = linkedSabotage.reduce(
          (sum, h) =>
            sum + (h.habit_id ? detail.sabotageFailCounts[h.habit_id] ?? 0 : 0),
          0,
        );
        const signal = computeBehaviorSignal({
          linkedSabotageCount: linkedSabotage.length,
          sabotageFailCount: sabFails,
        });

        setView({
          detail,
          timeProgressPct: computeTimeProgress(
            detail.goal.start_date,
            detail.goal.duration_days,
          ),
          remainingDays: computeRemainingDays(detail.goal.target_end_date),
          signal,
          statusLabel: deriveStatusLabel(signal),
        });
        setLoaded(true);
      } catch (err) {
        console.error("[goal detail] load failed:", err);
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [goalId]);

  async function handleAbandonWithoutReflection() {
    if (abandoning) return;
    setAbandoning(true);
    try {
      await abandonGoal(goalId, false);
      router.push("/goals");
    } catch (err) {
      console.error("[goal] abandon failed:", err);
      setAbandoning(false);
    }
  }

  return (
    <AppShell
      header={
        <header className="flex items-center justify-between gap-3 pt-1">
          <IconButton
            aria-label="Terug"
            icon={<BackArrow />}
            variant="secondary"
            size="md"
            onClick={() => router.push("/goals")}
          />
          <div className="flex min-w-0 flex-1 flex-col text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              Missie
            </span>
            <h1 className="truncate text-base font-semibold text-foreground">
              {view?.detail.goal.title ?? "…"}
            </h1>
          </div>
          <span className="h-10 w-10" aria-hidden />
        </header>
      }
    >
      {!loaded || !view ? (
        <div className="flex flex-col gap-4 pt-2">
          <LoadingSkeleton height="h-44" />
          <LoadingSkeleton height="h-32" />
          <LoadingSkeleton height="h-24" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 pb-8">
          <HeroCard view={view} />
          <ProgressCard view={view} />
          {view.detail.goal.status === "active" && (
            <TodayFocus detail={view.detail} />
          )}
          <HabitImpact detail={view.detail} />
          <ProjectionCard view={view} />
          <ActionsCard
            view={view}
            onComplete={() => router.push(`/goals/${goalId}/complete`)}
            onEnd={() => setEndDialogOpen(true)}
            onStartSimilar={() => router.push("/goals/new")}
          />
        </div>
      )}

      {endDialogOpen && view && (
        <EndDialog
          onClose={() => setEndDialogOpen(false)}
          onWith={() => router.push(`/goals/${goalId}/complete`)}
          onWithout={handleAbandonWithoutReflection}
          abandoning={abandoning}
        />
      )}
    </AppShell>
  );
}

function HeroCard({ view }: { view: ViewData }) {
  const g = view.detail.goal;
  const tone =
    view.statusLabel === "op_schema"
      ? "border-success/40 bg-success/8"
      : view.statusLabel === "loopt_risico"
        ? "border-warning/40 bg-warning/8"
        : "border-danger/40 bg-danger/8";
  return (
    <article
      className={cn(
        "rounded-[var(--radius-md)] border p-5",
        tone,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
          {g.category
            ? CATEGORY_LABEL[g.category as GoalCategory] ?? g.category
            : "Missie"}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/85">
          {STATUS_LABEL_TEXT[view.statusLabel]}
        </span>
      </div>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        {g.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">
        <span className="text-muted">Waarom:</span> {g.why}
      </p>
    </article>
  );
}

function ProgressCard({ view }: { view: ViewData }) {
  const g = view.detail.goal;
  return (
    <GlassCard padding="md">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
            Voortgang
          </span>
          <span className="text-[11px] text-muted">
            Eind {formatGoalDate(g.target_end_date)}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums text-foreground">
            Dag {g.current_day}
          </span>
          <span className="text-sm font-medium text-foreground/70">
            van {g.duration_days}
          </span>
          <span className="ml-auto text-sm font-semibold tabular-nums text-purple-bright">
            {view.timeProgressPct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-purple-bright/80"
            style={{ width: `${view.timeProgressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-[11px]">
          <span className="text-muted">Voortgang op tijd</span>
          <span className="font-semibold uppercase tracking-[0.18em] text-foreground/85">
            {view.remainingDays} {view.remainingDays === 1 ? "dag" : "dagen"} resterend
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

function TodayFocus({ detail }: { detail: GoalDetail }) {
  const supporting = detail.habits.filter((h) => h.relation_type === "support");
  const sabotage = detail.habits.filter((h) => h.relation_type === "sabotage");
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Vandaag bescherm je
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {supporting.length > 0 && (
          <FocusGroup title="Bescherm" tone="support" items={supporting.map((h) => h.habit_name)} />
        )}
        {sabotage.length > 0 && (
          <FocusGroup title="Vermijd" tone="sabotage" items={sabotage.map((h) => h.habit_name)} />
        )}
      </div>
    </section>
  );
}

function FocusGroup({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "support" | "sabotage";
  items: string[];
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-sm)] border p-3",
        tone === "support"
          ? "border-success/30 bg-success/8"
          : "border-warning/30 bg-warning/8",
      )}
    >
      <span
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.22em]",
          tone === "support" ? "text-success" : "text-warning",
        )}
      >
        {title}
      </span>
      <ul className="mt-2 flex flex-col gap-1">
        {items.map((name) => (
          <li
            key={name}
            className="text-sm font-medium text-foreground/90"
          >
            • {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HabitImpact({ detail }: { detail: GoalDetail }) {
  const supporting = detail.habits.filter((h) => h.relation_type === "support");
  const sabotage = detail.habits.filter((h) => h.relation_type === "sabotage");
  const hasLinkedSabotage = sabotage.some((h) => Boolean(h.habit_id));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Habit impact
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <GlassCard padding="md">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-success">
              Habits die helpen
            </span>
            {supporting.length === 0 ? (
              <p className="text-sm text-muted">—</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {supporting.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-foreground/90">{h.habit_name}</span>
                    <span className="text-[11px] text-muted">
                      Nog onvoldoende gedragsdata
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </GlassCard>

        <GlassCard padding="md">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-warning">
              Habits die tegenwerken
            </span>
            {sabotage.length === 0 ? (
              <p className="text-sm text-muted">—</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {sabotage.map((h) => {
                  const fails = h.habit_id
                    ? detail.sabotageFailCounts[h.habit_id] ?? 0
                    : null;
                  return (
                    <li
                      key={h.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-foreground/90">{h.habit_name}</span>
                      <span
                        className={cn(
                          "text-[11px] tabular-nums",
                          fails === null
                            ? "text-muted"
                            : fails === 0
                              ? "text-success"
                              : fails <= 2
                                ? "text-warning"
                                : "text-danger",
                        )}
                      >
                        {fails === null
                          ? "Niet gekoppeld"
                          : `${fails} terugval${fails === 1 ? "" : "len"}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {!hasLinkedSabotage && sabotage.length > 0 && (
              <p className="text-[11px] text-muted">
                Koppel deze gewoontes aan je dashboard om gedragsdata te
                gebruiken.
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function ProjectionCard({ view }: { view: ViewData }) {
  const sentence = projectionSentence({
    signal: view.signal,
    remainingDays: view.remainingDays,
  });
  return (
    <GlassCard padding="md">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
            Projectie
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/85">
            Gedrag: {SIGNAL_LABEL_TEXT[view.signal]}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{sentence}</p>
      </div>
    </GlassCard>
  );
}

function ActionsCard({
  view,
  onComplete,
  onEnd,
  onStartSimilar,
}: {
  view: ViewData;
  onComplete: () => void;
  onEnd: () => void;
  onStartSimilar: () => void;
}) {
  const g = view.detail.goal;
  const dueForCompletion = isCompletionEligible(g.target_end_date);

  if (g.status !== "active") {
    return (
      <div className="flex flex-col gap-2">
        <PrimaryButton onClick={onStartSimilar} fullWidth>
          Vergelijkbare missie starten
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {dueForCompletion && (
        <PrimaryButton onClick={onComplete} fullWidth>
          Missie afronden
        </PrimaryButton>
      )}
      <button
        type="button"
        onClick={onEnd}
        className={cn(
          "h-12 rounded-[var(--radius-sm)] text-sm font-medium text-muted",
          "transition-colors hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/40",
        )}
      >
        Missie beëindigen
      </button>
    </div>
  );
}

function EndDialog({
  onClose,
  onWith,
  onWithout,
  abandoning,
}: {
  onClose: () => void;
  onWith: () => void;
  onWithout: () => void;
  abandoning: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Sluit"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative w-full max-w-[400px] rounded-[var(--radius-md)]",
          "border border-[var(--color-border-strong)] bg-surface p-5",
          "shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)]",
        )}
      >
        <h2 className="text-lg font-semibold text-foreground">
          Missie beëindigen
        </h2>
        <p className="mt-1 text-sm text-muted">
          Wat helpt jou het meest om hieruit te leren?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onWith}
            disabled={abandoning}
            className={cn(
              "h-12 rounded-[var(--radius-sm)] text-sm font-semibold",
              "bg-purple text-foreground transition-colors hover:bg-purple-bright",
              "disabled:opacity-50",
            )}
          >
            Beëindigen met reflectie
          </button>
          <button
            type="button"
            onClick={onWithout}
            disabled={abandoning}
            className={cn(
              "h-12 rounded-[var(--radius-sm)] border border-[var(--color-border)]",
              "bg-surface/60 text-sm font-medium text-muted",
              "transition-colors hover:text-foreground",
              "disabled:opacity-50",
            )}
          >
            {abandoning ? "Afsluiten…" : "Beëindigen zonder reflectie"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={abandoning}
            className="h-10 text-xs font-medium text-muted hover:text-foreground"
          >
            Annuleer
          </button>
        </div>
      </div>
    </div>
  );
}
