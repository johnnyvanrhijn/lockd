import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "./GlassCard";

type InsightCardProps = {
  /** Short uppercase eyebrow (e.g. "Patroon", "Inzicht"). */
  eyebrow?: ReactNode;
  /** The insight statement itself — keep it short. */
  title: ReactNode;
  /** Optional supporting copy under the title. */
  body?: ReactNode;
  /** Icon shown in a tinted square on the left. */
  icon?: ReactNode;
  /** Optional CTA — e.g. <GhostButton>Meer</GhostButton>. */
  action?: ReactNode;
  className?: string;
};

export function InsightCard({
  eyebrow,
  title,
  body,
  icon,
  action,
  className,
}: InsightCardProps) {
  return (
    <GlassCard
      tone="purple"
      glow="soft"
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center",
              "rounded-[var(--radius-sm)]",
              "bg-purple/20 text-purple-bright",
              "[&_svg]:h-5 [&_svg]:w-5",
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-1">
          {eyebrow && (
            <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-purple-bright">
              {eyebrow}
            </span>
          )}
          <p className="text-base font-semibold leading-snug text-foreground">
            {title}
          </p>
        </div>
      </div>

      {body && <p className="text-sm leading-relaxed text-muted">{body}</p>}

      {action && <div className="mt-1 flex">{action}</div>}
    </GlassCard>
  );
}

export default InsightCard;
