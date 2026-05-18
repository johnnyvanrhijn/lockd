import { GlassCard } from "@/components/ui/GlassCard";

type Props = {
  /** Current consecutive-day LOCKD streak (consistency >= 80%). */
  currentStreak: number;
  /** All-time best LOCKD streak. */
  bestStreak: number;
  /** Total days the user has been tracking habits. */
  daysTracked: number;
};

export function RecordsHero({ currentStreak, bestStreak, daysTracked }: Props) {
  return (
    <GlassCard tone="purple" glow="soft" padding="lg">
      <div className="flex flex-col items-center gap-1 pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-purple-bright/80">
          Huidige LOCKD streak
        </span>
        <span className="text-6xl font-bold leading-none tabular-nums text-foreground">
          {currentStreak}
        </span>
        <span className="text-[11px] text-muted">
          {currentStreak === 1 ? "dag aaneen" : "dagen aaneen"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4">
        <Stat label="Beste streak" value={`${bestStreak}d`} />
        <Stat label="Dagen getrackt" value={`${daysTracked}d`} />
      </div>
    </GlassCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
    </div>
  );
}

export default RecordsHero;
