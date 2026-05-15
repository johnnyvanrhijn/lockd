import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "./GlassCard";

type ProfileStat = {
  label: ReactNode;
  value: ReactNode;
};

type ProfileSummaryCardProps = {
  /** Display name. */
  name: ReactNode;
  /** Short tagline or status (e.g. "Locked in · 12 dagen"). */
  tagline?: ReactNode;
  /** Avatar slot — pass an <img> or initials. If omitted, initials are shown. */
  avatar?: ReactNode;
  /** Initials fallback if no avatar is provided. */
  initials?: string;
  /** Up to 3 quick stats shown at the bottom. */
  stats?: ReadonlyArray<ProfileStat>;
  className?: string;
};

export function ProfileSummaryCard({
  name,
  tagline,
  avatar,
  initials,
  stats,
  className,
}: ProfileSummaryCardProps) {
  return (
    <GlassCard
      tone="elevated"
      glow="soft"
      className={cn("flex flex-col gap-5", className)}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden",
            "rounded-full",
            "bg-gradient-to-br from-purple-bright to-purple",
            "text-base font-semibold text-white",
            "shadow-[0_8px_24px_-10px_var(--color-purple-glow)]",
          )}
        >
          {avatar ?? initials?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-lg font-semibold text-foreground">
            {name}
          </span>
          {tagline && (
            <span className="truncate text-xs text-muted">{tagline}</span>
          )}
        </div>
      </div>

      {stats && stats.length > 0 && (
        <div
          className={cn(
            "grid gap-3 border-t border-[var(--color-border)] pt-4",
            stats.length === 1 && "grid-cols-1",
            stats.length === 2 && "grid-cols-2",
            stats.length >= 3 && "grid-cols-3",
          )}
        >
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-foreground">
                {stat.value}
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export default ProfileSummaryCard;
