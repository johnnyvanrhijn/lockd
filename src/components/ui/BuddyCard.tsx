import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "./GlassCard";
import { StatusBadge, type StatusTone } from "./StatusBadge";

type BuddyCardProps = {
  name: ReactNode;
  /** Avatar slot. If omitted, initials are shown. */
  avatar?: ReactNode;
  initials?: string;
  /** Status pill — e.g. "Locked in" / "Struggling". */
  status?: {
    label: ReactNode;
    tone: StatusTone;
  };
  /** Last activity copy (e.g. "Reageerde 2u geleden"). */
  lastActive?: ReactNode;
  /** Optional action — typically <IconButton> or <GhostButton>. */
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function BuddyCard({
  name,
  avatar,
  initials,
  status,
  lastActive,
  action,
  onClick,
  className,
}: BuddyCardProps) {
  return (
    <GlassCard
      interactive={onClick ? true : undefined}
      onClick={onClick}
      padding="sm"
      className={cn("flex items-center gap-3", className)}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden",
          "rounded-full",
          "bg-surface-elevated text-sm font-semibold text-foreground",
          "border border-[var(--color-border)]",
        )}
      >
        {avatar ?? initials?.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-foreground">
          {name}
        </span>
        {lastActive && (
          <span className="truncate text-xs text-muted">{lastActive}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {status && (
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        )}
        {action}
      </div>
    </GlassCard>
  );
}

export default BuddyCard;
