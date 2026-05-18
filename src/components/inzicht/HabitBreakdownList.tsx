import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";

export type DailyStatus = "success" | "fail" | "none";

export type PerHabitRow = {
  habitId: string;
  name: string;
  streak: number;
  daysClean: number;
  failsThisMonth: number;
  dailyStatus: ReadonlyArray<DailyStatus>;
};

type Props = {
  items: ReadonlyArray<PerHabitRow>;
};

export function HabitBreakdownList({ items }: Props) {
  if (items.length === 0) {
    return (
      <GlassCard tone="elevated" padding="md">
        <p className="text-sm text-muted">
          Voeg eerst gewoontes toe op{" "}
          <span className="text-foreground">/profiel</span> om je breakdown te
          zien.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="none">
      <ul className="flex flex-col divide-y divide-[var(--color-border)] px-4">
        {items.map((row) => (
          <li key={row.habitId} className="flex flex-col gap-2 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {row.name}
              </span>
              {row.streak > 0 && (
                <span className="rounded-full bg-purple/15 px-2 py-0.5 text-[11px] font-medium text-purple-bright tabular-nums">
                  🔥 {row.streak}d
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span className="tabular-nums">
                {row.daysClean}d clean · {row.failsThisMonth}{" "}
                {row.failsThisMonth === 1 ? "terugval" : "terugvallen"} 30d
              </span>
            </div>
            <StatusStrip dailyStatus={row.dailyStatus} />
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function StatusStrip({
  dailyStatus,
}: {
  dailyStatus: ReadonlyArray<DailyStatus>;
}) {
  return (
    <div className="flex items-center gap-[2px]">
      {dailyStatus.map((s, i) => {
        const isToday = i === dailyStatus.length - 1;
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "h-2 flex-1 rounded-full",
              s === "success" && "bg-success/80",
              s === "fail" && "bg-danger/80",
              s === "none" && "bg-white/[0.06]",
              isToday &&
                "ring-1 ring-purple-bright/70 ring-offset-1 ring-offset-background",
            )}
          />
        );
      })}
    </div>
  );
}

export default HabitBreakdownList;
