"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  ConsistencyHeatmap,
  type HeatmapCell,
} from "@/components/badHabits/ConsistencyHeatmap";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  formatLocalDate,
  getLocalToday,
  subDays,
} from "@/lib/badHabits/clientDate";
import type { AnswerValue, AnswersByQuestion } from "@/lib/badHabits/questions";
import {
  aggregateImpact,
  formatHours,
  formatKcal,
  formatMoney,
  type AggregatedImpact,
  type ImpactInput,
} from "@/lib/badHabits/impact";
import { cn } from "@/lib/utils/cn";

const RANGE_DAYS = 91; // ~13 weeks

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

function CloseGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M3 8.5l3.2 3.2L13 4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DashGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M4 8h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

type HistoryData = {
  cells: HeatmapCell[];
  lockdStreak: number;
  bestStreak: number;
  successRate: number; // 0..100 over the visible window
  totalDays: number;
  month: {
    label: string;
    impact: AggregatedImpact;
    consistencyPct: number;
    daysCounted: number;
  };
};

type DayDetailEntry = {
  habit_id: string;
  name: string;
  status: "success" | "fail" | "pending";
};

type DayDetail = {
  date: string;
  pct: number | null;
  entries: DayDetailEntry[];
};

function formatDutchDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function GeschiedenisPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<HistoryData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const today = useMemo(() => getLocalToday(), []);
  const fromDate = useMemo(() => subDays(today, RANGE_DAYS - 1), [today]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }

      // Month boundary: 1st of current month (local).
      const now = new Date();
      const monthStart = formatLocalDate(
        new Date(now.getFullYear(), now.getMonth(), 1),
      );
      const monthLabel = now.toLocaleDateString("nl-NL", {
        month: "long",
        year: "numeric",
      });

      const [historyRes, lockdRes, habitsRes, answersRes, monthFailsRes] =
        await Promise.all([
          supabase.rpc("get_consistency_history", {
            p_from: fromDate,
            p_to: today,
          }),
          supabase.rpc("get_lockd_streak", { p_today: today }),
          supabase
            .from("user_bad_habits")
            .select("habit_id, created_at")
            .eq("user_id", userData.user.id)
            .eq("active", true),
          supabase
            .from("user_habit_answers")
            .select("habit_id, question_id, answer")
            .eq("user_id", userData.user.id),
          supabase
            .from("habit_logs")
            .select("habit_id, log_date, status")
            .eq("user_id", userData.user.id)
            .eq("status", "fail")
            .gte("log_date", monthStart),
        ]);
      if (cancelled) return;

      const rows = historyRes.data ?? [];
      const cellsByDate = new Map<string, HeatmapCell>();
      for (const row of rows) {
        cellsByDate.set(row.d, {
          date: row.d,
          pct: row.pct,
          active: row.active,
        });
      }

      // Build a contiguous list of all dates in range so the grid is dense.
      const cells: HeatmapCell[] = [];
      for (let i = 0; i < RANGE_DAYS; i++) {
        const d = subDays(today, RANGE_DAYS - 1 - i);
        const existing = cellsByDate.get(d);
        cells.push(
          existing ?? { date: d, pct: null, active: 0 },
        );
      }

      const lockd = lockdRes.data?.[0] ?? null;
      const usableDays = cells.filter((c) => c.pct !== null);
      const success = usableDays.filter((c) => (c.pct ?? 0) >= 80).length;
      const rate =
        usableDays.length === 0
          ? 0
          : Math.round((100 * success) / usableDays.length);

      // --- Monthly impact aggregation
      const habits = habitsRes.data ?? [];
      const answersByHabit: Record<string, AnswersByQuestion> = {};
      for (const row of answersRes.data ?? []) {
        const habit = row.habit_id;
        if (!answersByHabit[habit]) answersByHabit[habit] = {};
        answersByHabit[habit][row.question_id] = row.answer as AnswerValue;
      }
      const monthFails = monthFailsRes.data ?? [];
      const failsByHabit: Record<string, number> = {};
      for (const f of monthFails) {
        failsByHabit[f.habit_id] = (failsByHabit[f.habit_id] ?? 0) + 1;
      }
      const monthStartDate = new Date(monthStart);
      const todayDate = new Date(today);
      const monthDays =
        Math.floor(
          (todayDate.getTime() - monthStartDate.getTime()) / 86400000,
        ) + 1;
      const impactInputs: ImpactInput[] = habits.map((h) => {
        const added = new Date(h.created_at);
        const effectiveStart = added > monthStartDate ? added : monthStartDate;
        const days =
          Math.floor(
            (todayDate.getTime() - effectiveStart.getTime()) / 86400000,
          ) + 1;
        const fails = failsByHabit[h.habit_id] ?? 0;
        return {
          habitId: h.habit_id,
          answers: answersByHabit[h.habit_id] ?? {},
          cleanDays: Math.max(0, days - fails),
        };
      });
      const monthImpact = aggregateImpact(impactInputs);

      // Consistency % for the month — average of pct over days with active habits.
      const monthCells = rows.filter((r) => r.d >= monthStart);
      const usableMonth = monthCells.filter((r) => r.pct !== null);
      const monthPct =
        usableMonth.length === 0
          ? 0
          : Math.round(
              usableMonth.reduce((s, r) => s + (r.pct ?? 0), 0) /
                usableMonth.length,
            );

      setData({
        cells,
        lockdStreak: lockd?.current_streak ?? 0,
        bestStreak: lockd?.best_streak ?? 0,
        successRate: rate,
        totalDays: usableDays.length,
        month: {
          label: monthLabel,
          impact: monthImpact,
          consistencyPct: monthPct,
          daysCounted: monthDays,
        },
      });
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [fromDate, today, router]);

  const openDetail = useCallback(async (date: string) => {
    setSelectedDate(date);
    setDetail(null);
    setDetailLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: rows, error } = await supabase.rpc("get_day_detail", {
        p_day: date,
      });
      if (error) throw error;
      const entries: DayDetailEntry[] = (rows ?? []).map((r) => ({
        habit_id: r.habit_id,
        name: r.name,
        status:
          r.status === "success" || r.status === "fail" ? r.status : "pending",
      }));
      const active = entries.length;
      const successCount = entries.filter((e) => e.status === "success").length;
      const pct = active === 0 ? null : Math.round((100 * successCount) / active);
      setDetail({ date, pct, entries });
    } catch (err) {
      console.error("[history] day detail failed:", err);
      setDetail({ date, pct: null, entries: [] });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = () => {
    setSelectedDate(null);
    setDetail(null);
  };

  return (
    <AppShell
      header={
        <header className="flex items-center justify-between gap-3 pt-1">
          <IconButton
            aria-label="Terug"
            icon={<BackArrow />}
            variant="secondary"
            size="md"
            onClick={() => router.back()}
          />
          <div className="flex min-w-0 flex-1 flex-col text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              Geschiedenis
            </span>
            <h1 className="truncate text-base font-semibold text-foreground">
              Jouw consistentie
            </h1>
          </div>
          <span className="h-10 w-10" aria-hidden />
        </header>
      }
    >
      {!loaded || !data ? (
        <div className="flex flex-col gap-4 pt-2">
          <LoadingSkeleton height="h-28" />
          <LoadingSkeleton height="h-72" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 pb-8">
          <MonthlyImpactCard
            label={data.month.label}
            impact={data.month.impact}
            consistencyPct={data.month.consistencyPct}
            daysCounted={data.month.daysCounted}
          />

          <SummaryCard
            lockdStreak={data.lockdStreak}
            bestStreak={data.bestStreak}
            successRate={data.successRate}
            totalDays={data.totalDays}
          />

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
                Laatste 13 weken
              </h2>
              <Legend />
            </div>
            <GlassCard padding="md">
              <ConsistencyHeatmap
                cells={data.cells}
                selectedDate={selectedDate}
                onSelect={openDetail}
              />
            </GlassCard>
          </section>

          {data.totalDays === 0 && (
            <GlassCard tone="elevated" padding="md">
              <p className="text-sm text-muted">
                Begin met loggen op het dashboard om je geschiedenis te zien.
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {selectedDate && (
        <DayDetailSheet
          loading={detailLoading}
          detail={detail}
          dateLabel={formatDutchDate(selectedDate)}
          onClose={closeDetail}
        />
      )}
    </AppShell>
  );
}

function MonthlyImpactCard({
  label,
  impact,
  consistencyPct,
  daysCounted,
}: {
  label: string;
  impact: AggregatedImpact;
  consistencyPct: number;
  daysCounted: number;
}) {
  const hasImpact = impact.money > 0 || impact.hours > 0 || impact.kcal > 0;
  return (
    <GlassCard tone="purple" glow="soft" padding="md">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Deze maand
        </span>
        <span className="text-[11px] capitalize text-muted">{label}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
        <ImpactStat
          label="Consistent"
          value={`${consistencyPct}%`}
          sub={`${daysCounted}d gemeten`}
        />
        {impact.money > 0 && (
          <ImpactStat label="Bespaard" value={formatMoney(impact.money)} />
        )}
        {impact.hours > 0 && (
          <ImpactStat
            label="Teruggewonnen"
            value={formatHours(impact.hours)}
          />
        )}
        {impact.kcal > 0 && (
          <ImpactStat label="Kcal vermeden" value={formatKcal(impact.kcal)} />
        )}
      </div>
      {!hasImpact && (
        <p className="mt-3 text-[11px] text-muted">
          Voeg vragen toe in je profiel om je impact zichtbaar te maken.
        </p>
      )}
    </GlassCard>
  );
}

function ImpactStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
        {label}
      </span>
      <span className="text-xl font-semibold leading-none tabular-nums text-foreground">
        {value}
      </span>
      {sub && <span className="text-[10px] text-muted">{sub}</span>}
    </div>
  );
}

function SummaryCard({
  lockdStreak,
  bestStreak,
  successRate,
  totalDays,
}: {
  lockdStreak: number;
  bestStreak: number;
  successRate: number;
  totalDays: number;
}) {
  return (
    <GlassCard tone="purple" glow="soft" padding="md">
      <div className="grid grid-cols-3 gap-3">
        <SummaryStat label="Huidig" value={lockdStreak} suffix="dagen" />
        <SummaryStat label="Beste" value={bestStreak} suffix="dagen" />
        <SummaryStat
          label="Succes"
          value={successRate}
          suffix={`% · ${totalDays}d`}
        />
      </div>
    </GlassCard>
  );
}

function SummaryStat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
        {label}
      </span>
      <span className="text-2xl font-semibold leading-none tabular-nums text-foreground">
        {value}
      </span>
      <span className="text-[11px] text-muted">{suffix}</span>
    </div>
  );
}

function Legend() {
  const items: Array<{ cls: string; label: string }> = [
    { cls: "bg-surface-elevated/60 border border-[var(--color-border)]", label: "Geen" },
    { cls: "bg-danger/25 border border-danger/30", label: "Zwak" },
    { cls: "bg-warning/25 border border-warning/30", label: "Mid" },
    { cls: "bg-success/25 border border-success/30", label: "Sterk" },
  ];
  return (
    <div className="flex items-center gap-2">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1">
          <span className={cn("h-2.5 w-2.5 rounded-[3px]", it.cls)} />
          <span className="text-[10px] text-muted">{it.label}</span>
        </span>
      ))}
    </div>
  );
}

function DayDetailSheet({
  loading,
  detail,
  dateLabel,
  onClose,
}: {
  loading: boolean;
  detail: DayDetail | null;
  dateLabel: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail ${dateLabel}`}
    >
      <button
        type="button"
        aria-label="Sluit detail"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative w-full max-w-[430px]",
          "rounded-t-[var(--radius-lg)] border-t border-[var(--color-border-strong)]",
          "bg-surface px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3",
          "shadow-[0_-20px_60px_-20px_rgba(139,92,246,0.35)]",
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--color-border-strong)]" />
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              {detail?.pct !== null && detail?.pct !== undefined
                ? `${detail.pct}% consistent`
                : "Geen data"}
            </span>
            <h2 className="text-lg font-semibold capitalize text-foreground">
              {dateLabel}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Sluit"
            onClick={onClose}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              "bg-surface-elevated text-muted",
              "hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            <CloseGlyph />
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col gap-2">
              <LoadingSkeleton height="h-10" />
              <LoadingSkeleton height="h-10" />
              <LoadingSkeleton height="h-10" />
            </div>
          ) : !detail || detail.entries.length === 0 ? (
            <p className="text-sm text-muted">
              Geen gewoontes actief op deze dag.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--color-border)]">
              {detail.entries.map((e) => (
                <li
                  key={e.habit_id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground">
                    {e.name}
                  </span>
                  <StatusGlyph status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusGlyph({ status }: { status: "success" | "fail" | "pending" }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-[11px] font-semibold text-success">
        <CheckGlyph />
        Sterk
      </span>
    );
  }
  if (status === "fail") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/12 px-2.5 py-1 text-[11px] font-semibold text-danger">
        <CrossGlyph />
        Terugval
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-muted">
      <DashGlyph />
      Niet gelogd
    </span>
  );
}
