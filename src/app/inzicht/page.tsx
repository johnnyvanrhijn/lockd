"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { BottomNav } from "@/components/navigation/BottomNav";
import { NAV_ITEMS, NAV_ROUTES } from "@/components/navigation/navItems";
import { ZoneHeader } from "@/components/ui/ZoneHeader";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getActiveLogDate, subDays } from "@/lib/badHabits/clientDate";
import { getBadHabitName } from "@/lib/badHabits/catalog";
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
import {
  getStrugglePattern,
  type StrugglePattern,
} from "@/lib/struggle/client";
import { RecordsHero } from "@/components/inzicht/RecordsHero";
import { StrugglePatternCard } from "@/components/inzicht/StrugglePatternCard";
import {
  HabitBreakdownList,
  type PerHabitRow,
  type DailyStatus,
} from "@/components/inzicht/HabitBreakdownList";
import {
  MoodDistributionCard,
  type MoodDistribution,
} from "@/components/inzicht/MoodDistributionCard";

type InzichtData = {
  insights: Insight[];
  impact: AggregatedImpact;
  moodDistribution: MoodDistribution;
  moodDaysCounted: number;
  lockdStreak: number;
  bestStreak: number;
  daysTracked: number;
  strugglePattern: StrugglePattern | null;
  perHabit: PerHabitRow[];
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
        logsRes,
        weekHistoryRes,
        activeGoalRes,
        moodPatternRes,
        lockdRes,
        individualStreaksRes,
        strugglePattern,
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
          .gte("log_date", since30),
        supabase.rpc("get_consistency_history", {
          p_from: since7,
          p_to: logDate,
        }),
        supabase.rpc("get_active_goal"),
        supabase.rpc("get_mood_pattern", { p_days: 30 }),
        supabase.rpc("get_lockd_streak", { p_today: logDate }),
        supabase.rpc("get_individual_streaks", { p_today: logDate }),
        getStrugglePattern().catch(() => null),
      ]);
      if (cancelled) return;

      const habits = habitsRes.data ?? [];
      const answersByHabit: Record<string, AnswersByQuestion> = {};
      for (const row of answersRes.data ?? []) {
        const h = row.habit_id;
        if (!answersByHabit[h]) answersByHabit[h] = {};
        answersByHabit[h][row.question_id] = row.answer as AnswerValue;
      }

      const allLogs = logsRes.data ?? [];
      const allFails = allLogs.filter((l) => l.status === "fail");
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

      // Hero "days tracked" is inclusive of day-of-add (mirrors the impact
      // calc's +1) so day 1 reads as "1d".
      const daysTracked = habits.length === 0 ? 0 : daysOfData + 1;

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

      // Per-habit 30-day status strips + clean-days + fails-this-month.
      const logsByKey = new Map<string, "success" | "fail">();
      for (const l of allLogs) {
        if (l.status === "success" || l.status === "fail") {
          logsByKey.set(`${l.habit_id}|${l.log_date}`, l.status);
        }
      }
      const dates30: string[] = [];
      for (let i = 29; i >= 0; i--) dates30.push(subDays(logDate, i));

      const streakByHabit = new Map<string, number>();
      type StreakRow = { habit_id: string; current_streak: number | null };
      for (const row of (individualStreaksRes.data ?? []) as StreakRow[]) {
        streakByHabit.set(row.habit_id, row.current_streak ?? 0);
      }

      const perHabit: PerHabitRow[] = habits.map((h) => {
        const dailyStatus: DailyStatus[] = dates30.map(
          (d) => logsByKey.get(`${h.habit_id}|${d}`) ?? "none",
        );
        const added = new Date(h.created_at);
        const daysSinceAdded = Math.max(
          0,
          Math.floor((nowDate.getTime() - added.getTime()) / 86400000) + 1,
        );
        const habitFails = allFails.filter((f) => f.habit_id === h.habit_id);
        const lastFailDate =
          habitFails.length === 0
            ? null
            : habitFails
                .map((f) => f.log_date)
                .sort()
                .reverse()[0];
        const daysClean = lastFailDate
          ? Math.floor(
              (nowDate.getTime() - new Date(lastFailDate).getTime()) /
                86400000,
            )
          : daysSinceAdded;
        return {
          habitId: h.habit_id,
          name: getBadHabitName(h.habit_id),
          streak: streakByHabit.get(h.habit_id) ?? 0,
          daysClean,
          failsThisMonth: habitFails.length,
          dailyStatus,
        };
      });

      const lockdRow = lockdRes.data?.[0] ?? null;

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
        // Intentionally NOT passing strugglePattern — the dedicated
        // StrugglePatternCard owns all struggle messaging on this page.
      });

      setData({
        insights,
        impact,
        moodDistribution,
        moodDaysCounted: moodDaySet.size,
        lockdStreak: lockdRow?.current_streak ?? 0,
        bestStreak: lockdRow?.best_streak ?? 0,
        daysTracked,
        strugglePattern,
        perHabit,
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
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
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
          <LoadingSkeleton height="h-40" />
          <LoadingSkeleton height="h-32" />
          <LoadingSkeleton height="h-48" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Zone: RECORDS */}
          <section className="flex flex-col gap-3">
            <ZoneHeader label="Records" />
            <RecordsHero
              currentStreak={data.lockdStreak}
              bestStreak={data.bestStreak}
              daysTracked={data.daysTracked}
            />
          </section>

          {/* Zone: WAT JE TERUGWINT */}
          <section className="flex flex-col gap-3">
            <ZoneHeader label="Wat je terugwint" />
            <ProofRail
              impact={data.impact}
              onOpenHistory={() => router.push("/geschiedenis")}
            />
          </section>

          {/* Zone: PATRONEN */}
          <section className="flex flex-col gap-3">
            <ZoneHeader label="Patronen" />
            <StrugglePatternCard pattern={data.strugglePattern} />
            {data.insights.length > 0 && (
              <InsightsBlock insights={data.insights} />
            )}
          </section>

          {/* Zone: PER GEWOONTE */}
          <section className="flex flex-col gap-3">
            <ZoneHeader label="Per gewoonte" />
            <HabitBreakdownList items={data.perHabit} />
          </section>

          {/* Zone: STEMMING */}
          <section className="flex flex-col gap-3">
            <ZoneHeader label="Stemming" />
            <MoodDistributionCard
              distribution={data.moodDistribution}
              daysCounted={data.moodDaysCounted}
            />
          </section>
        </div>
      )}
    </AppShell>
  );
}
