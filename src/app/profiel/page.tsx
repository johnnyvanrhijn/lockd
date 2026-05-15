"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  BottomNav,
  type BottomNavItem,
} from "@/components/navigation/BottomNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { IconButton } from "@/components/ui/IconButton";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { SummarySection } from "@/components/onboarding/SummarySection";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  HABIT_OPTIONS,
  OUTCOME_OPTIONS,
  TIME_OPTIONS,
  SITUATION_OPTIONS,
  TRIGGER_OPTIONS,
  TONE_OPTIONS,
  SUPPORT_OPTIONS,
} from "@/lib/onboarding/options";
import { HabitAssumptionsSheet } from "@/components/badHabits/HabitAssumptionsSheet";
import { getBadHabitName } from "@/lib/badHabits/catalog";
import {
  type AnswerValue,
  type AnswersByQuestion,
  getQuestionsForHabit,
  resolveSingleValue,
} from "@/lib/badHabits/questions";
import { describeAssumptions } from "@/lib/badHabits/impact";
import { cn } from "@/lib/utils/cn";

function HomeIcon() {
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
function ChartIcon() {
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
function NoteIcon() {
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
function ProfileIcon() {
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
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_ITEMS: ReadonlyArray<BottomNavItem> = [
  { id: "overview", label: "Overzicht", icon: <HomeIcon /> },
  { id: "stats", label: "Statistieken", icon: <ChartIcon /> },
  { id: "reflections", label: "Reflecties", icon: <NoteIcon /> },
  { id: "profile", label: "Profiel", icon: <ProfileIcon /> },
];

type Profile = {
  display_name: string | null;
  email: string;
  onboarded_at: string | null;
  created_at: string;
};

type Responses = {
  focus_habits: string[];
  desired_outcomes: string[];
  risk_times: string[];
  risk_situations: string[];
  triggers: string[];
  tone_of_voice: string;
  support_modes: string[];
  active_intervention: boolean;
  accountability_mode: string;
};

function labelsFor(
  ids: string[],
  options: ReadonlyArray<{ id: string; label: string }>,
): string {
  if (!ids || ids.length === 0) return "Niet geselecteerd";
  const map = new Map(options.map((o) => [o.id, o.label]));
  return ids.map((id) => map.get(id) ?? id).join(" · ");
}

function formatSince(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [responses, setResponses] = useState<Responses | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  /** Active bad-habit assumptions: habit_id → answers map. */
  const [habitAnswers, setHabitAnswers] = useState<
    Record<string, AnswersByQuestion>
  >({});
  const [activeHabits, setActiveHabits] = useState<string[]>([]);
  /** When set, the assumption-edit sheet is open for this habit. */
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [savingHabit, setSavingHabit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      const [profileRes, responsesRes, habitsRes, answersRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, email, onboarded_at, created_at")
            .eq("id", userData.user.id)
            .maybeSingle(),
          supabase
            .from("onboarding_responses")
            .select(
              "focus_habits, desired_outcomes, risk_times, risk_situations, triggers, tone_of_voice, support_modes, active_intervention, accountability_mode",
            )
            .eq("user_id", userData.user.id)
            .maybeSingle(),
          supabase
            .from("user_bad_habits")
            .select("habit_id, created_at")
            .eq("user_id", userData.user.id)
            .eq("active", true)
            .order("created_at", { ascending: true }),
          supabase
            .from("user_habit_answers")
            .select("habit_id, question_id, answer")
            .eq("user_id", userData.user.id),
        ]);
      if (cancelled) return;
      setProfile(profileRes.data);
      setResponses(responsesRes.data);
      setActiveHabits((habitsRes.data ?? []).map((h) => h.habit_id));
      const grouped: Record<string, AnswersByQuestion> = {};
      for (const row of answersRes.data ?? []) {
        const habit = row.habit_id;
        if (!grouped[habit]) grouped[habit] = {};
        grouped[habit][row.question_id] = row.answer as AnswerValue;
      }
      setHabitAnswers(grouped);
      setNameDraft(profileRes.data?.display_name ?? "");
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    setSavingName(true);
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSavingName(false);
      return;
    }
    await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", userData.user.id);
    setProfile((prev) => (prev ? { ...prev, display_name: trimmed } : prev));
    setEditingName(false);
    setSavingName(false);
  }

  async function signOut() {
    setSigningOut(true);
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  function restartOnboarding() {
    router.push("/onboarding?step=1");
  }

  async function saveHabitAnswers(habitId: string, answers: AnswersByQuestion) {
    setSavingHabit(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc("save_habit_answers", {
      p_habit_id: habitId,
      p_answers: answers as Record<string, AnswerValue>,
    });
    setSavingHabit(false);
    if (error) {
      console.error("[profile] save_habit_answers failed:", error);
      return;
    }
    setHabitAnswers((prev) => ({ ...prev, [habitId]: answers }));
    setEditingHabit(null);
  }

  return (
    <AppShell
      bottomNav={
        <BottomNav
          items={NAV_ITEMS}
          activeId="profile"
          onSelect={(id) => {
            if (id === "overview") router.push("/dashboard");
          }}
        />
      }
    >
      {!loaded || !profile ? (
        <div className="flex flex-col gap-4 pt-2">
          <LoadingSkeleton height="h-24" />
          <LoadingSkeleton height="h-40" />
          <LoadingSkeleton height="h-32" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <header className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
              Profiel
            </h1>
            <p className="text-sm text-muted">
              Jouw instellingen. Jouw controle.
            </p>
          </header>

          <GlassCard tone="elevated" padding="md" className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
                  Naam
                </span>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      maxLength={40}
                      className={cn(
                        "min-w-0 flex-1 bg-transparent text-xl font-semibold text-foreground",
                        "border-b border-purple/50 pb-0.5 outline-none",
                        "focus:border-purple-bright",
                      )}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                        if (e.key === "Escape") {
                          setEditingName(false);
                          setNameDraft(profile.display_name ?? "");
                        }
                      }}
                    />
                    <IconButton
                      aria-label="Naam opslaan"
                      icon={<CheckIcon />}
                      variant="primary"
                      size="sm"
                      onClick={saveName}
                      loading={savingName}
                    />
                  </div>
                ) : (
                  <span className="text-xl font-semibold text-foreground">
                    {profile.display_name || "Naamloos"}
                  </span>
                )}
              </div>
              {!editingName && (
                <IconButton
                  aria-label="Naam wijzigen"
                  icon={<PencilIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNameDraft(profile.display_name ?? "");
                    setEditingName(true);
                  }}
                />
              )}
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">
                Email
              </span>
              <span className="text-sm text-foreground">{profile.email}</span>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted">
                Lid sinds
              </span>
              <span className="text-sm text-foreground">
                {formatSince(profile.created_at)}
              </span>
            </div>
          </GlassCard>

          {responses && (
            <section className="flex flex-col gap-3">
              <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
                Jouw setup
              </h2>
              <GlassCard padding="none">
                <div className="flex flex-col divide-y divide-[var(--color-border)] px-4">
                  <SummarySection
                    eyebrow="Jouw focus"
                    title={`${responses.focus_habits.length} gewoonte${responses.focus_habits.length === 1 ? "" : "s"}`}
                    onEdit={restartOnboarding}
                    defaultOpen={false}
                  >
                    {labelsFor(responses.focus_habits, HABIT_OPTIONS)}
                  </SummarySection>
                  <SummarySection
                    eyebrow="Jouw waarom"
                    title="Wat je terug wil"
                    onEdit={restartOnboarding}
                    defaultOpen={false}
                  >
                    {labelsFor(responses.desired_outcomes, OUTCOME_OPTIONS)}
                  </SummarySection>
                  <SummarySection
                    eyebrow="Risicomomenten"
                    title="Wanneer en waar"
                    onEdit={restartOnboarding}
                    defaultOpen={false}
                  >
                    <div className="flex flex-col gap-1">
                      <span>
                        <span className="text-foreground">Tijd: </span>
                        {labelsFor(responses.risk_times, TIME_OPTIONS)}
                      </span>
                      <span>
                        <span className="text-foreground">Situaties: </span>
                        {labelsFor(
                          responses.risk_situations,
                          SITUATION_OPTIONS,
                        )}
                      </span>
                    </div>
                  </SummarySection>
                  <SummarySection
                    eyebrow="Jouw triggers"
                    title={`${responses.triggers.length} trigger${responses.triggers.length === 1 ? "" : "s"}`}
                    onEdit={restartOnboarding}
                    defaultOpen={false}
                  >
                    {labelsFor(responses.triggers, TRIGGER_OPTIONS)}
                  </SummarySection>
                  <SummarySection
                    eyebrow="Ondersteuning"
                    title={`Tone: ${TONE_OPTIONS.find((t) => t.id === responses.tone_of_voice)?.label ?? "Neutraal"}`}
                    onEdit={restartOnboarding}
                    defaultOpen={false}
                  >
                    <div className="flex flex-col gap-1">
                      <span>
                        <span className="text-foreground">Wat helpt: </span>
                        {labelsFor(responses.support_modes, SUPPORT_OPTIONS)}
                      </span>
                      <span>
                        <span className="text-foreground">Actief ingrijpen: </span>
                        {responses.active_intervention ? "Aan" : "Uit"}
                      </span>
                    </div>
                  </SummarySection>
                  <SummarySection
                    eyebrow="Accountability"
                    title={
                      responses.accountability_mode === "buddies"
                        ? "Buddies mode"
                        : "Solo mode"
                    }
                    onEdit={restartOnboarding}
                    defaultOpen={false}
                  >
                    {responses.accountability_mode === "buddies"
                      ? "Je circle ondersteunt je actief."
                      : "Alles blijft tussen jou en LOCKD."}
                  </SummarySection>
                </div>
              </GlassCard>
            </section>
          )}

          {activeHabits.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
                Aannames per gewoonte
              </h2>
              <GlassCard padding="none">
                <ul className="flex flex-col divide-y divide-[var(--color-border)] px-4">
                  {activeHabits.map((habitId) => (
                    <li key={habitId}>
                      <HabitAssumptionsRow
                        habitId={habitId}
                        answers={habitAnswers[habitId] ?? {}}
                        onEdit={() => setEditingHabit(habitId)}
                      />
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </section>
          )}

          <section className="flex flex-col gap-3 pt-2">
            <PrimaryButton fullWidth onClick={restartOnboarding}>
              Onboarding opnieuw doen
            </PrimaryButton>
            <GhostButton fullWidth onClick={signOut} loading={signingOut}>
              Uitloggen
            </GhostButton>
          </section>
        </div>
      )}

      {editingHabit && (
        <HabitAssumptionsSheet
          key={editingHabit}
          habitId={editingHabit}
          initialAnswers={habitAnswers[editingHabit] ?? {}}
          saving={savingHabit}
          onClose={() => setEditingHabit(null)}
          onSave={(answers) => saveHabitAnswers(editingHabit, answers)}
        />
      )}
    </AppShell>
  );
}

function HabitAssumptionsRow({
  habitId,
  answers,
  onEdit,
}: {
  habitId: string;
  answers: AnswersByQuestion;
  onEdit: () => void;
}) {
  const name = getBadHabitName(habitId);
  const questions = getQuestionsForHabit(habitId);
  const lines = describeAssumptions(habitId, answers);
  // If there are no derived assumptions (trigger-only habits), surface the
  // selected option labels instead so the row never appears empty.
  const fallback = questions
    .map((q) => {
      const a = answers[q.id] ?? q.defaultAnswer;
      if (q.type === "single") {
        const opt = q.options.find((o) => o.key === a);
        // resolveSingleValue is used elsewhere; here we only need the label.
        void resolveSingleValue;
        return opt ? `${q.question.split("?")[0]}: ${opt.label}` : null;
      }
      if (q.type === "multi") {
        const arr = Array.isArray(a) ? (a as string[]) : [];
        const labels = arr
          .map((k) => q.options.find((o) => o.key === k)?.label)
          .filter(Boolean);
        return labels.length > 0 ? labels.join(" · ") : null;
      }
      if (q.type === "slider") {
        const v = typeof a === "number" ? a : q.defaultAnswer;
        return `${v}${q.slider.suffix ?? ""}`;
      }
      return null;
    })
    .filter((x): x is string => Boolean(x));
  const display = lines.length > 0 ? lines : fallback;
  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        "flex w-full items-start justify-between gap-3 py-3 text-left",
        "transition-colors hover:bg-white/[0.01]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/50 rounded-[var(--radius-sm)]",
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <span className="line-clamp-2 text-[11px] leading-relaxed text-muted">
          {display.length > 0 ? display.join(" · ") : "Tap om aan te passen"}
        </span>
      </div>
      <span className="shrink-0 text-purple-bright">
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d="M5 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
