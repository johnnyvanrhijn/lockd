"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { IconButton } from "@/components/ui/IconButton";
import { BottomNav } from "@/components/navigation/BottomNav";
import { NAV_ITEMS, NAV_ROUTES } from "@/components/navigation/navItems";
import {
  getActiveGoal,
  getGoalDetail,
  listGoalsHistory,
  upsertGoalSnapshot,
  type GoalRow,
} from "@/lib/goals/client";
import {
  STATUS_LABEL_TEXT,
  computeBehaviorSignal,
  computeRemainingDays,
  deriveStatusLabel,
  formatGoalDate,
  nextMissionRecommendation,
  type NextMissionHint,
} from "@/lib/goals/engine";
import { CATEGORY_LABEL, type GoalCategory } from "@/lib/goals/templates";
import { getSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

type ActiveSummary = {
  goal: GoalRow;
  statusLabel: "op_schema" | "loopt_risico" | "achter_op_schema";
  supportingCount: number;
  sabotageCount: number;
  remainingDays: number;
};

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

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function GoalsPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<ActiveSummary | null>(null);
  const [history, setHistory] = useState<GoalRow[]>([]);
  const [focusHabits, setFocusHabits] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        const [activeGoal, hist, responsesRes] = await Promise.all([
          getActiveGoal(),
          listGoalsHistory(20),
          userId
            ? supabase
                .from("onboarding_responses")
                .select("focus_habits")
                .eq("user_id", userId)
                .maybeSingle()
            : Promise.resolve({ data: null }),
        ]);
        const focus = (responsesRes.data?.focus_habits as string[] | null) ?? [];

        let summary: ActiveSummary | null = null;
        if (activeGoal) {
          try {
            await upsertGoalSnapshot(activeGoal.id);
          } catch (err) {
            console.warn("[goals] snapshot upsert failed:", err);
          }
          const detail = await getGoalDetail(activeGoal.id);
          const supporting = detail.habits.filter((h) => h.relation_type === "support");
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
          const remaining = computeRemainingDays(detail.goal.target_end_date);
          summary = {
            goal: detail.goal,
            statusLabel: deriveStatusLabel(signal),
            supportingCount: supporting.length,
            sabotageCount: sabotage.length,
            remainingDays: remaining,
          };
        }

        if (!cancelled) {
          setActive(summary);
          setHistory(hist);
          setFocusHabits(focus);
          setLoaded(true);
        }
      } catch (err) {
        console.error("[goals] load failed:", err);
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell
      header={
        <header className="flex items-center justify-between gap-3 pt-1">
          <IconButton
            aria-label="Terug"
            icon={<BackArrow />}
            variant="secondary"
            size="md"
            onClick={() => router.push("/dashboard")}
          />
          <div className="flex min-w-0 flex-1 flex-col text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              Missies
            </span>
            <h1 className="truncate text-base font-semibold text-foreground">
              Maak zichtbaar wie je aan het worden bent.
            </h1>
          </div>
          <span className="h-10 w-10" aria-hidden />
        </header>
      }
      bottomNav={
        <BottomNav
          items={NAV_ITEMS}
          activeId="vandaag"
          onSelect={(id) => {
            const dest = NAV_ROUTES[id];
            if (dest) router.push(dest);
          }}
        />
      }
    >
      {!loaded ? (
        <div className="flex flex-col gap-4 pt-2">
          <LoadingSkeleton height="h-48" />
          <LoadingSkeleton height="h-24" />
          <LoadingSkeleton height="h-32" />
        </div>
      ) : !active && history.length === 0 ? (
        <EmptyState onStart={() => router.push("/goals/new")} />
      ) : (
        <div className="flex flex-col gap-5 pb-8">
          {active ? (
            <ActiveMissionCard
              summary={active}
              onOpen={() => router.push(`/goals/${active.goal.id}`)}
            />
          ) : (
            <NoActiveState onStart={() => router.push("/goals/new")} />
          )}

          {!active && history.length > 0 && (
            <RecommendationCard
              hint={nextMissionRecommendation(
                (history[0]?.final_result as
                  | "achieved"
                  | "partially_achieved"
                  | "not_achieved"
                  | null) ?? null,
                {
                  previousTemplateKey: history[0]?.goal_template_key ?? null,
                  focusHabits,
                },
              )}
              onStart={(templateKey) =>
                router.push(
                  templateKey
                    ? `/goals/new?template=${encodeURIComponent(templateKey)}`
                    : "/goals/new",
                )
              }
            />
          )}

          {active && (
            <button
              type="button"
              disabled
              className={cn(
                "w-full rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)]",
                "bg-surface/40 px-4 py-3 text-left text-xs text-muted",
              )}
              aria-disabled
            >
              Rond je huidige missie af voordat je een nieuwe start.
            </button>
          )}

          {history.length > 0 && (
            <HistorySection history={history} />
          )}
        </div>
      )}
    </AppShell>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <GlassCard tone="purple" glow="soft" padding="lg">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Start je eerste missie
        </span>
        <h2 className="text-xl font-semibold leading-tight text-foreground">
          Kies een concreet doel, koppel de gewoontes die tellen en bescherm je standaard
          voor een vaste periode.
        </h2>
        <button
          type="button"
          onClick={onStart}
          className={cn(
            "mt-1 inline-flex items-center justify-center gap-2",
            "rounded-full border border-purple/50 bg-purple/15 px-4 py-3",
            "text-sm font-semibold text-purple-bright",
            "transition-all duration-200 active:scale-[0.97]",
            "hover:border-purple/80 hover:bg-purple/25",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
          )}
        >
          Nieuwe missie starten
          <ArrowRight />
        </button>
      </div>
    </GlassCard>
  );
}

function NoActiveState({ onStart }: { onStart: () => void }) {
  return (
    <GlassCard padding="md">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">
          Je hebt geen actieve missie.
        </span>
        <button
          type="button"
          onClick={onStart}
          className={cn(
            "mt-1 inline-flex items-center justify-center gap-2 self-start",
            "rounded-full border border-purple/50 bg-purple/15 px-3.5 py-2",
            "text-xs font-semibold text-purple-bright",
            "hover:bg-purple/25",
          )}
        >
          Nieuwe missie starten
          <ArrowRight />
        </button>
      </div>
    </GlassCard>
  );
}

function ActiveMissionCard({
  summary,
  onOpen,
}: {
  summary: ActiveSummary;
  onOpen: () => void;
}) {
  const { goal } = summary;
  const pct = Math.round(goal.progress_percentage);
  const tone =
    summary.statusLabel === "op_schema"
      ? "border-success/40 bg-success/8"
      : summary.statusLabel === "loopt_risico"
        ? "border-warning/40 bg-warning/8"
        : "border-danger/40 bg-danger/8";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-[var(--radius-md)] border p-5 text-left",
        "transition-transform duration-200 active:scale-[0.997]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
        tone,
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
            {goal.category ? CATEGORY_LABEL[goal.category as GoalCategory] ?? goal.category : "Missie"}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/85">
            {STATUS_LABEL_TEXT[summary.statusLabel]}
          </span>
        </div>

        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {goal.title}
        </h2>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums text-foreground">
            Dag {goal.current_day}
          </span>
          <span className="text-sm font-medium text-foreground/70">
            van {goal.duration_days}
          </span>
          <span className="ml-auto text-sm font-semibold tabular-nums text-purple-bright">
            {pct}%
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-purple-bright/80"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-[12px] leading-relaxed text-muted line-clamp-2">
          <span className="text-foreground/85">Waarom:</span> {goal.why}
        </p>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-[11px]">
          <span className="text-muted">
            {summary.supportingCount} bescherm · {summary.sabotageCount} vermijd
          </span>
          <span className="inline-flex items-center gap-1 text-purple-bright">
            Bekijk voortgang
            <ArrowRight />
          </span>
        </div>
      </div>
    </button>
  );
}

function RecommendationCard({
  hint,
  onStart,
}: {
  hint: NextMissionHint | null;
  onStart: (templateKey?: string) => void;
}) {
  if (!hint) return null;
  const hasTemplate = Boolean(hint.suggestedTemplateKey);
  return (
    <GlassCard padding="md" tone={hasTemplate ? "purple" : "default"}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
            Aanbeveling
          </span>
          {hint.suggestedDurationDays && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
              {hint.suggestedDurationDays}d
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{hint.copy}</p>
        <button
          type="button"
          onClick={() => onStart(hint.suggestedTemplateKey)}
          className={cn(
            "self-start inline-flex items-center gap-1.5 rounded-full",
            "border border-purple/50 bg-purple/15 px-3.5 py-2",
            "text-xs font-semibold text-purple-bright",
            "transition-colors duration-150 hover:bg-purple/25",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
          )}
        >
          {hasTemplate ? "Start deze missie" : "Nieuwe missie starten"}
          <ArrowRight />
        </button>
      </div>
    </GlassCard>
  );
}

function HistorySection({ history }: { history: GoalRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Afgeronde missies
        </h2>
        <span className="text-[11px] text-muted">{history.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {history.map((g) => (
          <HistoryRow key={g.id} goal={g} />
        ))}
      </div>
    </section>
  );
}

function HistoryRow({ goal }: { goal: GoalRow }) {
  const resultLabel =
    goal.final_result === "achieved"
      ? "Behaald"
      : goal.final_result === "partially_achieved"
        ? "Gedeeltelijk"
        : goal.final_result === "not_achieved"
          ? "Niet behaald"
          : goal.status === "abandoned"
            ? "Afgebroken"
            : "Afgerond";
  const tone =
    goal.final_result === "achieved"
      ? "text-success"
      : goal.final_result === "not_achieved" || goal.status === "abandoned"
        ? "text-danger"
        : "text-warning";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-[var(--radius-sm)]",
        "border border-[var(--color-border)] bg-surface/60 px-4 py-3",
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-foreground">
          {goal.title}
        </span>
        <span className="text-[11px] text-muted">
          {goal.duration_days} dagen
          {goal.completed_at && ` · ${formatGoalDate(goal.completed_at)}`}
        </span>
      </div>
      <span className={cn("shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em]", tone)}>
        {resultLabel}
      </span>
    </div>
  );
}
