import { GlassCard } from "@/components/ui/GlassCard";

type Props = {
  total: number;
  streak: number;
  topTheme: string | null;
};

export function ReflectionStatsHero({ total, streak, topTheme }: Props) {
  return (
    <GlassCard tone="purple" glow="soft" padding="lg">
      <div className="flex flex-col items-center gap-1 pb-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-purple-bright/80">
          Reflectie-streak
        </span>
        <span className="text-6xl font-bold leading-none tabular-nums text-foreground">
          {streak}
        </span>
        <span className="text-[11px] text-muted">
          {streak === 1 ? "dag" : "dagen"} op rij
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4">
        <Stat label="Totaal" value={`${total}`} />
        <Stat
          label="Thema"
          value={topTheme ?? "—"}
          truncate
        />
      </div>
    </GlassCard>
  );
}

function Stat({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5">
      <span
        className={
          truncate
            ? "max-w-full truncate text-2xl font-semibold tabular-nums text-foreground"
            : "text-2xl font-semibold tabular-nums text-foreground"
        }
        title={truncate ? value : undefined}
      >
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
    </div>
  );
}

export default ReflectionStatsHero;
