import { GlassCard } from "@/components/ui/GlassCard";
import { MoodIcon } from "@/components/mood/MoodIcons";
import { MOOD_OPTIONS, type MoodId } from "@/lib/mood/options";
import { cn } from "@/lib/utils/cn";

export type MoodDistribution = ReadonlyArray<{
  mood: MoodId;
  count: number;
  pct: number;
}>;

type Props = {
  distribution: MoodDistribution;
  daysCounted: number;
};

export function MoodDistributionCard({ distribution, daysCounted }: Props) {
  if (distribution.length === 0) {
    return (
      <GlassCard padding="md">
        <p className="text-sm text-muted">
          Begin met dagelijkse check-ins op het dashboard om je stemming-patroon
          te zien.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="md">
      <div className="flex items-center justify-between pb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
          Verdeling (30d)
        </span>
        <span className="text-[11px] tabular-nums text-muted">
          {daysCounted}d gemeten
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {distribution.map((row) => {
          const opt = MOOD_OPTIONS.find((m) => m.id === row.mood);
          if (!opt) return null;
          return (
            <div key={row.mood} className="flex items-center gap-3">
              <MoodIcon
                id={row.mood}
                className="h-6 w-6 shrink-0 text-purple-bright"
              />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {opt.label}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted">
                    {row.pct}%
                  </span>
                </div>
                <div
                  className={cn(
                    "h-1.5 w-full overflow-hidden rounded-full",
                    "bg-surface-elevated",
                  )}
                >
                  <div
                    className="h-full rounded-full bg-purple-bright/70"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default MoodDistributionCard;
