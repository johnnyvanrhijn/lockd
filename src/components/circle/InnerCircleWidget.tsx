"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";
import {
  ensureInviteCode,
  getCircleSignals,
  type CircleSignal,
} from "@/lib/circle/client";
import { BuddyRow } from "./BuddyRow";

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <rect
        x="5"
        y="3.5"
        width="8"
        height="9"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3 6.5V12a1 1 0 0 0 1 1h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InnerCircleWidget() {
  const [signals, setSignals] = useState<CircleSignal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getCircleSignals();
        if (!cancelled) setSignals(rows);
      } catch (err) {
        console.error("[circle] get_circle_signals failed:", err);
        if (!cancelled) setSignals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Inner circle
        </h2>
      </div>

      {loading ? (
        <div
          className={cn(
            "h-24 animate-pulse rounded-[var(--radius-md)]",
            "border border-[var(--color-border)] bg-surface/40",
          )}
        />
      ) : !signals || signals.length === 0 ? (
        <InviteEmptyState />
      ) : (
        <div className="flex flex-col gap-2">
          {signals.map((s) => (
            <BuddyRow
              key={s.buddyId}
              signal={s}
              onPingSent={() => setTick((n) => n + 1)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function InviteEmptyState() {
  const [code, setCode] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = await ensureInviteCode();
        if (!cancelled) setCode(c);
      } catch {
        // silent — empty state still shown without code
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = code ? `${origin}/invite/${code}` : "";

  async function handleCopy() {
    if (!inviteUrl) return;
    setCopying(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Mijn LOCKD inner circle",
          text: "Sluit je aan bij mijn inner circle op LOCKD.",
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch (err) {
      console.error("[circle] share failed:", err);
    } finally {
      setCopying(false);
    }
  }

  return (
    <GlassCard padding="md">
      <div className="flex flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">
            Nodig iemand uit
          </span>
          <span className="text-[11px] text-muted">
            Alleen streaks en struggle-signalen. Geen reflecties, geen details.
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!inviteUrl || copying}
          className={cn(
            "inline-flex items-center justify-center gap-2",
            "rounded-full border border-purple/40 bg-purple/10 px-4 py-2.5",
            "text-xs font-semibold text-purple-bright",
            "transition-all duration-200 active:scale-[0.97]",
            "hover:border-purple/70 hover:bg-purple/20",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <CopyIcon />
          {copied ? "Gekopieerd" : "Deel invite link"}
        </button>
      </div>
    </GlassCard>
  );
}

export default InnerCircleWidget;
