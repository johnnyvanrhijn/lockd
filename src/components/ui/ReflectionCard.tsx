import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "./GlassCard";
import { MoodBadge, type Mood } from "./MoodBadge";
import { MoodIcon } from "@/components/mood/MoodIcons";
import type { MoodId } from "@/lib/mood/options";

type ReflectionCardProps = {
  /** Display date — already formatted (e.g. "Vandaag", "12 mei"). */
  date: ReactNode;
  /** Legacy mood badge (5-state). Kept for back-compat. */
  mood?: Mood;
  /** LOCKD MoodId for line-icon rendering (overrides `mood`). */
  moodId?: MoodId;
  /** First-line summary (e.g. "Wat ging goed?"). */
  prompt?: ReactNode;
  /** The reflection text itself. */
  excerpt?: ReactNode;
  /** Optional tags rendered as small chips. */
  tags?: ReadonlyArray<ReactNode>;
  onClick?: () => void;
  className?: string;
};

export function ReflectionCard({
  date,
  mood,
  moodId,
  prompt,
  excerpt,
  tags,
  onClick,
  className,
}: ReflectionCardProps) {
  return (
    <GlassCard
      interactive={onClick ? true : undefined}
      onClick={onClick}
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted">
          {moodId && (
            <MoodIcon
              id={moodId}
              className="h-5 w-5 shrink-0 text-purple-bright"
            />
          )}
          {date}
        </span>
        {!moodId && mood && <MoodBadge mood={mood} />}
      </div>

      {prompt && (
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-bright">
          {prompt}
        </p>
      )}
      {excerpt && (
        <p className="text-sm leading-relaxed text-foreground/90 line-clamp-3">
          {excerpt}
        </p>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5",
                "text-[11px] font-medium text-muted",
                "bg-surface-glass border border-[var(--color-border)]",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export default ReflectionCard;
