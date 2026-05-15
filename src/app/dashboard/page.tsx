"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconButton } from "@/components/ui/IconButton";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { WeekStreakDots, type WeekDay } from "@/components/ui/WeekStreakDots";
import { StreakHabitRow } from "@/components/ui/StreakHabitRow";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  BottomNav,
  type BottomNavItem,
} from "@/components/navigation/BottomNav";
import { getSupabaseClient } from "@/lib/supabase/client";
import { HABIT_OPTIONS } from "@/lib/onboarding/options";
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Icons                                                                     */
/*  Inline SVGs match the design-system convention: components don't depend   */
/*  on an icon library, page files bring their own.                           */
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

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3.5c.4 2.4 1.8 3.5 3 5 1.4 1.7 2.5 3.5 2.5 5.5a5.5 5.5 0 0 1-11 0c0-1.6.7-3 1.5-4 .4.9 1 1.4 1.8 1.6-.5-1.6-.2-3.4 1-5.2.4-.7.8-1.6 1.2-2.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.5V12l3 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EuroIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 7a6 6 0 1 0 0 10M5 11h9M5 14h8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Habit category icons — small monoline glyphs, neutral by default so the
   one-voice rule keeps Iris reserved for attention. */

function CigaretteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="13"
        width="14"
        height="3"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M17 13v3M19 13v3M21 13v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9 9c1.5-1 1.5-2.5 0-3.5M12 10c1.5-1 1.5-2.5 0-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9c1-3 4-5 8-5s7 2 8 5H4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3 12.5h18M3 15.5c1 0 1.5-1 2.5-1s1.5 1 2.5 1 1.5-1 2.5-1 1.5 1 2.5 1 1.5-1 2.5-1 1.5 1 2.5 1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5 19h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AdultIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 9v6M11 9v6M8 12h3M13 9h2.5a1.5 1.5 0 0 1 0 3H13v3M13 12h2.5a1.5 1.5 0 0 1 0 3H13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="6"
        y="2.5"
        width="12"
        height="19"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M11 18.5h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 7h11l-1 13a2 2 0 0 1-2 1.8H9.5A2 2 0 0 1 7.5 20L6.5 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 3c.5 1 .5 2 0 3M12 3c.5 1 .5 2 0 3M15 3c.5 1 .5 2 0 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Nav icons */

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

/* -------------------------------------------------------------------------- */
/*  Habit metadata                                                            */
/*                                                                            */
/*  The dashboard displays the user's selected focus_habits from onboarding   */
/*  as a habit list. Each option from HABIT_OPTIONS gets a "do not …" label   */
/*  and an icon. New options added to HABIT_OPTIONS without an entry here     */
/*  fall back to FlameIcon and the raw label.                                 */
/* -------------------------------------------------------------------------- */

type HabitMeta = {
  /** Imperative display name on the dashboard (e.g. "Niet gerookt"). */
  display: string;
  icon: ReactNode;
};

const HABIT_META: Record<string, HabitMeta> = {
  smoking:      { display: "Niet gerookt",        icon: <CigaretteIcon /> },
  porn:         { display: "Geen porno",          icon: <AdultIcon /> },
  weed:         { display: "Geen wiet",           icon: <FlameIcon /> },
  gambling:     { display: "Niet gegokt",         icon: <FlameIcon /> },
  alcohol:      { display: "Geen alcohol",        icon: <CupIcon /> },
  doomscroll:   { display: "Niet doomscrollen",   icon: <PhoneIcon /> },
  binge_eating: { display: "Geen vreetbuien",     icon: <BurgerIcon /> },
  overspending: { display: "Niet impulsief uitgegeven", icon: <FlameIcon /> },
  snoozing:     { display: "Niet gesnoozed",      icon: <FlameIcon /> },
  nail_biting:  { display: "Niet aan nagels",     icon: <FlameIcon /> },
  caffeine:     { display: "Minder cafeïne",      icon: <FlameIcon /> },
  social_media: { display: "Minder social media", icon: <PhoneIcon /> },
};

function habitMeta(id: string): HabitMeta {
  const found = HABIT_META[id];
  if (found) return found;
  const fallbackLabel =
    HABIT_OPTIONS.find((o) => o.id === id)?.label ?? id;
  return { display: fallbackLabel, icon: <FlameIcon /> };
}

const WEEK_LETTERS = ["M", "D", "W", "D", "V", "Z", "Z"] as const;

const NAV_ITEMS: ReadonlyArray<BottomNavItem> = [
  { id: "overview", label: "Overzicht", icon: <HomeNavIcon /> },
  { id: "stats", label: "Statistieken", icon: <ChartNavIcon /> },
  { id: "reflections", label: "Reflecties", icon: <NoteNavIcon /> },
  { id: "profile", label: "Profiel", icon: <ProfileNavIcon /> },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [checkedHabits, setCheckedHabits] = useState<ReadonlyArray<string>>([]);

  // Real data fetched from Supabase on mount.
  const [loaded, setLoaded] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [focusHabits, setFocusHabits] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      const [profileRes, responsesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userData.user.id)
          .maybeSingle(),
        supabase
          .from("onboarding_responses")
          .select("focus_habits")
          .eq("user_id", userData.user.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setDisplayName(profileRes.data?.display_name ?? null);
      setFocusHabits(responsesRes.data?.focus_habits ?? []);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const toggleHabit = (id: string) =>
    setCheckedHabits((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );

  // Build the "today" week dots. Until habit_logs exist, all pending.
  const week: ReadonlyArray<WeekDay> = WEEK_LETTERS.map((letter) => ({
    letter,
    status: "pending" as const,
  }));

  // Until habit_logs exist, no completed habits today. Show 0 / N.
  const totalToday = focusHabits.length || 0;
  const completedToday = 0;

  return (
    <AppShell
      header={
        <GreetingHeader
          name={displayName}
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
          }}
        />
      }
    >
      {!loaded ? (
        <div className="flex flex-col gap-4 pt-2">
          <LoadingSkeleton height="h-44" />
          <LoadingSkeleton height="h-16" />
          <LoadingSkeleton height="h-64" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <StreakHeroCard
            streakDays={0}
            completedToday={completedToday}
            totalToday={totalToday}
            week={week}
          />

          <StruggleCallout />

          <section className="flex flex-col gap-3">
            <SectionHeader
              title="Mijn bad habits"
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
            {focusHabits.length === 0 ? (
              <GlassCard tone="elevated" padding="md">
                <p className="text-sm text-muted">
                  Nog geen gewoonten geselecteerd. Open je profiel om de
                  onboarding opnieuw te doen.
                </p>
              </GlassCard>
            ) : (
              <GlassCard padding="none">
                <ul className="flex flex-col divide-y divide-[var(--color-border)] px-4">
                  {focusHabits.map((id) => {
                    const meta = habitMeta(id);
                    return (
                      <li key={id}>
                        <StreakHabitRow
                          name={meta.display}
                          sinceLabel="Begin vandaag"
                          icon={meta.icon}
                          days={0}
                          checkedToday={checkedHabits.includes(id)}
                          onCheck={() => toggleHabit(id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </GlassCard>
            )}
          </section>

          <ImpactStats />
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
          {name ? `${greeting}, ${name}` : greeting}{" "}
          <span aria-hidden className="inline-block translate-y-[-1px]">
            👋
          </span>
        </h1>
        <p className="text-sm text-muted">Vandaag is weer een nieuwe kans.</p>
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

function StreakHeroCard({
  streakDays,
  completedToday,
  totalToday,
  week,
}: {
  streakDays: number;
  completedToday: number;
  totalToday: number;
  week: ReadonlyArray<WeekDay>;
}) {
  return (
    <GlassCard tone="purple" glow="soft" padding="lg">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
            Huidige streak
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-semibold leading-none tracking-tight text-foreground">
              {streakDays}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground">
            dagen clean
          </span>
          <span className="text-xs text-muted">Je langste tot nu toe.</span>
        </div>

        <CircularProgress
          value={completedToday}
          max={totalToday}
          size={132}
          strokeWidth={9}
          label={`${completedToday} van ${totalToday} habits vandaag`}
        >
          <FlameIcon className="h-9 w-9 text-purple-bright" />
        </CircularProgress>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
            Vandaag
          </span>
          <span className="text-5xl font-semibold leading-none tracking-tight text-foreground">
            {completedToday}
            <span className="text-2xl text-muted">/{totalToday}</span>
          </span>
          <span className="text-sm font-medium text-foreground">op schema</span>
          <span className="text-xs text-muted">Blijf zo doorgaan.</span>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-4">
        <WeekStreakDots days={week} />
      </div>
    </GlassCard>
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

function ImpactStats() {
  return (
    <GlassCard padding="lg">
      <div className="flex flex-col items-center gap-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Jouw impact
        </h2>

        <div className="grid w-full grid-cols-3 gap-3">
          <ImpactStat
            icon={<ClockIcon />}
            value="14u 30m"
            label="teruggewonnen"
          />
          <ImpactStat icon={<EuroIcon />} value="€187" label="bespaard" />
          <ImpactStat
            icon={<BrainIcon />}
            value="64%"
            label="mentale rust"
            trend="up"
          />
        </div>
      </div>
    </GlassCard>
  );
}

function ImpactStat({
  icon,
  value,
  label,
  trend,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
  trend?: "up" | "down";
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <span
        aria-hidden
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)]",
          "bg-purple/15 text-purple-bright",
          "[&_svg]:h-4 [&_svg]:w-4",
        )}
      >
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold leading-none tracking-tight text-foreground">
            {value}
          </span>
          {trend === "up" && (
            <span aria-hidden className="text-xs text-success">
              ↑
            </span>
          )}
          {trend === "down" && (
            <span aria-hidden className="text-xs text-danger">
              ↓
            </span>
          )}
        </div>
        <span className="text-[11px] leading-tight text-muted">{label}</span>
      </div>
    </div>
  );
}
