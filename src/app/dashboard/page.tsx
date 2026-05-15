"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  BottomNav,
  type BottomNavItem,
} from "@/components/navigation/BottomNav";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getBadHabitName } from "@/lib/badHabits/catalog";
import { getActiveLogDate, subDays } from "@/lib/badHabits/clientDate";
import { IdentityHeroCard } from "@/components/badHabits/IdentityHeroCard";
import {
  HabitCommitmentCard,
  type CommitmentStatus,
} from "@/components/badHabits/HabitCommitmentCard";
import { ImpactInsightGrid } from "@/components/badHabits/ImpactInsightGrid";
import { RiskCard } from "@/components/badHabits/RiskCard";
import {
  StreaksRail,
  type StreakEntry,
} from "@/components/badHabits/StreaksRail";
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
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Icons                                                                     */
/* -------------------------------------------------------------------------- */

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 0 1 12 0v3.5l1.6 2.7a.7.7 0 0 1-.6 1.1H5a.7.7 0 0 1-.6-1.1L6 12.5V9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 1 0 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15 5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h2M13 12h2"
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

function HomeNavIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11.5L12 5l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H14V15h-4v5.5H5.5A1.5 1.5 0 0 1 4 19v-7.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartNavIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 19V5M5 19h14M9 15v-3M13 15V9M17 15v-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NoteNavIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4h9l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 4v4h4M8 13h8M8 17h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileNavIcon() {
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

const NAV_ITEMS: ReadonlyArray<BottomNavItem> = [
  { id: "overview", label: "Overzicht", icon: <HomeNavIcon /> },
  { id: "stats", label: "Statistieken", icon: <ChartNavIcon /> },
  { id: "reflections", label: "Reflecties", icon: <NoteNavIcon /> },
  { id: "profile", label: "Profiel", icon: <ProfileNavIcon /> },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

type ActiveHabit = {
  habit_id: string;
  name: string;
  status: CommitmentStatus;
  streak: number;
};

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
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
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

      const streakPromises = habits.map((h) =>
        supabase.rpc("get_individual_streak", {
          p_habit_id: h.habit_id,
          p_today: logDate,
        }),
      );
      const streakResults = await Promise.all(streakPromises);
      const streakByHabit: Record<string, number> = {};
      habits.forEach((h, i) => {
        const row = streakResults[i].data?.[0];
        streakByHabit[h.habit_id] = row?.current_streak ?? 0;
      });

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
          hasUnread={false}
          onProfile={() => router.push("/profiel")}
        />
      }
      bottomNav={
        <BottomNav
          items={NAV_ITEMS}
          activeId={activeTab}
          onSelect={(id) => {
            setActiveTab(id);
            if (id === "profile") router.push("/profiel");
            if (id === "stats") router.push("/geschiedenis");
          }}
        />
      }
    >
      {!loaded || !data ? (
        <div className="flex flex-col gap-4 pt-2">
          <LoadingSkeleton height="h-44" />
          <LoadingSkeleton height="h-16" />
          <LoadingSkeleton height="h-64" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <IdentityHeroCard
            lockdStreak={data.lockdStreak}
            bestStreak={data.bestStreak}
            activeCount={data.consistency.active}
            successCount={data.consistency.success}
            pct={data.consistency.pct}
            onOpenHistory={() => router.push("/geschiedenis")}
          />

          {data.habits.length > 0 && (
            <RiskCard
              risk={data.risk}
              windowSentence={data.riskWindowSentence}
            />
          )}

          <StruggleCallout />

          <section className="flex flex-col gap-3">
            <SectionHeader
              title="Vandaag jouw standaarden"
              action={
                <button
                  type="button"
                  onClick={() => router.push("/profiel")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-1",
                    "text-xs font-medium text-muted",
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
                  Nog geen eigenschappen geselecteerd. Open je profiel om
                  gewoontes te kiezen.
                </p>
              </GlassCard>
            ) : (
              <div className="flex flex-col gap-2">
                {data.habits.map((h) => (
                  <HabitCommitmentCard
                    key={h.habit_id}
                    name={h.name}
                    streakDays={h.streak}
                    status={h.status}
                    disabled={savingHabit === h.habit_id}
                    onSuccess={() => handleAction(h.habit_id, "success")}
                    onFail={() => handleAction(h.habit_id, "fail")}
                  />
                ))}
              </div>
            )}
          </section>

          {data.habits.length > 0 && (
            <ImpactInsightGrid
              impact={data.impact}
              riskWindow={data.risk.windowLabel}
              onOpenHistory={() => router.push("/geschiedenis")}
            />
          )}

          {data.habits.length > 0 && (
            <StreaksRail
              streaks={data.habits.map<StreakEntry>((h) => ({
                habitId: h.habit_id,
                name: h.name,
                days: h.streak,
              }))}
            />
          )}

          {data.habits.length > 0 && (
            <button
              type="button"
              onClick={() => router.push("/geschiedenis")}
              className={cn(
                "group flex items-center justify-between rounded-[var(--radius-md)]",
                "border border-[var(--color-border)] bg-surface/60 px-4 py-3.5",
                "text-left transition-colors duration-200",
                "hover:border-[var(--color-border-strong)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
              )}
            >
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Geschiedenis
                </span>
                <span className="text-[11px] text-muted">
                  Bekijk elke dag dat je stand hield.
                </span>
              </span>
              <span className="text-purple-bright">
                <ArrowRight />
              </span>
            </button>
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
  hasUnread,
  onProfile,
}: {
  name: string | null;
  hasUnread?: boolean;
  onProfile?: () => void;
}) {
  const greeting = getTimeGreeting();
  return (
    <header className="flex items-start justify-between gap-3 pt-1">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {name ? `${greeting}, ${name}` : greeting}
        </h1>
        <p className="text-sm text-muted">Hou je standaarden vandaag.</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <IconButton
            aria-label="Meldingen"
            icon={<BellIcon />}
            variant="secondary"
            size="md"
          />
          {hasUnread && (
            <span
              aria-hidden
              className={cn(
                "absolute right-1 top-1 h-2.5 w-2.5 rounded-full",
                "bg-purple-bright shadow-[0_0_10px_-2px_var(--color-purple-glow)]",
                "ring-2 ring-background",
              )}
            />
          )}
        </div>
        <IconButton
          aria-label="Profiel"
          icon={<UserIcon />}
          variant="secondary"
          size="md"
          onClick={onProfile}
        />
      </div>
    </header>
  );
}

function StruggleCallout() {
  return (
    <GlassCard padding="sm">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center",
            "rounded-[var(--radius-sm)]",
            "bg-purple/15 text-purple-bright",
            "[&_svg]:h-5 [&_svg]:w-5",
          )}
        >
          <BrainIcon />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            Het even moeilijk met iets?
          </span>
          <span className="text-xs text-muted">
            Praat erover voordat je toegeeft.
          </span>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5",
            "rounded-full border border-purple/40 bg-purple/10 px-3.5 py-2",
            "text-xs font-semibold text-purple-bright",
            "transition-all duration-200 active:scale-[0.97]",
            "hover:border-purple/70 hover:bg-purple/20",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          Ik struggle nu
          <ArrowRight />
        </button>
      </div>
    </GlassCard>
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
