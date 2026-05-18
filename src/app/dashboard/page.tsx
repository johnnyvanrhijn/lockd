"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { BottomNav } from "@/components/navigation/BottomNav";
import { NAV_ITEMS, NAV_ROUTES } from "@/components/navigation/navItems";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  getBadHabitName,
  getDailyStatement,
  getHabitType,
} from "@/lib/badHabits/catalog";
import { getActiveLogDate, subDays } from "@/lib/badHabits/clientDate";
import { IdentityHeroCard } from "@/components/badHabits/IdentityHeroCard";
import {
  HabitCommitmentCard,
  type CommitmentHabitType,
  type CommitmentStatus,
} from "@/components/badHabits/HabitCommitmentCard";
import { RiskCard } from "@/components/badHabits/RiskCard";
import {
  aggregateImpact,
  type AggregatedImpact,
  type ImpactInput,
} from "@/lib/badHabits/impact";
import {
  assessRisk,
  describeWindow,
  type RecentFail,
  type RiskAssessment,
} from "@/lib/badHabits/risk";
import type { AnswerValue, AnswersByQuestion } from "@/lib/badHabits/questions";
import { getQuestionsForHabit } from "@/lib/badHabits/questions";
import { PrimaryInterventionCTA } from "@/components/dashboard/PrimaryInterventionCTA";
import { EmotionalCheckIn } from "@/components/mood/EmotionalCheckIn";
import type { MoodId } from "@/lib/mood/options";
import { InnerCircleWidget } from "@/components/circle/InnerCircleWidget";
import { ProofRail } from "@/components/dashboard/ProofRail";
import { InsightsBlock } from "@/components/dashboard/InsightsBlock";
import { ActiveMissionWidget } from "@/components/dashboard/ActiveMissionWidget";
import { MilestoneCelebration } from "@/components/goals/MilestoneCelebration";
import { generateInsights, type Insight } from "@/lib/insights/engine";
import type { MoodPatternRow } from "@/lib/mood/client";
import type { GoalRow } from "@/lib/goals/client";
import { getStrugglePattern } from "@/lib/struggle/client";
import {
  OUTCOME_OPTIONS,
  TRIGGER_OPTIONS as ONBOARDING_TRIGGER_OPTIONS,
} from "@/lib/onboarding/options";
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Icons                                                                     */
/* -------------------------------------------------------------------------- */

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10-10-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

type ActiveHabit = {
  habit_id: string;
  name: string;
  dailyStatement: string;
  habitType: CommitmentHabitType;
  status: CommitmentStatus;
  streak: number;
};

/** Habits beyond this index render as compact rows. */
const FULL_CARD_LIMIT = 3;

type DashboardData = {
  displayName: string | null;
  habits: ActiveHabit[];
  lockdStreak: number;
  bestStreak: number;
  consistency: {
    active: number;
    success: number;
    pct: number | null;
  };
  impact: AggregatedImpact;
  risk: RiskAssessment;
  riskWindowSentence: string | null;
  onboardingFacts: {
    desiredOutcomes: string[];
    triggers: string[];
  };
  todayMood: { id: string; mood: MoodId; note: string | null } | null;
  recentConsistencyPct: number;
  insights: Insight[];
  activeGoal: GoalRow | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [savingHabit, setSavingHabit] = useState<string | null>(null);

  const logDate = useMemo(() => getActiveLogDate(), []);
  // Bumping this counter triggers a fresh fetch. Effects subscribe to
  // `refreshTick`; event handlers call `triggerRefresh()` to mutate it.
  const [refreshTick, setRefreshTick] = useState(0);
  const triggerRefresh = useCallback(
    () => setRefreshTick((n) => n + 1),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<DashboardData | "no-user" | null> {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return "no-user";
      const userId = userData.user.id;

      const since30 = subDays(logDate, 30);
      const since7 = subDays(logDate, 6);
      const [
        profileRes,
        habitsRes,
        todayLogsRes,
        consistencyRes,
        lockdRes,
        answersRes,
        failsRes,
        weekHistoryRes,
        responsesRes,
        todayMoodRes,
        moodPatternRes,
        activeGoalRes,
        strugglePattern,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("user_bad_habits")
          .select(
            "habit_id, created_at, bad_habits_master!inner(name, sort_order)",
          )
          .eq("user_id", userId)
          .eq("active", true)
          .order("created_at", { ascending: true }),
        supabase
          .from("habit_logs")
          .select("habit_id, status")
          .eq("user_id", userId)
          .eq("log_date", logDate),
        supabase.rpc("get_today_consistency", { p_today: logDate }),
        supabase.rpc("get_lockd_streak", { p_today: logDate }),
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
        supabase
          .from("onboarding_responses")
          .select("desired_outcomes, triggers")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("mood_logs")
          .select("id, mood, note")
          .eq("user_id", userId)
          .eq("log_date", logDate)
          .order("logged_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.rpc("get_mood_pattern", { p_days: 30 }),
        supabase.rpc("get_active_goal"),
        getStrugglePattern().catch(() => null),
      ]);

      const profile = profileRes.data;
      const habits = habitsRes.data ?? [];
      const todayLogs = todayLogsRes.data ?? [];
      const consistencyRow = consistencyRes.data?.[0] ?? null;
      const lockdRow = lockdRes.data?.[0] ?? null;

      const statusByHabit: Record<string, CommitmentStatus> = {};
      for (const log of todayLogs) {
        statusByHabit[log.habit_id] =
          log.status === "success" || log.status === "fail"
            ? (log.status as CommitmentStatus)
            : "pending";
      }

      const { data: streakRows } = await supabase.rpc(
        "get_individual_streaks",
        { p_today: logDate },
      );
      const streakByHabit: Record<string, number> = {};
      for (const row of streakRows ?? []) {
        streakByHabit[row.habit_id] = row.current_streak ?? 0;
      }

      type HabitJoin = {
        habit_id: string;
        bad_habits_master?: { name: string; sort_order: number } | null;
      };
      const enriched: ActiveHabit[] = habits
        .map((h) => {
          const joined = h as HabitJoin;
          return {
            habit_id: h.habit_id,
            name:
              joined.bad_habits_master?.name ?? getBadHabitName(h.habit_id),
            dailyStatement: getDailyStatement(h.habit_id),
            habitType: (getHabitType(h.habit_id) ?? "bad") as CommitmentHabitType,
            status: statusByHabit[h.habit_id] ?? "pending",
            streak: streakByHabit[h.habit_id] ?? 0,
            sortOrder: joined.bad_habits_master?.sort_order ?? 999,
          };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ sortOrder: _drop, ...rest }) => {
          void _drop;
          return rest;
        });

      // --- Impact: answers grouped by habit, days-since-added, fail counts.
      const answersByHabit: Record<string, AnswersByQuestion> = {};
      for (const row of answersRes.data ?? []) {
        const habit = row.habit_id;
        if (!answersByHabit[habit]) answersByHabit[habit] = {};
        answersByHabit[habit][row.question_id] = row.answer as AnswerValue;
      }

      const allFails = failsRes.data ?? [];
      const failsByHabit: Record<string, number> = {};
      for (const f of allFails) {
        // Count only fails from after the habit was added — bounded below.
        failsByHabit[f.habit_id] = (failsByHabit[f.habit_id] ?? 0) + 1;
      }

      const nowDate = new Date();
      const impactInputs: ImpactInput[] = habits.map((h) => {
        const habitAdded = new Date(h.created_at);
        const daysSinceAdded = Math.max(
          0,
          Math.floor(
            (nowDate.getTime() - habitAdded.getTime()) / 86400000,
          ) + 1,
        );
        const fails = failsByHabit[h.habit_id] ?? 0;
        return {
          habitId: h.habit_id,
          answers: answersByHabit[h.habit_id] ?? {},
          cleanDays: Math.max(0, daysSinceAdded - fails),
        };
      });
      const impact = aggregateImpact(impactInputs);

      // --- Risk: triggers from answers + recent fails + week consistency.
      const triggersByHabit: Record<string, string[]> = {};
      for (const h of habits) {
        const habitAnswers = answersByHabit[h.habit_id] ?? {};
        const triggerQ = getQuestionsForHabit(h.habit_id).find(
          (q) => q.metricKey === "triggers",
        );
        if (triggerQ) {
          const ans = habitAnswers[triggerQ.id] ?? triggerQ.defaultAnswer;
          if (Array.isArray(ans)) triggersByHabit[h.habit_id] = ans as string[];
        }
      }

      const recentFails: RecentFail[] = allFails.map((f) => {
        // Use the *log creation* hour as a proxy for "when the relapse was
        // recorded". It's not perfect (a 02:00 log under the 03:00 cutoff
        // represents yesterday) but acceptable for pattern detection.
        const created = f.created_at
          ? new Date(f.created_at as string)
          : null;
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

      // Onboarding-derived labels for Reality Mirror empty-state copy.
      const responses = responsesRes.data;
      const outcomeMap = new Map(OUTCOME_OPTIONS.map((o) => [o.id, o.label]));
      const triggerMap = new Map(
        ONBOARDING_TRIGGER_OPTIONS.map((o) => [o.id, o.label]),
      );
      const onboardingFacts = {
        desiredOutcomes: (responses?.desired_outcomes ?? [])
          .map((id) => outcomeMap.get(id))
          .filter((x): x is string => Boolean(x)),
        triggers: (responses?.triggers ?? [])
          .map((id) => triggerMap.get(id))
          .filter((x): x is string => Boolean(x)),
      };

      const moodPattern: MoodPatternRow[] = (moodPatternRes.data ?? []).map(
        (r) => ({
          logDate: r.log_date,
          mood: r.mood as MoodId,
          count: Number(r.count ?? 0),
        }),
      );
      const recentFailDates = allFails.map((f) => f.log_date);

      const activeGoalRow = (activeGoalRes.data as GoalRow[])?.[0] ?? null;
      const insights = generateInsights({
        risk,
        riskSentence: describeWindow(risk),
        impact,
        recentConsistencyPct,
        moodPattern,
        recentFailDates,
        activeMission: activeGoalRow
          ? {
              title: activeGoalRow.title,
              currentDay: activeGoalRow.current_day,
              durationDays: activeGoalRow.duration_days,
              statusLabel: null,
            }
          : null,
        activeHabitsCount: habits.length,
        strugglePattern,
      });

      return {
        displayName: profile?.display_name ?? null,
        habits: enriched,
        lockdStreak: lockdRow?.current_streak ?? 0,
        bestStreak: lockdRow?.best_streak ?? 0,
        consistency: {
          active: consistencyRow?.active ?? 0,
          success: consistencyRow?.success ?? 0,
          pct: consistencyRow?.pct ?? null,
        },
        impact,
        risk,
        riskWindowSentence: describeWindow(risk),
        onboardingFacts,
        todayMood: todayMoodRes.data
          ? {
              id: todayMoodRes.data.id,
              mood: todayMoodRes.data.mood as MoodId,
              note: todayMoodRes.data.note ?? null,
            }
          : null,
        recentConsistencyPct,
        insights,
        activeGoal: activeGoalRow,
      };
    }

    load().then((result) => {
      if (cancelled) return;
      if (result === "no-user") {
        router.replace("/login");
        return;
      }
      if (result) {
        setData(result);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [logDate, refreshTick, router]);

  const handleAction = useCallback(
    async (habitId: string, nextStatus: "success" | "fail") => {
      if (!data) return;
      const current = data.habits.find((h) => h.habit_id === habitId);
      if (!current) return;

      setSavingHabit(habitId);

      // Optimistic: figure out the new status. Tapping the active button = clear.
      const optimisticStatus: CommitmentStatus =
        current.status === nextStatus ? "pending" : nextStatus;

      setData((prev) =>
        prev
          ? {
              ...prev,
              habits: prev.habits.map((h) =>
                h.habit_id === habitId ? { ...h, status: optimisticStatus } : h,
              ),
            }
          : prev,
      );

      const supabase = getSupabaseClient();
      try {
        if (optimisticStatus === "pending") {
          const { error } = await supabase.rpc("clear_habit_log", {
            p_habit_id: habitId,
            p_log_date: logDate,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.rpc("log_habit", {
            p_habit_id: habitId,
            p_log_date: logDate,
            p_status: optimisticStatus,
          });
          if (error) throw error;
        }
        // Refresh derived metrics (streak + consistency) after a successful write.
        triggerRefresh();
      } catch (err) {
        console.error("[dashboard] log_habit failed:", err);
        // Revert optimistic update on failure.
        setData((prev) =>
          prev
            ? {
                ...prev,
                habits: prev.habits.map((h) =>
                  h.habit_id === habitId
                    ? { ...h, status: current.status }
                    : h,
                ),
              }
            : prev,
        );
      } finally {
        setSavingHabit(null);
      }
    },
    [data, logDate, triggerRefresh],
  );

  return (
    <AppShell
      header={
        <GreetingHeader
          name={data?.displayName ?? null}
          onProfile={() => router.push("/profiel")}
        />
      }
      bottomNav={
        <BottomNav
          items={NAV_ITEMS}
          activeId="vandaag"
          onSelect={(id) => {
            const dest = NAV_ROUTES[id];
            if (dest && dest !== "/dashboard") router.push(dest);
          }}
        />
      }
    >
      {!loaded || !data ? (
        <div
          role="status"
          aria-busy="true"
          aria-label="Dashboard laden"
          className="flex flex-col gap-4 pt-2"
        >
          <LoadingSkeleton height="h-44" />
          <LoadingSkeleton height="h-16" />
          <LoadingSkeleton height="h-64" />
        </div>
      ) : (
        <div className="lockd-stagger flex flex-col gap-5">
          {/* Above-the-fold focal trio: status + single action */}
          <div className="flex flex-col gap-4">
            <IdentityHeroCard
              lockdStreak={data.lockdStreak}
              bestStreak={data.bestStreak}
              activeCount={data.consistency.active}
              successCount={data.consistency.success}
              onOpenHistory={() => router.push("/geschiedenis")}
            />

            {data.habits.length > 0 && (
              <RiskCard
                risk={data.risk}
                windowSentence={data.riskWindowSentence}
              />
            )}

            <PrimaryInterventionCTA />
          </div>

          <section className="flex flex-col gap-3">
            <SectionHeader
              title="Wat je vandaag beschermt"
              action={
                <button
                  type="button"
                  onClick={() => router.push("/profiel")}
                  aria-label="Bewerk je gewoontes"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3",
                    "min-h-[44px] text-xs font-medium text-muted",
                    "transition-colors duration-150 hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70",
                  )}
                >
                  Bewerk
                  <PencilIcon />
                </button>
              }
            />
            {data.habits.length === 0 ? (
              <GlassCard tone="elevated" padding="md">
                <p className="text-sm text-muted">
                  Nog geen gewoontes geselecteerd. Open je profiel om er een
                  toe te voegen.
                </p>
              </GlassCard>
            ) : (
              <div className="flex flex-col gap-2">
                {data.habits.map((h, i) => (
                  <HabitCommitmentCard
                    key={h.habit_id}
                    name={h.name}
                    dailyStatement={h.dailyStatement}
                    habitType={h.habitType}
                    streakDays={h.streak}
                    status={h.status}
                    variant={i < FULL_CARD_LIMIT ? "full" : "compact"}
                    disabled={savingHabit === h.habit_id}
                    onSuccess={() => handleAction(h.habit_id, "success")}
                    onFail={() => handleAction(h.habit_id, "fail")}
                  />
                ))}
              </div>
            )}
          </section>

          <EmotionalCheckIn
            key={data.todayMood?.id ?? "fresh"}
            logDate={logDate}
            initialMood={data.todayMood}
          />

          {data.habits.length > 0 && (
            <ProofRail
              impact={data.impact}
              onOpenHistory={() => router.push("/geschiedenis")}
            />
          )}

          {data.activeGoal && (
            <MilestoneCelebration
              goalId={data.activeGoal.id}
              currentDay={data.activeGoal.current_day}
              durationDays={data.activeGoal.duration_days}
              title={data.activeGoal.title}
            />
          )}

          {data.activeGoal && <ActiveMissionWidget goal={data.activeGoal} />}

          <InnerCircleWidget />

          {data.insights.length > 0 && (
            <InsightsBlock insights={data.insights} />
          )}
        </div>
      )}
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Internal sections                                                         */
/* -------------------------------------------------------------------------- */

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Goedenacht";
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

function GreetingHeader({
  name,
  onProfile,
}: {
  name: string | null;
  onProfile?: () => void;
}) {
  const greeting = getTimeGreeting();
  return (
    <header className="flex items-start justify-between gap-3 pt-1">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
          {name ? `${greeting}, ${name}` : greeting}
        </h1>
        <p className="text-sm text-muted">Bescherm vandaag wie je aan het worden bent.</p>
      </div>

      <IconButton
        aria-label="Profiel"
        icon={<UserIcon />}
        variant="secondary"
        size="md"
        onClick={onProfile}
      />
    </header>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
        {title}
      </h2>
      {action}
    </div>
  );
}

