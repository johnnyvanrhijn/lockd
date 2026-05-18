"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { BottomNav } from "@/components/navigation/BottomNav";
import { NAV_ITEMS, NAV_ROUTES } from "@/components/navigation/navItems";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getActiveLogDate, subDays } from "@/lib/badHabits/clientDate";
import {
  aggregateImpact,
  type AggregatedImpact,
  type ImpactInput,
} from "@/lib/badHabits/impact";
import { assessRisk, describeWindow, type RecentFail } from "@/lib/badHabits/risk";
import type { AnswerValue, AnswersByQuestion } from "@/lib/badHabits/questions";
import { getQuestionsForHabit } from "@/lib/badHabits/questions";
import { generateInsights, type Insight } from "@/lib/insights/engine";
import { InsightsBlock } from "@/components/dashboard/InsightsBlock";
import { ProofRail } from "@/components/dashboard/ProofRail";
import { MOOD_OPTIONS, type MoodId } from "@/lib/mood/options";
import { cn } from "@/lib/utils/cn";

type MoodDistribution = Array<{ mood: MoodId; count: number; pct: number }>;

type InzichtData = {
  insights: Insight[];
  impact: AggregatedImpact;
  moodDistribution: MoodDistribution;
  moodDaysCounted: number;
};

export default function InzichtPage() {
  const router = useRouter();
  const [data, setData] = useState<InzichtData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const logDate = useMemo(() => getActiveLogDate(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      const userId = userData.user.id;

      const since30 = subDays(logDate, 30);
      const since7 = subDays(logDate, 6);
      const [
        habitsRes,
        answersRes,
        failsRes,
        weekHistoryRes,
        activeGoalRes,
        moodPatternRes,
      ] = await Promise.all([
        supabase
          .from("user_bad_habits")
          .select("habit_id, created_at")
          .eq("user_id", userId)
          .eq("active", true),
        supabase
          .from("user_habit_answers")
          .select("habit_id, question_id, answer")
          .eq("user_id", userId),
        supabase
          .from("habit_logs")
          .select("habit_id, log_date, status, created_at")
          .eq("user_id", userId)
          .eq("status", "fail")
          .gte("log_date", since30),
        supabase.rpc("get_consistency_history", {
          p_from: since7,
          p_to: logDate,
        }),
        supabase.rpc("get_active_goal"),
        supabase.rpc("get_mood_pattern", { p_days: 30 }),
      ]);
      if (cancelled) return;

      const habits = habitsRes.data ?? [];
      const answersByHabit: Record<string, AnswersByQuestion> = {};
      for (const row of answersRes.data ?? []) {
        const h = row.habit_id;
        if (!answersByHabit[h]) answersByHabit[h] = {};
        answersByHabit[h][row.question_id] = row.answer as AnswerValue;
      }

      const allFails = failsRes.data ?? [];
      const failsByHabit: Record<string, number> = {};
      for (const f of allFails) {
        failsByHabit[f.habit_id] = (failsByHabit[f.habit_id] ?? 0) + 1;
      }

      const nowDate = new Date();
      const impactInputs: ImpactInput[] = habits.map((h) => {
        const added = new Date(h.created_at);
        const daysSinceAdded = Math.max(
          0,
          Math.floor((nowDate.getTime() - added.getTime()) / 86400000) + 1,
        );
        const fails = failsByHabit[h.habit_id] ?? 0;
        return {
          habitId: h.habit_id,
          answers: answersByHabit[h.habit_id] ?? {},
          cleanDays: Math.max(0, daysSinceAdded - fails),
        };
      });
      const impact = aggregateImpact(impactInputs);

      const triggersByHabit: Record<string, string[]> = {};
      for (const h of habits) {
        const habitAnswers = answersByHabit[h.habit_id] ?? {};
        const triggerQ = getQuestionsForHabit(h.habit_id).find(
          (q) => q.metricKey === "triggers",
        );
        if (triggerQ) {
          const ans = habitAnswers[triggerQ.id] ?? triggerQ.defaultAnswer;
          if (Array.isArray(ans))
            triggersByHabit[h.habit_id] = ans as string[];
        }
      }

      const recentFails: RecentFail[] = allFails.map((f) => {
        const created = f.created_at ? new Date(f.created_at as string) : null;
        return {
          habitId: f.habit_id,
          date: f.log_date,
          hour: created ? created.getHours() : null,
        };
      });

      const weekRows = weekHistoryRes.data ?? [];
      const usableWeek = weekRows.filter((r) => r.pct !== null);
      const recentConsistencyPct =
        usableWeek.length === 0
          ? 0
          : Math.round(
              usableWeek.reduce((s, r) => s + (r.pct ?? 0), 0) /
                usableWeek.length,
            );

      const daysOfData =
        habits.length === 0
          ? 0
          : Math.max(
              ...habits.map((h) => {
                const added = new Date(h.created_at);
                return Math.floor(
                  (nowDate.getTime() - added.getTime()) / 86400000,
                );
              }),
            );

      const risk = assessRisk({
        triggersByHabit,
        recentFails,
        daysOfData,
        recentConsistencyPct,
        hasActiveHabits: habits.length > 0,
        now: nowDate,
      });

      const activeGoalRow = activeGoalRes.data?.[0] ?? null;
      const activeMission = activeGoalRow
        ? {
            title: activeGoalRow.title,
            currentDay: activeGoalRow.current_day,
            durationDays: activeGoalRow.duration_days,
            statusLabel: null as
              | "op_schema"
              | "loopt_risico"
              | "achter_op_schema"
              | null,
          }
        : null;

      const moodRows = moodPatternRes.data ?? [];
      const moodCounts = new Map<MoodId, number>();
      let totalMoodCount = 0;
      const moodDaySet = new Set<string>();
      for (const r of moodRows) {
        const m = r.mood as MoodId;
        const c = Number(r.count ?? 0);
        moodCounts.set(m, (moodCounts.get(m) ?? 0) + c);
        totalMoodCount += c;
        moodDaySet.add(r.log_date);
      }
      const moodDistribution: MoodDistribution = MOOD_OPTIONS.map((opt) => {
        const count = moodCounts.get(opt.id) ?? 0;
        const pct =
          totalMoodCount > 0
            ? Math.round((100 * count) / totalMoodCount)
            : 0;
        return { mood: opt.id, count, pct };
      })
        .filter((row) => row.count > 0)
        .sort((a, b) => b.count - a.count);

      const insights = generateInsights({
        risk,
        riskSentence: describeWindow(risk),
        impact,
        recentConsistencyPct,
        moodPattern: moodRows.map((r) => ({
          logDate: r.log_date,
          mood: r.mood as MoodId,
          count: Number(r.count ?? 0),
        })),
        recentFailDates: allFails.map((f) => f.log_date),
        activeMission,
        activeHabitsCount: habits.length,
      });

      setData({
        insights,
        impact,
        moodDistribution,
        moodDaysCounted: moodDaySet.size,
      });
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [logDate, router]);

  return (
    <AppShell
      header={
        <header className="flex items-center justify-between gap-3 pt-1">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
              Inzicht
            </h1>
            <p className="text-sm text-muted">
              Zie wat jouw patronen vertellen.
            </p>
          </div>
        </header>
      }
      bottomNav={
        <BottomNav
          items={NAV_ITEMS}
          activeId="inzicht"
          onSelect={(id) => {
            const dest = NAV_ROUTES[id];
            if (dest && dest !== "/inzicht") router.push(dest);
          }}
        />
      }
    >
      {!loaded || !data ? (
        <div className="flex flex-col gap-4 pt-2">
          <LoadingSkeleton height="h-32" />
          <LoadingSkeleton height="h-48" />
          <LoadingSkeleton height="h-32" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {data.insights.length === 0 ? (
            <GlassCard padding="md">
              <p className="text-sm text-muted">
                Inzichten verschijnen hier zodra je een aantal dagen logt en
                een check-in doet.
              </p>
            </GlassCard>
          ) : (
            <InsightsBlock insights={data.insights} />
          )}

          <ProofRail
            impact={data.impact}
            onOpenHistory={() => router.push("/geschiedenis")}
          />

          <MoodDistributionSection
            distribution={data.moodDistribution}
            daysCounted={data.moodDaysCounted}
          />
        </div>
      )}
    </AppShell>
  );
}

function MoodDistributionSection({
  distribution,
  daysCounted,
}: {
  distribution: MoodDistribution;
  daysCounted: number;
}) {
  if (distribution.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
            Jouw stemming (30d)
          </h2>
        </div>
        <GlassCard padding="md">
          <p className="text-sm text-muted">
            Begin met dagelijkse check-ins op het dashboard om je stemming-
            patroon te zien.
          </p>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Jouw stemming (30d)
        </h2>
        <span className="text-[11px] text-muted">{daysCounted}d gemeten</span>
      </div>
      <GlassCard padding="md">
        <div className="flex flex-col gap-3">
          {distribution.map((row) => {
            const opt = MOOD_OPTIONS.find((m) => m.id === row.mood);
            if (!opt) return null;
            return (
              <div key={row.mood} className="flex items-center gap-3">
                <span aria-hidden className="text-xl">
                  {opt.emoji}
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {opt.label}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted">
                      {row.pct}%
                    </span>
                  </div>
                  <div
                    className={cn(
                      "h-1.5 w-full overflow-hidden rounded-full",
                      "bg-surface-elevated",
                    )}
                  >
                    <div
                      className="h-full rounded-full bg-purple-bright/70"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </section>
  );
}
