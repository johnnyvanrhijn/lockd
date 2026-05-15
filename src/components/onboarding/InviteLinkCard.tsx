"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";

type InviteLinkCardProps = {
  /** Full invite URL to display + copy. */
  url: string;
  className?: string;
};

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <rect
        x="8"
        y="8"
        width="12"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
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

export function InviteLinkCard({ url, className }: InviteLinkCardProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be denied in non-secure contexts; fall back to select.
      window.prompt("Kopieer je invite link:", url);
    }
  }

  return (
    <GlassCard tone="elevated" padding="md" className={cn("relative", className)}>
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
          Jouw invite link
        </span>
        <span className="break-all text-sm font-medium text-foreground">
          {url}
        </span>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Gekopieerd" : "Kopieer invite link"}
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center gap-2",
          "rounded-[var(--radius-sm)] border px-4 py-3 text-sm font-medium",
          "transition-all duration-200 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          copied
            ? "border-success/60 bg-success/10 text-success"
            : "border-purple/40 bg-purple/10 text-purple-bright hover:bg-purple/20 hover:border-purple/70",
        )}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "Gekopieerd" : "Kopieer link"}
      </button>
    </GlassCard>
  );
}

export default InviteLinkCard;
