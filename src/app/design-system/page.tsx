"use client";

import { useState, type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { GhostButton } from "@/components/ui/GhostButton";
import { IconButton } from "@/components/ui/IconButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { HabitCard } from "@/components/ui/HabitCard";
import { InsightCard } from "@/components/ui/InsightCard";
import { ReflectionCard } from "@/components/ui/ReflectionCard";
import { ProfileSummaryCard } from "@/components/ui/ProfileSummaryCard";
import { BuddyCard } from "@/components/ui/BuddyCard";
import { LockedFeatureCard } from "@/components/ui/LockedFeatureCard";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { MoodBadge, type Mood } from "@/components/ui/MoodBadge";
import { IconBadge } from "@/components/ui/IconBadge";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { HabitSelector } from "@/components/ui/HabitSelector";
import { MoodSelector } from "@/components/ui/MoodSelector";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LockedState } from "@/components/ui/LockedState";
import { BottomNav, type BottomNavItem } from "@/components/navigation/BottomNav";

/* -------------------------------------------------------------------------- */
/*  Inline icons — kept local to the playground so the design system itself
    stays icon-library-agnostic.                                              */
/* -------------------------------------------------------------------------- */

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
function CircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="14" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 19c1-2.6 3.2-4 5.5-4s4.5 1.4 5.5 4M14 19c.6-1.6 2-2.5 3.5-2.5s2.9.9 3.5 2.5"
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
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3s4.5 4 4.5 8.5a4.5 4.5 0 0 1-9 0c0-2 1-3 1-3s.5 1.5 1.5 1.5C10 8 12 6 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Layout helpers                                                            */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-bright">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-14 rounded-[var(--radius-sm)] border border-[var(--color-border)]"
        style={{ background: value }}
      />
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{name}</span>
        <span className="text-[10px] text-muted">{value}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const STATUS_TONES: ReadonlyArray<StatusTone> = [
  "success",
  "warning",
  "danger",
  "info",
  "neutral",
  "locked_in",
  "struggling",
  "off_track",
  "clean",
  "relapse",
];

const MOODS: ReadonlyArray<Mood> = [
  "strong",
  "okay",
  "struggle",
  "heavy",
  "unknown",
];

const NAV_ITEMS: ReadonlyArray<BottomNavItem> = [
  { id: "overview", label: "Overzicht", icon: <HomeIcon /> },
  { id: "stats", label: "Statistieken", icon: <ChartIcon /> },
  { id: "circle", label: "Circle", icon: <CircleIcon /> },
  { id: "reflections", label: "Reflecties", icon: <NoteIcon /> },
  { id: "profile", label: "Profiel", icon: <UserIcon /> },
];

const HABIT_OPTIONS = [
  { id: "porn", label: "Geen porn", icon: "🚫" },
  { id: "smoking", label: "Stoppen met roken", icon: "🚭" },
  { id: "weed", label: "Geen weed", icon: "🌿" },
  { id: "doomscroll", label: "Geen doomscroll", icon: "📱" },
  { id: "alcohol", label: "Geen alcohol", icon: "🍺" },
  { id: "snooze", label: "Niet snoozen", icon: "⏰" },
];

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [chips, setChips] = useState<string[]>(["calm", "focus"]);
  const [habits, setHabits] = useState<string[]>(["porn", "doomscroll"]);
  const [mood, setMood] = useState<Mood | null>("okay");
  const [toggles, setToggles] = useState({
    notifications: true,
    privacy: false,
  });
  const [loading, setLoading] = useState(false);

  const toggleChip = (id: string) =>
    setChips((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  return (
    <AppShell
      header={
        <PageHeader
          eyebrow="Design system"
          title="LOCKD components"
          subtitle="Interne preview. Mobiel-first, premium dark, herbruikbaar."
          trailing={
            <IconButton
              aria-label="Voeg toe"
              icon={<PlusIcon />}
              variant="primary"
              size="sm"
            />
          }
        />
      }
      bottomNav={
        <BottomNav
          items={NAV_ITEMS}
          activeId={activeTab}
          onSelect={setActiveTab}
        />
      }
    >
      <div className="flex flex-col gap-10">
        {/* ============================================================ */}
        <Section title="Tokens · Surfaces" description="Achtergrond & glas">
          <div className="grid grid-cols-2 gap-3">
            <Swatch name="background" value="#05060A" />
            <Swatch name="surface" value="#10121A" />
            <Swatch name="surface-elevated" value="#151823" />
            <Swatch name="surface-glass" value="rgba(255,255,255,0.04)" />
          </div>
        </Section>

        <Section title="Tokens · Brand & semantic">
          <div className="grid grid-cols-2 gap-3">
            <Swatch name="purple" value="#8B5CF6" />
            <Swatch name="purple-bright" value="#A78BFA" />
            <Swatch name="success" value="#4ADE80" />
            <Swatch name="warning" value="#FB923C" />
            <Swatch name="danger" value="#FB7185" />
            <Swatch name="info" value="#22D3EE" />
          </div>
        </Section>

        <Section title="Tokens · Radii">
          <div className="grid grid-cols-4 gap-3">
            {(["sm", "md", "lg", "xl"] as const).map((r) => (
              <div key={r} className="flex flex-col items-center gap-1.5">
                <div
                  className="h-12 w-12 border border-[var(--color-border)] bg-surface"
                  style={{ borderRadius: `var(--radius-${r})` }}
                />
                <span className="text-[10px] text-muted">{r}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ============================================================ */}
        <Section title="Typography">
          <GlassCard className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">Display</h1>
            <h2 className="text-xl font-semibold tracking-tight">Title</h2>
            <p className="text-sm text-foreground">
              Body — premium, calm, app-like.
            </p>
            <p className="text-xs text-muted">Muted supporting copy.</p>
            <span className="text-[11px] uppercase tracking-[0.25em] text-purple-bright">
              Eyebrow
            </span>
          </GlassCard>
        </Section>

        {/* ============================================================ */}
        <Section title="Buttons">
          <div className="flex flex-col gap-3">
            <PrimaryButton fullWidth>Get started</PrimaryButton>
            <SecondaryButton fullWidth>Learn more</SecondaryButton>
            <GhostButton fullWidth>Skip for now</GhostButton>
            <Button variant="danger" fullWidth>
              Delete account
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton size="sm">sm</PrimaryButton>
            <PrimaryButton size="md">md</PrimaryButton>
            <PrimaryButton size="lg">lg</PrimaryButton>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton
              loading={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1500);
              }}
            >
              Trigger loading
            </PrimaryButton>
            <SecondaryButton disabled>Disabled</SecondaryButton>
          </div>
          <div className="flex items-center gap-2">
            <IconButton aria-label="Add" icon={<PlusIcon />} variant="primary" />
            <IconButton aria-label="Add" icon={<PlusIcon />} variant="secondary" />
            <IconButton aria-label="Add" icon={<PlusIcon />} variant="ghost" />
            <IconButton
              aria-label="Add"
              icon={<PlusIcon />}
              variant="secondary"
              size="sm"
            />
            <IconButton
              aria-label="Add"
              icon={<PlusIcon />}
              variant="secondary"
              size="lg"
            />
          </div>
        </Section>

        {/* ============================================================ */}
        <Section title="Status badges">
          <div className="flex flex-wrap gap-2">
            {STATUS_TONES.map((tone) => (
              <StatusBadge key={tone} tone={tone}>
                {tone.replace("_", " ")}
              </StatusBadge>
            ))}
          </div>
        </Section>

        <Section title="Mood badges">
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <MoodBadge key={m} mood={m} />
            ))}
          </div>
        </Section>

        <Section title="Icon badges">
          <div className="flex items-center gap-3">
            <IconBadge icon={<FlameIcon />} tone="purple" />
            <IconBadge icon={<ShieldIcon />} tone="success" />
            <IconBadge icon={<MoonIcon />} tone="info" />
            <IconBadge icon={<FlameIcon />} tone="warning" shape="circle" />
            <IconBadge icon={<ShieldIcon />} tone="danger" size="lg" />
          </div>
        </Section>

        {/* ============================================================ */}
        <Section title="Stat cards">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Streak"
              value="12"
              unit="dgn"
              icon={<FlameIcon />}
              trend={{ direction: "up", label: "+3" }}
            />
            <StatCard
              label="Urges"
              value="4"
              hint="deze week"
              trend={{ direction: "down", label: "-2" }}
            />
          </div>
        </Section>

        <Section title="Habit cards">
          <div className="flex flex-col gap-3">
            <HabitCard
              name="Geen porn"
              icon="🚫"
              streakDays={12}
              status={{ label: "Locked in", tone: "locked_in" }}
              onClick={() => undefined}
            />
            <HabitCard
              name="Doomscroll"
              icon="📱"
              streakDays={2}
              status={{ label: "Struggling", tone: "struggling" }}
            />
            <HabitCard
              name="Alcohol"
              icon="🍺"
              meta="Laatste check 3u geleden"
              status={{ label: "Off track", tone: "off_track" }}
            />
          </div>
        </Section>

        <Section title="Insight & locked feature">
          <InsightCard
            eyebrow="Patroon"
            icon={<MoonIcon />}
            title="Je urges pieken meestal rond 23:00."
            body="In de afgelopen 14 dagen vielen 7 van de 10 urges tussen 22:30 en 00:30. Plan een interventie vóór die tijd."
            action={<GhostButton size="sm">Bekijk inzichten</GhostButton>}
          />
          <LockedFeatureCard
            title="Diepe wekelijkse rapportage"
            description="Krijg AI-gegenereerde patronen, trigger-analyse en wekelijkse coaching."
            ctaLabel="Unlock Premium"
          />
        </Section>

        <Section title="Reflection card">
          <ReflectionCard
            date="Vandaag"
            mood="okay"
            prompt="Wat ging goed?"
            excerpt="Ik heb een wandeling gemaakt toen ik de urge voelde. Het werkte beter dan verwacht — bleef helder."
            tags={["wandeling", "urge", "avond"]}
            onClick={() => undefined}
          />
        </Section>

        <Section title="Profile & buddy">
          <ProfileSummaryCard
            name="Johnny"
            tagline="Locked in · 12 dagen"
            initials="JR"
            stats={[
              { label: "Streak", value: "12d" },
              { label: "Urges", value: "4" },
              { label: "Wins", value: "21" },
            ]}
          />
          <div className="flex flex-col gap-2">
            <BuddyCard
              name="Mark"
              initials="MK"
              status={{ label: "Locked in", tone: "locked_in" }}
              lastActive="Reageerde 12m geleden"
              action={
                <IconButton aria-label="Bericht" icon={<NoteIcon />} variant="ghost" size="sm" />
              }
              onClick={() => undefined}
            />
            <BuddyCard
              name="Sara"
              initials="SR"
              status={{ label: "Struggling", tone: "struggling" }}
              lastActive="2u geleden"
            />
          </div>
        </Section>

        <Section title="Glass card variants">
          <div className="flex flex-col gap-3">
            <GlassCard tone="default">Default surface</GlassCard>
            <GlassCard tone="elevated">Elevated surface</GlassCard>
            <GlassCard tone="purple" glow="soft">
              Purple tinted card with soft glow
            </GlassCard>
            <GlassCard tone="success" glow="success">
              Success tinted card
            </GlassCard>
            <GlassCard tone="danger" glow="danger">
              Danger tinted card
            </GlassCard>
          </div>
        </Section>

        {/* ============================================================ */}
        <Section title="Selectable chips">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "calm", label: "Rust" },
              { id: "focus", label: "Focus" },
              { id: "discipline", label: "Discipline" },
              { id: "confidence", label: "Vertrouwen" },
              { id: "clarity", label: "Helderheid" },
            ].map((c) => (
              <SelectableChip
                key={c.id}
                selected={chips.includes(c.id)}
                onClick={() => toggleChip(c.id)}
              >
                {c.label}
              </SelectableChip>
            ))}
          </div>
        </Section>

        <Section title="Habit selector" description="Multi-select met cap van 4">
          <HabitSelector
            options={HABIT_OPTIONS}
            selected={habits}
            onChange={(next) => setHabits([...next])}
            max={4}
          />
        </Section>

        <Section title="Toggle row">
          <GlassCard padding="sm">
            <div className="flex flex-col divide-y divide-[var(--color-border)]">
              <ToggleRow
                label="Push notificaties"
                description="Krijg een seintje bij hoog risico"
                checked={toggles.notifications}
                onChange={(v) =>
                  setToggles((t) => ({ ...t, notifications: v }))
                }
              />
              <ToggleRow
                label="Anonieme analytics"
                description="Help LOCKD verbeteren — geen content gedeeld"
                checked={toggles.privacy}
                onChange={(v) => setToggles((t) => ({ ...t, privacy: v }))}
              />
            </div>
          </GlassCard>
        </Section>

        <Section title="Progress & steps">
          <div className="flex flex-col gap-4">
            <ProgressBar value={68} label="Week voortgang" showValue />
            <ProgressBar value={40} tone="warning" label="Risico-zone" />
            <ProgressBar value={92} tone="success" label="Hersteltempo" />
            <StepIndicator total={5} current={3} />
          </div>
        </Section>

        <Section title="Mood selector">
          <MoodSelector value={mood} onChange={setMood} />
        </Section>

        {/* ============================================================ */}
        <Section title="Selectable card (single)">
          <SelectableCard
            title="Direct & confronterend"
            description="LOCKD spreekt je rechtstreeks aan."
            icon={<ShieldIcon />}
            selected
          />
          <SelectableCard
            title="Kalm & ondersteunend"
            description="Rustige toon, minder pushy."
            icon={<MoonIcon />}
          />
        </Section>

        {/* ============================================================ */}
        <Section title="States">
          <GlassCard padding="none" className="overflow-hidden">
            <LoadingSkeleton height="h-24" rounded="rounded-none" />
            <div className="flex flex-col gap-2 p-4">
              <LoadingSkeleton width="w-2/3" height="h-4" />
              <LoadingSkeleton width="w-1/2" height="h-3" />
            </div>
          </GlassCard>

          <GlassCard padding="none">
            <EmptyState
              icon={<NoteIcon />}
              title="Nog geen reflecties"
              description="Begin vandaag met je eerste reflectie."
              action={<PrimaryButton size="md">Start reflectie</PrimaryButton>}
            />
          </GlassCard>

          <GlassCard padding="none">
            <ErrorState onRetry={() => undefined} />
          </GlassCard>

          <GlassCard padding="none">
            <LockedState
              title="Accountability circle"
              description="Premium feature. Nodig je vrienden uit voor accountability."
              onUnlock={() => undefined}
            />
          </GlassCard>
        </Section>

        {/* ============================================================ */}
        <Section title="Bottom navigation" description="Floating dark glass">
          <p className="text-xs text-muted">
            De live floating nav verschijnt onderaan dit scherm. Tap om de
            actieve tab te wisselen.
          </p>
        </Section>
      </div>
    </AppShell>
  );
}
