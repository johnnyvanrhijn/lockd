"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { BottomNav } from "@/components/navigation/BottomNav";
import { NAV_ITEMS, NAV_ROUTES } from "@/components/navigation/navItems";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { SummarySection } from "@/components/onboarding/SummarySection";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  OUTCOME_OPTIONS,
  TIME_OPTIONS,
  SITUATION_OPTIONS,
  TRIGGER_OPTIONS,
  TONE_OPTIONS,
  SUPPORT_OPTIONS,
} from "@/lib/onboarding/options";
import { HabitAssumptionsSheet } from "@/components/badHabits/HabitAssumptionsSheet";
import { HabitManagerSheet } from "@/components/badHabits/HabitManagerSheet";
import {
  OptionListEditSheet,
  type OptionEntry,
} from "@/components/profile/OptionListEditSheet";
import {
  SupportEditSheet,
  type ToneId,
} from "@/components/profile/SupportEditSheet";
import { RiskMomentsEditSheet } from "@/components/profile/RiskMomentsEditSheet";
import { getBadHabitName } from "@/lib/badHabits/catalog";
import {
  type AnswerValue,
  type AnswersByQuestion,
  getQuestionsForHabit,
  resolveSingleValue,
} from "@/lib/badHabits/questions";
import { describeAssumptions } from "@/lib/badHabits/impact";
import { cn } from "@/lib/utils/cn";

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

// Tier-A zone divider: thin top border + extra letter-spacing + muted color so
// the major structural breaks read distinctly from per-section group labels.
function ZoneHeader({ label }: { label: string }) {
  return (
    <div className="-mx-1 border-t border-[var(--color-border)] px-1 pt-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted/70">
        {label}
      </span>
    </div>
  );
}


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
  const [managerOpen, setManagerOpen] = useState(false);
  const [savingManager, setSavingManager] = useState(false);

  /** Which onboarding section is currently being edited inline. */
  type EditingSection =
    | null
    | "outcomes"
    | "risk"
    | "triggers"
    | "support"
    | "accountability";
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [savingSection, setSavingSection] = useState(false);

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

  async function saveResponsesPatch(patch: Partial<Responses>) {
    setSavingSection(true);
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSavingSection(false);
      return;
    }
    const { error } = await supabase
      .from("onboarding_responses")
      .update(patch)
      .eq("user_id", userData.user.id);
    setSavingSection(false);
    if (error) {
      console.error("[profile] update onboarding_responses failed:", error);
      return;
    }
    setResponses((prev) => (prev ? { ...prev, ...patch } : prev));
    setEditingSection(null);
  }

  async function saveHabitSelection(next: string[]) {
    setSavingManager(true);
    const supabase = getSupabaseClient();
    const [syncRes, responsesRes] = await Promise.all([
      supabase.rpc("sync_user_bad_habits", { p_habit_ids: next }),
      // Keep the legacy focus_habits array in lock-step so the summary cards
      // and any older code paths that read from onboarding_responses stay
      // accurate.
      supabase
        .from("onboarding_responses")
        .update({ focus_habits: next })
        .eq(
          "user_id",
          (await supabase.auth.getUser()).data.user?.id ?? "",
        ),
    ]);
    setSavingManager(false);
    if (syncRes.error) {
      console.error("[profile] sync_user_bad_habits failed:", syncRes.error);
      return;
    }
    if (responsesRes.error) {
      console.warn(
        "[profile] focus_habits mirror update failed:",
        responsesRes.error,
      );
    }
    setActiveHabits(next);
    setResponses((prev) =>
      prev ? { ...prev, focus_habits: next } : prev,
    );
    setManagerOpen(false);
  }

  return (
    <AppShell
      bottomNav={
        <BottomNav
          items={NAV_ITEMS}
          activeId="jij"
          onSelect={(id) => {
            const dest = NAV_ROUTES[id];
            if (dest && dest !== "/profiel") router.push(dest);
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
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
              Profiel
            </h1>
            <p className="text-sm text-muted">
              Jouw instellingen. Jouw controle.
            </p>
          </header>

          {/* Zone: ACCOUNT — identity */}
          <section className="flex flex-col gap-3">
            <ZoneHeader label="Account" />
            <GlassCard tone="elevated" padding="md" className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
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
          </section>

          {/* Zone: SETUP — behavioral profile + habits */}
          <section className="flex flex-col gap-5">
            <ZoneHeader label="Jouw profiel" />

            {responses && (
              <div className="flex flex-col gap-3">
                <GlassCard padding="none">
                  <div className="flex flex-col divide-y divide-[var(--color-border)] px-4">
                    <SummarySection
                      eyebrow="Jouw waarom"
                      title="Wat je terug wil"
                      onEdit={() => setEditingSection("outcomes")}
                      defaultOpen={false}
                    >
                      {labelsFor(responses.desired_outcomes, OUTCOME_OPTIONS)}
                    </SummarySection>
                    <SummarySection
                      eyebrow="Risicomomenten"
                      title="Wanneer en waar"
                      onEdit={() => setEditingSection("risk")}
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
                      onEdit={() => setEditingSection("triggers")}
                      defaultOpen={false}
                    >
                      {labelsFor(responses.triggers, TRIGGER_OPTIONS)}
                    </SummarySection>
                    <SummarySection
                      eyebrow="Ondersteuning"
                      title={`Tone: ${TONE_OPTIONS.find((t) => t.id === responses.tone_of_voice)?.label ?? "Neutraal"}`}
                      onEdit={() => setEditingSection("support")}
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
                      onEdit={() => setEditingSection("accountability")}
                      defaultOpen={false}
                    >
                      {responses.accountability_mode === "buddies"
                        ? "Je circle ondersteunt je actief."
                        : "Alles blijft tussen jou en LOCKD."}
                    </SummarySection>
                  </div>
                </GlassCard>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
                  Jouw gewoontes
                </h2>
                <button
                  type="button"
                  onClick={() => setManagerOpen(true)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    "text-muted hover:text-foreground transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                  )}
                >
                  Beheer →
                </button>
              </div>
              {activeHabits.length === 0 ? (
                <GlassCard tone="elevated" padding="md">
                  <p className="text-sm text-muted">
                    Geen actieve gewoontes. Tap{" "}
                    <span className="text-foreground">Beheer</span> om te
                    beginnen.
                  </p>
                </GlassCard>
              ) : (
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
              )}
            </div>
          </section>

          <button
            type="button"
            onClick={() => router.push("/goals")}
            className={cn(
              "flex w-full items-center justify-between gap-3",
              "rounded-[var(--radius-md)] border border-[var(--color-border)]",
              "bg-surface/60 px-4 py-3.5 text-left",
              "transition-colors duration-150",
              "hover:border-[var(--color-border-strong)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            )}
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                Missies & doelen
              </span>
              <span className="text-[11px] text-muted">
                Bekijk actieve en afgeronde missies.
              </span>
            </span>
            <span className="text-purple-bright">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-4 w-4">
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

          {/* Footer actions — quiet, low-emphasis. */}
          <div className="mt-2 flex flex-col items-center gap-3 pt-4">
            <button
              type="button"
              onClick={restartOnboarding}
              className={cn(
                "text-[12px] text-muted underline-offset-4 hover:text-foreground hover:underline",
                "focus-visible:outline-none focus-visible:underline focus-visible:text-foreground",
                "transition-colors",
              )}
            >
              Onboarding opnieuw doen
            </button>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className={cn(
                "text-[12px] text-muted underline-offset-4 hover:text-danger hover:underline",
                "focus-visible:outline-none focus-visible:underline focus-visible:text-danger",
                "transition-colors disabled:opacity-50",
              )}
            >
              {signingOut ? "Uitloggen…" : "Uitloggen"}
            </button>
          </div>
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

      {managerOpen && (
        <HabitManagerSheet
          initialSelected={activeHabits}
          saving={savingManager}
          onClose={() => setManagerOpen(false)}
          onSave={(next) => saveHabitSelection(next)}
        />
      )}

      {responses && editingSection === "outcomes" && (
        <OptionListEditSheet
          key="outcomes"
          eyebrow="Jouw waarom"
          title="Wat wil je terugkrijgen?"
          subtitle="Selecteer alles wat past."
          multi
          options={OUTCOME_OPTIONS as ReadonlyArray<OptionEntry>}
          initialSelected={responses.desired_outcomes}
          saving={savingSection}
          onClose={() => setEditingSection(null)}
          onSave={(next) => saveResponsesPatch({ desired_outcomes: next })}
        />
      )}

      {responses && editingSection === "triggers" && (
        <OptionListEditSheet
          key="triggers"
          eyebrow="Jouw triggers"
          title="Wat gaat er vaak vooraf?"
          subtitle="Selecteer wat herkenbaar is."
          multi
          options={TRIGGER_OPTIONS as ReadonlyArray<OptionEntry>}
          initialSelected={responses.triggers}
          saving={savingSection}
          onClose={() => setEditingSection(null)}
          onSave={(next) => saveResponsesPatch({ triggers: next })}
        />
      )}

      {responses && editingSection === "accountability" && (
        <OptionListEditSheet
          key="accountability"
          eyebrow="Accountability"
          title="Solo of met buddies?"
          subtitle="Je kunt later altijd switchen."
          multi={false}
          options={[
            {
              id: "solo",
              label: "Solo",
              description: "Alles blijft tussen jou en LOCKD.",
            },
            {
              id: "buddies",
              label: "Buddies",
              description: "Een kleine circle ziet jouw signalen.",
            },
          ]}
          initialSelected={[responses.accountability_mode]}
          saving={savingSection}
          onClose={() => setEditingSection(null)}
          onSave={(next) =>
            saveResponsesPatch({
              accountability_mode: next[0] ?? "solo",
            })
          }
        />
      )}

      {responses && editingSection === "risk" && (
        <RiskMomentsEditSheet
          key="risk"
          initialTimes={responses.risk_times}
          initialSituations={responses.risk_situations}
          saving={savingSection}
          onClose={() => setEditingSection(null)}
          onSave={({ times, situations }) =>
            saveResponsesPatch({
              risk_times: times,
              risk_situations: situations,
            })
          }
        />
      )}

      {responses && editingSection === "support" && (
        <SupportEditSheet
          key="support"
          initialTone={responses.tone_of_voice as ToneId}
          initialSupport={responses.support_modes}
          initialActive={responses.active_intervention}
          saving={savingSection}
          onClose={() => setEditingSection(null)}
          onSave={({ tone, support, active }) =>
            saveResponsesPatch({
              tone_of_voice: tone,
              support_modes: support,
              active_intervention: active,
            })
          }
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
