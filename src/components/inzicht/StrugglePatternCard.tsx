import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";
import type { StrugglePattern } from "@/lib/struggle/client";
import {
  triggerLabel,
  interventionTitle,
} from "@/lib/insights/engine";

type Props = {
  pattern: StrugglePattern | null;
};

export function StrugglePatternCard({ pattern }: Props) {
  // <5 sessions or no pattern data: build-up state
  if (!pattern || pattern.total < 5) {
    const remaining = Math.max(0, 5 - (pattern?.total ?? 0));
    return (
      <GlassCard padding="md">
        <p className="text-sm text-muted">
          LOCKD bouwt je patroon op — nog {remaining}{" "}
          {remaining === 1 ? "struggle" : "struggles"} te gaan.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="md">
      <div className="flex flex-col gap-3">
        {/* Row 1: top trigger */}
        {pattern.topTrigger && (
          <Row>
            <RowHeader
              eyebrow="Je #1 trigger"
              title={triggerLabel(pattern.topTrigger)}
              badge={
                pattern.completed > 0
                  ? `${pattern.passedCount}/${pattern.completed} bewust`
                  : null
              }
            />
          </Row>
        )}

        {/* Row 2: best intervention */}
        {pattern.bestIntervention && pattern.bestInterventionDrop !== null && (
          <Row divider>
            <RowHeader
              eyebrow="Wat werkt voor jou"
              title={interventionTitle(pattern.bestIntervention)}
            />
            <UrgeDropBar drop={pattern.bestInterventionDrop} />
          </Row>
        )}

        {/* Row 3: peak hour */}
        {pattern.peakHour !== null && (
          <Row divider>
            <RowHeader
              eyebrow="Risico-moment"
              title={`${String(pattern.peakHour).padStart(2, "0")}:00`}
            />
            <PeakHourBars peakHour={pattern.peakHour} />
          </Row>
        )}
      </div>
    </GlassCard>
  );
}

function Row({
  children,
  divider,
}: {
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        divider && "border-t border-[var(--color-border)] pt-3",
      )}
    >
      {children}
    </div>
  );
}

function RowHeader({
  eyebrow,
  title,
  badge,
}: {
  eyebrow: string;
  title: string;
  badge?: string | null;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
          {eyebrow}
        </span>
        <span className="text-base font-semibold text-foreground">{title}</span>
      </div>
      {badge && (
        <span className="shrink-0 rounded-full bg-purple/15 px-2 py-0.5 text-[11px] font-medium text-purple-bright tabular-nums">
          {badge}
        </span>
      )}
    </div>
  );
}

function UrgeDropBar({ drop }: { drop: number }) {
  const clamped = Math.min(100, Math.max(0, drop));
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="h-full rounded-full bg-purple-bright/80"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-purple-bright">
        -{Math.round(clamped)}%
      </span>
    </div>
  );
}

function PeakHourBars({ peakHour }: { peakHour: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-4 items-end gap-[2px]">
        {Array.from({ length: 24 }).map((_, h) => (
          <span
            key={h}
            className={cn(
              "flex-1 rounded-sm",
              h === peakHour
                ? "h-full bg-purple-bright"
                : "h-1.5 bg-white/[0.08]",
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] tabular-nums text-muted/70">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </div>
  );
}

export default StrugglePatternCard;
