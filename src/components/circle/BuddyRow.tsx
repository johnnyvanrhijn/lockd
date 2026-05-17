"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { sendBuddyPing, type CircleSignal, type PingType } from "@/lib/circle/client";

type Props = {
  signal: CircleSignal;
  onPingSent?: (type: PingType) => void;
};

function FlameIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M8 1.5c1 2 3 3 3 5.5a3 3 0 0 1-6 0c0-1 .5-1.5 1-2 .2 1.4 1.1 1.6 1.1 1.6S6 4 8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M11 9.5a3 3 0 1 1-6 0c0-1 .5-2 1.5-2.5 .2 1 .8 1.5 .8 1.5 0 0 .7-1 0-2.5 1 .5 2.5 1.5 2.5 3.5 0 0 .6-.4 .6-1 .4 .3 .6 .6 .6 1Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M8 2.5L14 13H2L8 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8 7v3M8 11.5v.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center",
        "rounded-full border border-purple/30 bg-purple/15",
        "text-[11px] font-semibold tracking-wide text-purple-bright",
      )}
    >
      {initials || "•"}
    </span>
  );
}

export function BuddyRow({ signal, onPingSent }: Props) {
  const [sending, setSending] = useState<PingType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [houScherpDone, setHouScherpDone] = useState(signal.houScherpCooldown);
  const [goedBezigDone, setGoedBezigDone] = useState(signal.goedBezigCooldown);

  async function handlePing(type: PingType) {
    if (sending) return;
    setSending(type);
    setError(null);
    try {
      await sendBuddyPing(signal.buddyId, type);
      if (type === "hou_scherp") setHouScherpDone(true);
      else setGoedBezigDone(true);
      onPingSent?.(type);
    } catch (err) {
      console.error("[circle] ping failed:", err);
      setError("Kon ping niet versturen.");
    } finally {
      setSending(null);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[var(--radius-sm)]",
        "border border-[var(--color-border)] bg-surface/60 p-3",
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar name={signal.displayName} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">
            {signal.displayName}
          </span>
          {signal.hasRecentStruggle ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-warning">
              <WarnIcon />
              moeilijk vandaag
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <span className="text-purple-bright">
                <FlameIcon />
              </span>
              {signal.streakDays} {signal.streakDays === 1 ? "dag" : "dagen"}
            </span>
          )}
        </div>
        {signal.unreadPingsCount > 0 && (
          <span
            className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-purple/20 px-1.5 text-[10px] font-semibold text-purple-bright"
            aria-label={`${signal.unreadPingsCount} nieuwe pings`}
          >
            {signal.unreadPingsCount}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handlePing("hou_scherp")}
          disabled={houScherpDone || sending !== null}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
            "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            houScherpDone
              ? "border-[var(--color-border)] bg-surface text-muted"
              : "border-warning/40 bg-warning/10 text-warning hover:bg-warning/15 active:scale-[0.97]",
            sending === "hou_scherp" && "opacity-60",
          )}
        >
          {houScherpDone ? "Hou scherp ✓" : "Hou scherp"}
        </button>
        <button
          type="button"
          onClick={() => handlePing("goed_bezig")}
          disabled={goedBezigDone || sending !== null}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
            "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
            goedBezigDone
              ? "border-[var(--color-border)] bg-surface text-muted"
              : "border-success/40 bg-success/10 text-success hover:bg-success/15 active:scale-[0.97]",
            sending === "goed_bezig" && "opacity-60",
          )}
        >
          {goedBezigDone ? "Goed bezig ✓" : "Goed bezig"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-[11px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default BuddyRow;
