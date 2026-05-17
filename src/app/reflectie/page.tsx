"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { BottomNav } from "@/components/navigation/BottomNav";
import { NAV_ITEMS, NAV_ROUTES } from "@/components/navigation/navItems";
import { ReflectionCard } from "@/components/ui/ReflectionCard";
import { getSupabaseClient } from "@/lib/supabase/client";

type ReflectionEntry = {
  id: string;
  kind: "open" | "missie" | "struggle";
  body: string;
  createdAt: string;
  goalTitle: string | null;
  result: string | null;
  tags?: string[];
};

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

export default function ReflectiePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

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

      const [openRes, goalReflRes, struggleRes] = await Promise.all([
        supabase
          .from("reflections")
          .select("id, body, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("goal_reflections")
          .select(
            "id, result, reflection_text, what_helped, what_made_it_hard, feeling, next_recommendation, created_at, goal_id, goals!inner(title)",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("struggle_sessions")
          .select("id, reflection_text, reflection_tags, created_at, protected_habit_name, urge_score_before, urge_score_after")
          .eq("user_id", userId)
          .not("reflection_text", "is", null)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      if (cancelled) return;

      const open: ReflectionEntry[] = (openRes.data ?? []).map((r) => ({
        id: r.id,
        kind: "open" as const,
        body: r.body,
        createdAt: r.created_at,
        goalTitle: null,
        result: null,
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
        return {
          id: r.id,
          kind: "missie" as const,
          body,
          createdAt: r.created_at,
          goalTitle: r.goals?.title ?? "Missie",
          result: r.result,
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
        .map((r) => ({
          id: r.id,
          kind: "struggle" as const,
          body: r.reflection_text ?? "",
          createdAt: r.created_at,
          goalTitle: r.protected_habit_name,
          result:
            r.urge_score_before !== null && r.urge_score_after !== null
              ? `${r.urge_score_before} → ${r.urge_score_after}`
              : null,
          tags: r.reflection_tags ?? [],
        }));

      const merged = [...open, ...missions, ...struggles].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );

      setEntries(merged);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <AppShell
      header={
        <header className="flex items-center justify-between gap-3 pt-1">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
              Reflectie
            </h1>
            <p className="text-sm text-muted">
              Niet voor anderen. Voor jezelf.
            </p>
          </div>
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
        <div className="flex flex-col gap-3 pt-2">
          <LoadingSkeleton height="h-24" />
          <LoadingSkeleton height="h-24" />
          <LoadingSkeleton height="h-24" />
        </div>
      ) : entries.length === 0 ? (
        <GlassCard padding="md">
          <p className="text-sm text-muted">
            Reflecties verschijnen hier nadat je een struggle-moment of een
            missie afsluit.
          </p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((e) => {
            const tags: string[] = [];
            if (e.kind === "missie") {
              if (e.goalTitle) tags.push(e.goalTitle);
              if (e.result && RESULT_LABEL[e.result])
                tags.push(RESULT_LABEL[e.result]);
            } else if (e.kind === "struggle") {
              if (e.goalTitle) tags.push(e.goalTitle);
              if (e.result) tags.push(`Drang ${e.result}`);
              for (const t of e.tags ?? []) tags.push(t);
            }
            const prompt =
              e.kind === "missie"
                ? "Missie afgerond"
                : e.kind === "struggle"
                  ? "Struggle moment"
                  : "Reflectie";
            return (
              <ReflectionCard
                key={`${e.kind}-${e.id}`}
                date={formatDutchDate(e.createdAt)}
                prompt={prompt}
                excerpt={e.body}
                tags={tags}
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
