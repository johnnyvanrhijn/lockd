import { cn } from "@/lib/utils/cn";

type Props = {
  before: number;
  after: number;
  /** 10 by default (struggle urge scale). */
  scale?: number;
};

/**
 * Compact before→after visualization for struggle entries.
 * Two pills with a connecting bar showing the drop.
 */
export function UrgeDropPair({ before, after, scale = 10 }: Props) {
  const safeBefore = Math.max(0, Math.min(scale, before));
  const safeAfter = Math.max(0, Math.min(scale, after));
  const dropPct = Math.max(
    0,
    Math.min(100, ((safeBefore - safeAfter) / scale) * 100),
  );
  const startPct = (safeAfter / scale) * 100;
  const endPct = (safeBefore / scale) * 100;

  return (
    <div className="flex items-center gap-2">
      <Pill value={safeBefore} tone="warning" label="Voor" />
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="absolute top-0 h-full rounded-full bg-purple-bright/70"
          style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
        />
      </div>
      <Pill value={safeAfter} tone="success" label="Na" />
      <span className="text-[11px] font-semibold tabular-nums text-purple-bright">
        -{Math.round(dropPct)}%
      </span>
    </div>
  );
}

function Pill({
  value,
  tone,
  label,
}: {
  value: number;
  tone: "warning" | "success";
  label: string;
}) {
  return (
    <span
      title={label}
      aria-label={`${label}: ${value}`}
      className={cn(
        "inline-flex h-6 min-w-[28px] items-center justify-center rounded-full px-2",
        "text-[12px] font-semibold tabular-nums",
        tone === "warning" && "bg-warning/15 text-warning",
        tone === "success" && "bg-success/15 text-success",
      )}
    >
      {value}
    </span>
  );
}

export default UrgeDropPair;
