"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { BottomNav } from "@/components/navigation/BottomNav";
import { NAV_ITEMS, NAV_ROUTES } from "@/components/navigation/navItems";
import { ReflectionCard } from "@/components/ui/ReflectionCard";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { MoodId } from "@/lib/mood/options";
import { cn } from "@/lib/utils/cn";

import { ReflectionStatsHero } from "@/components/reflectie/ReflectionStatsHero";
import { ReflectionWriter } from "@/components/reflectie/ReflectionWriter";
import {
  ReflectionFilterChips,
  type FilterValue,
} from "@/components/reflectie/ReflectionFilterChips";
import { RecallCard } from "@/components/reflectie/RecallCard";
import { ThemeCloud } from "@/components/reflectie/ThemeCloud";
import { ReflectionDetailSheet } from "@/components/reflectie/ReflectionDetailSheet";
import {
  computeReflectionStreak,
  findRecall,
  groupByDate,
  topTags,
  topTheme,
  type ReflectionEntry,
} from "@/lib/reflectie/helpers";

function formatDutchDate(iso: string): string {
  const dt = new Date(iso);
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const dtStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  if (todayStr === dtStr) return "Vandaag";
  return dt.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
  });
}

const RESULT_LABEL: Record<string, string> = {
  achieved: "behaald",
  partially_achieved: "gedeeltelijk",
  not_achieved: "niet behaald",
};

const KIND_PROMPT: Record<ReflectionEntry["kind"], string> = {
  open: "Vrije reflectie",
  missie: "Missie afgerond",
  struggle: "Struggle moment",
  mood: "Stemming",
};

const MOOD_LABEL: Record<string, string> = {
  prima: "Prima",
  gestrest: "Gestrest",
  moe: "Moe",
  geirriteerd: "Geïrriteerd",
  somber: "Somber",
};

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="h-4 w-4"
    >
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ReflectiePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [writerOpen, setWriterOpen] = useState(false);
  const [savingWrite, setSavingWrite] = useState(false);
  const [detail, setDetail] = useState<ReflectionEntry | null>(null);

  const load = useCallback(async (): Promise<ReflectionEntry[] | "no-user"> => {
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return "no-user";
    const userId = userData.user.id;

    const [openRes, goalReflRes, struggleRes, moodNotesRes] = await Promise.all([
      supabase
        .from("reflections")
        .select("id, body, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("goal_reflections")
        .select(
          "id, result, reflection_text, what_helped, what_made_it_hard, feeling, next_recommendation, created_at, goal_id, goals!inner(title)",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("struggle_sessions")
        .select(
          "id, reflection_text, reflection_tags, created_at, protected_habit_name, urge_score_before, urge_score_after",
        )
        .eq("user_id", userId)
        .not("reflection_text", "is", null)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("mood_logs")
        .select("id, mood, note, logged_at")
        .eq("user_id", userId)
        .not("note", "is", null)
        .order("logged_at", { ascending: false })
        .limit(100),
    ]);

    const open: ReflectionEntry[] = (openRes.data ?? []).map((r) => ({
      id: r.id,
      kind: "open" as const,
      body: r.body,
      createdAt: r.created_at,
      goalTitle: null,
      result: null,
      tags: [],
    }));

    type GoalReflJoin = {
      id: string;
      result: string;
      reflection_text: string | null;
      what_helped: string[] | null;
      what_made_it_hard: string[] | null;
      feeling: string | null;
      next_recommendation: string | null;
      created_at: string;
      goal_id: string;
      goals?: { title: string } | null;
    };
    const missions: ReflectionEntry[] = (
      (goalReflRes.data ?? []) as GoalReflJoin[]
    ).map((r) => {
      const parts: string[] = [];
      if (r.reflection_text) parts.push(r.reflection_text);
      if (r.feeling) parts.push(`Gevoel: ${r.feeling}`);
      if (r.next_recommendation)
        parts.push(`Aanbeveling: ${r.next_recommendation}`);
      const body = parts.join("\n\n") || "—";
      const tags: string[] = [];
      if (r.goals?.title) tags.push(r.goals.title);
      if (r.result && RESULT_LABEL[r.result]) tags.push(RESULT_LABEL[r.result]);
      for (const h of r.what_helped ?? []) tags.push(h);
      return {
        id: r.id,
        kind: "missie" as const,
        body,
        createdAt: r.created_at,
        goalTitle: r.goals?.title ?? "Missie",
        result: r.result,
        tags,
      };
    });

    type StruggleRefl = {
      id: string;
      reflection_text: string | null;
      reflection_tags: string[] | null;
      created_at: string;
      protected_habit_name: string | null;
      urge_score_before: number | null;
      urge_score_after: number | null;
    };
    const struggles: ReflectionEntry[] = (
      (struggleRes.data ?? []) as StruggleRefl[]
    )
      .filter((r) => r.reflection_text && r.reflection_text.trim().length > 0)
      .map((r) => {
        const tags: string[] = [];
        if (r.protected_habit_name) tags.push(r.protected_habit_name);
        for (const t of r.reflection_tags ?? []) tags.push(t);
        return {
          id: r.id,
          kind: "struggle" as const,
          body: r.reflection_text ?? "",
          createdAt: r.created_at,
          goalTitle: r.protected_habit_name,
          result:
            r.urge_score_before !== null && r.urge_score_after !== null
              ? `${r.urge_score_before} → ${r.urge_score_after}`
              : null,
          tags,
          urgeBefore: r.urge_score_before,
          urgeAfter: r.urge_score_after,
        };
      });

    type MoodRow = {
      id: string;
      mood: string;
      note: string | null;
      logged_at: string;
    };
    const moods: ReflectionEntry[] = (
      (moodNotesRes.data ?? []) as MoodRow[]
    )
      .filter((r) => r.note && r.note.trim().length > 0)
      .map((r) => ({
        id: r.id,
        kind: "mood" as const,
        body: r.note ?? "",
        createdAt: r.logged_at,
        goalTitle: MOOD_LABEL[r.mood] ?? r.mood,
        result: null,
        tags: [],
        moodId: r.mood as MoodId,
      }));

    return [...open, ...missions, ...struggles, ...moods].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await load();
      if (cancelled) return;
      if (result === "no-user") {
        router.replace("/login");
        return;
      }
      setEntries(result);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [load, router]);

  const counts = useMemo(() => {
    const c: Partial<Record<FilterValue, number>> = { all: entries.length };
    for (const e of entries) {
      c[e.kind] = (c[e.kind] ?? 0) + 1;
    }
    return c;
  }, [entries]);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.kind === filter)),
    [entries, filter],
  );

  const buckets = useMemo(() => groupByDate(filtered), [filtered]);
  const streak = useMemo(() => computeReflectionStreak(entries), [entries]);
  const theme = useMemo(() => topTheme(entries), [entries]);
  const recall = useMemo(() => findRecall(entries), [entries]);
  const themeTags = useMemo(() => topTags(entries, 5), [entries]);

  async function handleSaveWrite(body: string) {
    setSavingWrite(true);
    try {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      const { error } = await supabase.from("reflections").insert({
        user_id: userData.user.id,
        body,
      });
      if (error) throw error;
      // Reload to pick up the new entry.
      const fresh = await load();
      if (fresh !== "no-user") setEntries(fresh);
      setWriterOpen(false);
    } catch (err) {
      console.error("[reflectie] insert failed:", err);
      // Keep the writer open on failure so user doesn't lose their text.
    } finally {
      setSavingWrite(false);
    }
  }

  return (
    <AppShell
      header={
        <header className="flex items-center justify-between gap-3 pt-1">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
              Reflectie
            </h1>
            <p className="text-sm text-muted">
              Niet voor anderen. Voor jezelf.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWriterOpen(true)}
            aria-label="Schrijf een reflectie"
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full",
              "border border-purple/45 bg-purple/15 px-3 py-2",
              "text-[12px] font-semibold text-purple-bright",
              "transition-colors duration-150",
              "hover:bg-purple/25 hover:border-purple/60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            <PlusIcon />
            Schrijf
          </button>
        </header>
      }
      bottomNav={
        <BottomNav
          items={NAV_ITEMS}
          activeId="reflectie"
          onSelect={(id) => {
            const dest = NAV_ROUTES[id];
            if (dest && dest !== "/reflectie") router.push(dest);
          }}
        />
      }
    >
      {!loaded ? (
        <div className="flex flex-col gap-4 pt-2">
          <LoadingSkeleton height="h-40" />
          <LoadingSkeleton height="h-12" />
          <LoadingSkeleton height="h-24" />
          <LoadingSkeleton height="h-24" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col gap-4">
          <ReflectionStatsHero total={0} streak={0} topTheme={null} />
          <GlassCard padding="md">
            <p className="text-sm text-muted">
              Reflecties verschijnen hier zodra je iets schrijft, een
              struggle-moment afsluit, een missie afrondt, of een stemming-note
              maakt op het dashboard.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setWriterOpen(true)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full",
                  "border border-purple/45 bg-purple/15 px-4 py-2",
                  "text-sm font-semibold text-purple-bright",
                  "transition-colors duration-150 hover:bg-purple/25",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                )}
              >
                <PlusIcon />
                Schrijf nu
              </button>
            </div>
          </GlassCard>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <ReflectionStatsHero
            total={entries.length}
            streak={streak}
            topTheme={theme}
          />

          {recall && (
            <RecallCard
              entry={recall}
              onClick={() => setDetail(recall)}
            />
          )}

          {themeTags.length > 0 && <ThemeCloud tags={themeTags} />}

          <div className="flex flex-col gap-3">
            <ReflectionFilterChips
              value={filter}
              counts={counts}
              onChange={setFilter}
            />

            {filtered.length === 0 ? (
              <GlassCard padding="md">
                <p className="text-sm text-muted">
                  Geen reflecties in deze filter.
                </p>
              </GlassCard>
            ) : (
              buckets
                .filter((b) => b.entries.length > 0)
                .map((bucket) => (
                  <section key={bucket.label} className="flex flex-col gap-2">
                    <h2 className="px-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-muted/70">
                      {bucket.label}
                    </h2>
                    <div className="flex flex-col gap-3">
                      {bucket.entries.map((e) => {
                        const tags: string[] = [];
                        if (e.kind === "missie") {
                          if (e.goalTitle) tags.push(e.goalTitle);
                          if (e.result && RESULT_LABEL[e.result])
                            tags.push(RESULT_LABEL[e.result]);
                        } else if (e.kind === "struggle") {
                          if (e.goalTitle) tags.push(e.goalTitle);
                          if (e.result) tags.push(`Drang ${e.result}`);
                          for (const t of e.tags ?? []) {
                            if (t !== e.goalTitle) tags.push(t);
                          }
                        }
                        return (
                          <ReflectionCard
                            key={`${e.kind}-${e.id}`}
                            date={formatDutchDate(e.createdAt)}
                            moodId={e.moodId}
                            prompt={KIND_PROMPT[e.kind]}
                            excerpt={e.body}
                            tags={tags}
                            onClick={() => setDetail(e)}
                          />
                        );
                      })}
                    </div>
                  </section>
                ))
            )}
          </div>
        </div>
      )}

      {writerOpen && (
        <ReflectionWriter
          saving={savingWrite}
          onClose={() => !savingWrite && setWriterOpen(false)}
          onSave={handleSaveWrite}
        />
      )}

      {detail && (
        <ReflectionDetailSheet
          entry={detail}
          onClose={() => setDetail(null)}
        />
      )}
    </AppShell>
  );
}
