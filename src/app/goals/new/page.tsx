"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import {
  GOAL_TEMPLATES,
  templatesByCategory,
  type GoalTemplate,
  type SuggestedHabit,
} from "@/lib/goals/templates";
import {
  computeTargetEndDate,
  formatGoalDate,
  suggestStartingTemplate,
} from "@/lib/goals/engine";
import { createGoal } from "@/lib/goals/client";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  getBadHabitName,
  DEFAULT_BAD_HABITS,
  GOOD_HABITS,
  GOOD_HABIT_CATEGORIES,
  type MasterHabit,
} from "@/lib/badHabits/catalog";
import type {
  AnswerValue,
  AnswersByQuestion,
} from "@/lib/badHabits/questions";
import { MissionImpactProjection } from "@/components/goals/MissionImpactProjection";
import { cn } from "@/lib/utils/cn";

type Step = 1 | 2 | 3 | 4 | 5;

type Selections = {
  templateKey: string | null;
  customTitle: string;
  whys: string[];
  customWhy: string;
  supporting: SuggestedHabit[];
  sabotage: SuggestedHabit[];
  durationDays: number;
};

const DURATION_CHIPS: ReadonlyArray<{ label: string; days: number }> = [
  { label: "7 dagen", days: 7 },
  { label: "14 dagen", days: 14 },
  { label: "30 dagen", days: 30 },
  { label: "90 dagen", days: 90 },
];

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

type UserContext = {
  displayName: string | null;
  focusHabits: string[];
  activeBadHabits: Array<{ habitId: string; name: string }>;
  habitAnswers: Record<string, AnswersByQuestion>;
};

export default function NewGoalPage() {
  return (
    <Suspense fallback={null}>
      <NewGoalInner />
    </Suspense>
  );
}

function NewGoalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get("template");
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  // Ref instead of state: applying defaults shouldn't trigger a re-render,
  // and the React 19 lint rule rejects setState calls inside effect bodies.
  const defaultsAppliedRef = useRef(false);
  const [sel, setSel] = useState<Selections>({
    templateKey: null,
    customTitle: "",
    whys: [],
    customWhy: "",
    supporting: [],
    sabotage: [],
    durationDays: 7,
  });

  // Load the user's onboarding focus + active habits + habit answers so we can
  // (a) pre-select a starting template, (b) pre-fill sabotage habits on the
  // "Eigen doel" path, and (c) project impact at the duration step.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;
      const [profileRes, responsesRes, habitsRes, answersRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("onboarding_responses")
          .select("focus_habits")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("user_bad_habits")
          .select("habit_id")
          .eq("user_id", userId)
          .eq("active", true),
        supabase
          .from("user_habit_answers")
          .select("habit_id, question_id, answer")
          .eq("user_id", userId),
      ]);
      if (cancelled) return;

      const focus = (responsesRes.data?.focus_habits as string[] | null) ?? [];
      const active = (habitsRes.data ?? []).map((h) => ({
        habitId: h.habit_id,
        name: getBadHabitName(h.habit_id),
      }));
      const grouped: Record<string, AnswersByQuestion> = {};
      for (const row of answersRes.data ?? []) {
        const h = row.habit_id;
        if (!grouped[h]) grouped[h] = {};
        grouped[h][row.question_id] = row.answer as AnswerValue;
      }
      setUserContext({
        displayName: profileRes.data?.display_name ?? null,
        focusHabits: focus,
        activeBadHabits: active,
        habitAnswers: grouped,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply smart-default template once — query param takes precedence over
  // the focus-habit suggestion. Only runs if the user hasn't picked yet.
  // The setSel calls inside this effect are guarded by `defaultsAppliedRef`
  // and only fire on the *initial* render after async data lands, which is
  // exactly the use case the (overly broad) react-you-might-not-need-an-effect
  // rule is unable to recognize.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (defaultsAppliedRef.current) return;
    if (sel.templateKey !== null) {
      defaultsAppliedRef.current = true;
      return;
    }
    // URL hint first (e.g. from /goals recommendation card).
    if (templateParam) {
      const t = GOAL_TEMPLATES.find((x) => x.key === templateParam);
      if (t) {
        defaultsAppliedRef.current = true;
        setSel((s) => ({
          ...s,
          templateKey: t.key,
          customTitle: "",
          whys: [],
          customWhy: "",
          supporting: [...t.supporting],
          sabotage: [...t.sabotage],
          durationDays: t.durationDays,
        }));
        return;
      }
    }
    if (!userContext) return; // wait for user context before focus-based fallback
    const suggested = suggestStartingTemplate(userContext.focusHabits);
    if (!suggested) {
      defaultsAppliedRef.current = true;
      return;
    }
    const t = GOAL_TEMPLATES.find((x) => x.key === suggested);
    if (!t) {
      defaultsAppliedRef.current = true;
      return;
    }
    defaultsAppliedRef.current = true;
    setSel((s) => ({
      ...s,
      templateKey: t.key,
      customTitle: "",
      whys: [],
      customWhy: "",
      supporting: [...t.supporting],
      sabotage: [...t.sabotage],
      durationDays: t.durationDays,
    }));
  }, [userContext, sel.templateKey, templateParam]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const template = useMemo<GoalTemplate | null>(() => {
    if (!sel.templateKey || sel.templateKey === "eigen_doel") return null;
    return GOAL_TEMPLATES.find((t) => t.key === sel.templateKey) ?? null;
  }, [sel.templateKey]);

  const isCustom = sel.templateKey === "eigen_doel";
  const effectiveTitle = isCustom ? sel.customTitle.trim() : template?.title ?? "";

  function handlePickTemplate(key: string) {
    if (key === "eigen_doel") {
      // For custom missions, pre-fill sabotage with the user's active bad
      // habits so they don't start from a blank slate.
      const seededSabotage: SuggestedHabit[] =
        userContext?.activeBadHabits.map((h) => ({
          name: h.name,
          habitId: h.habitId,
        })) ?? [];
      setSel((s) => ({
        ...s,
        templateKey: key,
        whys: [],
        customWhy: "",
        supporting: [],
        sabotage: seededSabotage,
        durationDays: 7,
      }));
      return;
    }
    const t = GOAL_TEMPLATES.find((x) => x.key === key);
    if (!t) return;
    setSel((s) => ({
      ...s,
      templateKey: key,
      customTitle: "",
      whys: [],
      customWhy: "",
      supporting: [...t.supporting],
      sabotage: [...t.sabotage],
      durationDays: t.durationDays,
    }));
  }

  const canProceedFromStep = (s: Step): boolean => {
    switch (s) {
      case 1:
        if (isCustom) return effectiveTitle.length >= 3;
        return Boolean(template);
      case 2:
        return sel.whys.length > 0 || sel.customWhy.trim().length > 0;
      case 3:
        return sel.supporting.length + sel.sabotage.length > 0;
      case 4:
        return sel.durationDays >= 1 && sel.durationDays <= 365;
      case 5:
        return true;
    }
  };

  function nextStep() {
    if (!canProceedFromStep(step)) return;
    setStep((s) => (Math.min(5, s + 1) as Step));
  }
  function prevStep() {
    if (step === 1) {
      router.push("/goals");
      return;
    }
    setStep((s) => (Math.max(1, s - 1) as Step));
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const why = composeWhy(sel.whys, sel.customWhy);
    try {
      const goalId = await createGoal({
        title: effectiveTitle,
        category: isCustom ? "custom" : template?.category ?? null,
        why,
        durationDays: sel.durationDays,
        goalTemplateKey: isCustom ? "eigen_doel" : template?.key,
        customGoal: isCustom,
        supporting: sel.supporting,
        sabotage: sel.sabotage,
      });
      router.push(`/goals/${goalId}`);
    } catch (err) {
      console.error("[goals] create failed:", err);
      const raw = extractErrorMessage(err);
      const msg = raw.includes("active goal exists")
        ? "Je hebt al een actieve missie. Rond die eerst af."
        : raw.includes("auth") || raw.includes("Niet ingelogd")
          ? "Je sessie is verlopen. Vernieuw de pagina en log opnieuw in."
          : `Kon je missie niet starten. ${raw}`;
      setError(msg);
      setSubmitting(false);
    }
  }

  /**
   * Robust error→string for Supabase errors. PostgrestError objects are plain
   * objects (not Error instances) shaped as { message, details, hint, code }.
   * Stringifying them via String(err) yields "[object Object]" — useless.
   */
  function extractErrorMessage(err: unknown): string {
    if (!err) return "Onbekende fout";
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (typeof err === "object") {
      const o = err as Record<string, unknown>;
      const parts: string[] = [];
      if (typeof o.message === "string" && o.message.length > 0)
        parts.push(o.message);
      if (typeof o.hint === "string" && o.hint.length > 0)
        parts.push(`(${o.hint})`);
      if (parts.length === 0 && typeof o.code === "string")
        parts.push(`code ${o.code}`);
      if (parts.length > 0) return parts.join(" ");
    }
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }

  return (
    <AppShell
      header={
        <header className="flex items-center justify-between gap-3 pt-1">
          <IconButton
            aria-label="Terug"
            icon={<BackArrow />}
            variant="secondary"
            size="md"
            onClick={prevStep}
          />
          <div className="flex min-w-0 flex-1 flex-col text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              Nieuwe missie
            </span>
            <h1 className="truncate text-base font-semibold text-foreground">
              Stap {step} van 5
            </h1>
          </div>
          <span className="h-10 w-10" aria-hidden />
        </header>
      }
    >
      <div className="flex flex-col gap-5 pb-32">
        {step === 1 && (
          <Step1
            templateKey={sel.templateKey}
            customTitle={sel.customTitle}
            isCustom={isCustom}
            onPick={handlePickTemplate}
            onCustomTitle={(v) =>
              setSel((s) => ({ ...s, customTitle: v.slice(0, 60) }))
            }
          />
        )}

        {step === 2 && (
          <Step2
            template={template}
            whys={sel.whys}
            customWhy={sel.customWhy}
            onToggle={(w) =>
              setSel((s) => ({
                ...s,
                whys: s.whys.includes(w)
                  ? s.whys.filter((x) => x !== w)
                  : [...s.whys, w],
              }))
            }
            onCustomWhy={(v) =>
              setSel((s) => ({ ...s, customWhy: v.slice(0, 100) }))
            }
          />
        )}

        {step === 3 && (
          <Step3
            supporting={sel.supporting}
            sabotage={sel.sabotage}
            onChange={(supporting, sabotage) =>
              setSel((s) => ({ ...s, supporting, sabotage }))
            }
          />
        )}

        {step === 4 && (
          <Step4
            durationDays={sel.durationDays}
            onChange={(d) => setSel((s) => ({ ...s, durationDays: d }))}
            sabotage={sel.sabotage}
            habitAnswers={userContext?.habitAnswers ?? {}}
          />
        )}

        {step === 5 && (
          <Step5
            title={effectiveTitle}
            why={composeWhy(sel.whys, sel.customWhy)}
            durationDays={sel.durationDays}
            supporting={sel.supporting}
            sabotage={sel.sabotage}
            displayName={userContext?.displayName ?? null}
          />
        )}

        {error && (
          <GlassCard tone="danger" padding="md">
            <p className="text-sm text-danger">{error}</p>
          </GlassCard>
        )}
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30",
          "pointer-events-none flex justify-center",
        )}
      >
        <div
          className={cn(
            "pointer-events-auto w-full max-w-[430px]",
            "border-t border-[var(--color-border)]",
            "bg-background/90 backdrop-blur-xl",
            "px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]",
          )}
        >
          <div className="flex items-center gap-2">
            {step > 1 && <GhostButton onClick={prevStep}>Terug</GhostButton>}
            {step < 5 ? (
              <PrimaryButton
                onClick={nextStep}
                disabled={!canProceedFromStep(step)}
                fullWidth
              >
                Volgende
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={handleSubmit}
                disabled={submitting}
                fullWidth
              >
                {submitting ? "Starten…" : "Start missie"}
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function composeWhy(whys: string[], custom: string): string {
  const parts = [...whys];
  const trimmed = custom.trim();
  if (trimmed) parts.push(trimmed);
  return parts.join(". ");
}

/* ------------ Step 1: Choose mission ------------ */

function Step1({
  templateKey,
  customTitle,
  isCustom,
  onPick,
  onCustomTitle,
}: {
  templateKey: string | null;
  customTitle: string;
  isCustom: boolean;
  onPick: (key: string) => void;
  onCustomTitle: (v: string) => void;
}) {
  const grouped = useMemo(() => templatesByCategory(), []);
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          Waar wil je aan werken?
        </h2>
        <p className="text-sm text-muted">Kies een richting.</p>
      </header>

      <div className="flex flex-col gap-5">
        {grouped.map((g) => (
          <section key={g.category} className="flex flex-col gap-2">
            <h3 className="px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
              {g.label}
            </h3>
            <div className="flex flex-col gap-2">
              {g.templates.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onPick(t.key)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-[var(--radius-sm)]",
                    "border px-4 py-3 text-left",
                    "transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                    templateKey === t.key
                      ? "border-purple/60 bg-purple/12"
                      : "border-[var(--color-border)] bg-surface/60 hover:border-[var(--color-border-strong)]",
                  )}
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {t.title}
                    </span>
                    <span className="text-[11px] text-muted">
                      {t.durationDays} dagen
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}

        <section className="flex flex-col gap-2">
          <h3 className="px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
            Eigen doel
          </h3>
          <button
            type="button"
            onClick={() => onPick("eigen_doel")}
            className={cn(
              "flex flex-col gap-2 rounded-[var(--radius-sm)] border px-4 py-3 text-left",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
              isCustom
                ? "border-purple/60 bg-purple/12"
                : "border-[var(--color-border)] bg-surface/60 hover:border-[var(--color-border-strong)]",
            )}
          >
            <span className="text-sm font-semibold text-foreground">
              Eigen doel
            </span>
            <span className="text-[11px] text-muted">
              Schrijf je eigen missie (max 60 tekens).
            </span>
          </button>
          {isCustom && (
            <div className="flex flex-col gap-1.5 px-1">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => onCustomTitle(e.target.value)}
                placeholder="Bijvoorbeeld: 10 dagen geen suiker"
                autoFocus
                maxLength={60}
                className={cn(
                  "w-full rounded-[var(--radius-sm)]",
                  "border border-[var(--color-border)] bg-surface/80 px-3.5 py-3",
                  "text-sm text-foreground placeholder:text-muted",
                  "outline-none focus:border-purple/60 focus:shadow-[0_0_24px_-14px_var(--color-purple-glow)]",
                )}
              />
              <span className="self-end text-[10px] tabular-nums text-muted">
                {customTitle.length}/60
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ------------ Step 2: WHY ------------ */

function Step2({
  template,
  whys,
  customWhy,
  onToggle,
  onCustomWhy,
}: {
  template: GoalTemplate | null;
  whys: string[];
  customWhy: string;
  onToggle: (w: string) => void;
  onCustomWhy: (v: string) => void;
}) {
  const suggestions = template?.whySuggestions ?? [];
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          Waarom is dit belangrijk?
        </h2>
        <p className="text-sm text-muted">
          Kies één of meerdere redenen, of schrijf je eigen.
        </p>
      </header>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((w) => {
            const active = whys.includes(w);
            return (
              <button
                key={w}
                type="button"
                onClick={() => onToggle(w)}
                className={cn(
                  "rounded-full px-3.5 py-2 text-xs font-medium",
                  "border transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
                  active
                    ? "border-purple/60 bg-purple/15 text-foreground"
                    : "border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
                )}
              >
                {w}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="px-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
          Eigen reden (optioneel)
        </label>
        <input
          type="text"
          value={customWhy}
          onChange={(e) => onCustomWhy(e.target.value)}
          maxLength={100}
          placeholder="Wat is jouw eigen reden?"
          className={cn(
            "w-full rounded-[var(--radius-sm)]",
            "border border-[var(--color-border)] bg-surface/80 px-3.5 py-3",
            "text-sm text-foreground placeholder:text-muted",
            "outline-none focus:border-purple/60",
          )}
        />
        <span className="self-end text-[10px] tabular-nums text-muted">
          {customWhy.length}/100
        </span>
      </div>
    </div>
  );
}

/* ------------ Step 3: Habits ------------ */

function Step3({
  supporting,
  sabotage,
  onChange,
}: {
  supporting: SuggestedHabit[];
  sabotage: SuggestedHabit[];
  onChange: (s: SuggestedHabit[], sb: SuggestedHabit[]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          Welke gewoontes bepalen dit doel?
        </h2>
        <p className="text-sm text-muted">
          Selecteer wat helpt en wat tegenwerkt.
        </p>
      </header>

      <HabitGroup
        title="Gewoontes die helpen"
        kind="support"
        habits={supporting}
        onChange={(h) => onChange(h, sabotage)}
      />
      <HabitGroup
        title="Gewoontes die tegenwerken"
        kind="sabotage"
        habits={sabotage}
        onChange={(h) => onChange(supporting, h)}
      />
    </div>
  );
}

/**
 * Catalog source per group kind:
 *  - "support":  good-habit library, grouped by category.
 *  - "sabotage": the top-16 bad habits (matches onboarding's default grid).
 */
function catalogForKind(kind: "support" | "sabotage"): ReadonlyArray<MasterHabit> {
  return kind === "support" ? GOOD_HABITS : DEFAULT_BAD_HABITS;
}

function HabitGroup({
  title,
  kind,
  habits,
  onChange,
}: {
  title: string;
  kind: "support" | "sabotage";
  habits: SuggestedHabit[];
  onChange: (h: SuggestedHabit[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const catalog = catalogForKind(kind);
  const selectedCatalogIds = new Set(
    habits.map((h) => h.habitId).filter((x): x is string => Boolean(x)),
  );
  const availableCatalog = catalog.filter(
    (c) => !selectedCatalogIds.has(c.id),
  );

  function addFromCatalog(item: MasterHabit) {
    onChange([...habits, { name: item.name, habitId: item.id }]);
  }

  function addCustom() {
    const v = draft.trim();
    if (v.length === 0 || v.length > 40) return;
    onChange([...habits, { name: v }]);
    setDraft("");
    setAdding(false);
  }

  function removeAt(i: number) {
    onChange(habits.filter((_, idx) => idx !== i));
  }

  // Good habits grouped by category for the support picker; sabotage uses a
  // single flat list since DEFAULT_BAD_HABITS is brand-prioritized order.
  const supportByCategory =
    kind === "support"
      ? GOOD_HABIT_CATEGORIES.map((cat) => ({
          ...cat,
          items: availableCatalog.filter((h) => h.category === cat.id),
        })).filter((c) => c.items.length > 0)
      : null;

  return (
    <section className="flex flex-col gap-2">
      <h3
        className={cn(
          "px-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
          kind === "support" ? "text-success" : "text-warning",
        )}
      >
        {title}
      </h3>

      {/* Selected (template-prefilled or user-added) habits */}
      {habits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {habits.map((h, i) => (
            <span
              key={`${h.name}-${i}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
                "text-xs font-medium",
                kind === "support"
                  ? "border border-success/30 bg-success/10 text-success"
                  : "border border-warning/30 bg-warning/10 text-warning",
              )}
            >
              {h.name}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Verwijder ${h.name}`}
                className="opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Catalog picker — only shows items not yet selected */}
      {availableCatalog.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Uit catalogus
          </span>
          {supportByCategory ? (
            <div className="flex flex-col gap-1.5">
              {supportByCategory.map((cat) => (
                <div key={cat.id} className="flex flex-col gap-1">
                  <span className="px-1 text-[10px] font-medium text-foreground/55">
                    {cat.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((h) => (
                      <CatalogChip
                        key={h.id}
                        label={h.name}
                        tone="support"
                        onClick={() => addFromCatalog(h)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {availableCatalog.map((h) => (
                <CatalogChip
                  key={h.id}
                  label={h.name}
                  tone="sabotage"
                  onClick={() => addFromCatalog(h)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom text fallback */}
      {adding ? (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 40))}
            autoFocus
            placeholder="Naam gewoonte"
            className={cn(
              "flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)]",
              "bg-surface/80 px-3 py-2 text-sm text-foreground placeholder:text-muted",
              "outline-none focus:border-purple/60",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCustom();
            }}
          />
          <GhostButton onClick={addCustom}>Toevoegen</GhostButton>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="self-start pt-1 text-[11px] font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          + Andere toevoegen
        </button>
      )}
    </section>
  );
}

function CatalogChip({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "support" | "sabotage";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Voeg ${label} toe`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
        "text-[11px] font-medium",
        "transition-all duration-150 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2",
        tone === "support"
          ? [
              "border-success/25 bg-success/5 text-success/85",
              "hover:border-success/50 hover:bg-success/10 hover:text-success",
              "focus-visible:ring-success/60",
            ]
          : [
              "border-warning/25 bg-warning/5 text-warning/85",
              "hover:border-warning/50 hover:bg-warning/10 hover:text-warning",
              "focus-visible:ring-warning/60",
            ],
      )}
    >
      <span aria-hidden className="text-[13px] leading-none">
        +
      </span>
      {label}
    </button>
  );
}

/* ------------ Step 4: Duration ------------ */

function Step4({
  durationDays,
  onChange,
  sabotage,
  habitAnswers,
}: {
  durationDays: number;
  onChange: (d: number) => void;
  sabotage: SuggestedHabit[];
  habitAnswers: Record<string, AnswersByQuestion>;
}) {
  const isCustom = !DURATION_CHIPS.some((c) => c.days === durationDays);
  const [customMode, setCustomMode] = useState(isCustom);
  const startDate = new Date();
  const end = computeTargetEndDate(
    `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`,
    durationDays,
  );

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold leading-tight text-foreground">
          Hoe lang ga je dit beschermen?
        </h2>
        <p className="text-sm text-muted">
          Kies een vaste periode. Geen rek meer.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {DURATION_CHIPS.map((c) => (
          <button
            key={c.days}
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange(c.days);
            }}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold border",
              "transition-colors duration-150",
              !customMode && durationDays === c.days
                ? "border-purple/60 bg-purple/15 text-foreground"
                : "border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCustomMode(true)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold border",
            customMode
              ? "border-purple/60 bg-purple/15 text-foreground"
              : "border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
          )}
        >
          Eigen duur
        </button>
      </div>

      {customMode && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={365}
            value={durationDays}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!isNaN(n)) onChange(Math.max(1, Math.min(365, n)));
            }}
            className={cn(
              "w-24 rounded-[var(--radius-sm)]",
              "border border-[var(--color-border)] bg-surface/80 px-3 py-2",
              "text-center text-sm font-semibold tabular-nums text-foreground",
              "outline-none focus:border-purple/60",
            )}
          />
          <span className="text-sm text-muted">dagen (1–365)</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface/60 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            Start
          </span>
          <span className="text-sm font-semibold text-foreground">Vandaag</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            Eindigt
          </span>
          <span className="text-sm font-semibold text-foreground">
            {formatGoalDate(end)}
          </span>
        </div>
      </div>

      <MissionImpactProjection
        sabotage={sabotage}
        durationDays={durationDays}
        habitAnswers={habitAnswers}
      />
    </div>
  );
}

/* ------------ Step 5: Commitment moment ------------ */

function Step5({
  title,
  why,
  durationDays,
  supporting,
  sabotage,
  displayName,
}: {
  title: string;
  why: string;
  durationDays: number;
  supporting: SuggestedHabit[];
  sabotage: SuggestedHabit[];
  displayName: string | null;
}) {
  const startDate = new Date();
  const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
  const end = computeTargetEndDate(startStr, durationDays);
  const supportCount = supporting.length;
  const sabotageCount = sabotage.length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 pt-2 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-purple-bright/85">
          Klaar?
        </span>
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
          {displayName
            ? `Ik bescherm dit, ${displayName}.`
            : "Ik bescherm dit."}
        </h2>
      </header>

      <GlassCard tone="purple" glow="soft" padding="lg">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-bright/80">
            Mijn missie
          </span>
          <h3 className="text-2xl font-semibold leading-tight text-foreground">
            {title || "—"}
          </h3>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {durationDays}
            </span>
            <span className="text-sm font-medium text-muted">
              {durationDays === 1 ? "dag" : "dagen"} · tot {formatGoalDate(end)}
            </span>
          </div>
        </div>
      </GlassCard>

      {why && (
        <div className="flex flex-col gap-2 px-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted/80">
            Mijn waarom
          </span>
          <p className="text-base leading-relaxed text-foreground/95">
            <span aria-hidden className="text-purple-bright/70">
              &ldquo;
            </span>
            {why}
            <span aria-hidden className="text-purple-bright/70">
              &rdquo;
            </span>
          </p>
        </div>
      )}

      {(supportCount > 0 || sabotageCount > 0) && (
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted">
          {supportCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-success">
              {supportCount} bescherm
            </span>
          )}
          {sabotageCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-warning">
              {sabotageCount} vermijd
            </span>
          )}
        </div>
      )}

      <p className="px-2 text-center text-[11px] leading-relaxed text-muted/80">
        LOCKD herinnert je hieraan op de momenten waarop het er toe doet.
      </p>
    </div>
  );
}
