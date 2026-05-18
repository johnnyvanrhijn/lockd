"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

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

/**
 * Largest visual weight on the dashboard. Opens the /struggle intervention
 * flow. Behavior-first: this is the only action that matters in a struggle
 * moment, so it gets its own card + glow.
 */
export function PrimaryInterventionCTA({
  habitId,
}: {
  /** Optional habit context — passed to /struggle as ?habit=… */
  habitId?: string | null;
} = {}) {
  const router = useRouter();

  function open() {
    const path = habitId ? `/struggle?habit=${encodeURIComponent(habitId)}` : "/struggle";
    router.push(path);
  }

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[var(--radius-md)]",
        "border border-purple/45 bg-gradient-to-br from-purple/18 via-purple/10 to-transparent",
        "px-5 py-5 text-left",
        "shadow-[0_24px_60px_-28px_var(--color-purple-glow)]",
        "transition-all duration-200 active:scale-[0.997]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
        "hover:border-purple/70 hover:shadow-[0_30px_70px_-26px_var(--color-purple-glow)]",
      )}
    >
      {/* Volumetric depth: two offset orbs that simulate lit-from-inside */}
      <div
        aria-hidden
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple/25 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-purple-bright/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-bright">
          Lastig moment?
        </span>
        <h2 className="text-[22px] font-semibold leading-tight text-foreground">
          Onderbreek het voordat het een keuze wordt.
        </h2>
        <div className="mt-2 inline-flex items-center gap-2 self-start rounded-full border border-purple/50 bg-purple/15 px-4 py-2 text-xs font-semibold text-purple-bright">
          Ik struggle
          <ArrowRight />
        </div>
      </div>
    </button>
  );
}

export default PrimaryInterventionCTA;
