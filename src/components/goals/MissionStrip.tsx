import { cn } from "@/lib/utils/cn";
import { GlassCard } from "@/components/ui/GlassCard";

export type MissionDay = "success" | "slip" | "future" | "today";

type Props = {
  /** All days in the mission in chronological order. Length === durationDays. */
  days: ReadonlyArray<MissionDay>;
  durationDays: number;
};

/**
 * Visual strip of mission days. Each day is a dot:
 *   - success: green (no sabotage triggered that day)
 *   - slip:    red   (sabotage triggered)
 *   - today:   highlighted purple ring
 *   - future:  faint outline
 */
export function MissionStrip({ days, durationDays }: Props) {
  // Pad with 'future' if data is short (shouldn't happen, but safe).
  const padded: ReadonlyArray<MissionDay> =
    days.length < durationDays
      ? [
          ...days,
          ...(Array(durationDays - days.length).fill("future") as MissionDay[]),
        ]
      : days;

  const success = padded.filter((d) => d === "success").length;
  const slip = padded.filter((d) => d === "slip").length;

  return (
    <GlassCard padding="md">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
            Per dag
          </span>
          <span className="text-[11px] tabular-nums text-muted">
            <span className="text-success">{success} sterk</span>
            {slip > 0 && (
              <>
                {" · "}
                <span className="text-danger">{slip} slip</span>
              </>
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-[3px]">
          {padded.map((d, i) => (
            <span
              key={i}
              aria-hidden
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                d === "success" && "bg-success/80",
                d === "slip" && "bg-danger/80",
                d === "future" &&
                  "border border-[var(--color-border-strong)] bg-transparent",
                d === "today" &&
                  "bg-purple-bright ring-2 ring-purple-bright/30 ring-offset-1 ring-offset-background",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-muted">
          <Legend tone="success" label="Stand gehouden" />
          <Legend tone="danger" label="Slip" />
          <Legend tone="muted" label="Komt nog" />
        </div>
      </div>
    </GlassCard>
  );
}

function Legend({
  tone,
  label,
}: {
  tone: "success" | "danger" | "muted";
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "success" && "bg-success/80",
          tone === "danger" && "bg-danger/80",
          tone === "muted" && "border border-[var(--color-border-strong)]",
        )}
      />
      {label}
    </span>
  );
}

export default MissionStrip;
