"use client";

import { cn } from "@/lib/utils/cn";

export type HeatmapCell = {
  date: string; // YYYY-MM-DD
  pct: number | null; // null = before user joined or no active habits
  active: number;
  inFuture?: boolean;
};

type Props = {
  /** Cells laid out chronologically; the component groups them into weeks. */
  cells: ReadonlyArray<HeatmapCell>;
  /** Currently selected date (matches one of cells[].date) — gets a ring. */
  selectedDate?: string | null;
  onSelect: (date: string) => void;
};

const DAY_LABELS = ["M", "D", "W", "D", "V", "Z", "Z"] as const;

function bucketTone(pct: number | null, inFuture?: boolean):
  | "empty"
  | "future"
  | "fail"
  | "low"
  | "mid"
  | "good"
  | "perfect" {
  if (inFuture) return "future";
  if (pct === null) return "empty";
  if (pct === 0) return "fail";
  if (pct < 50) return "fail";
  if (pct < 80) return "mid";
  if (pct < 100) return "good";
  return "perfect";
}

const CELL_STYLE: Record<ReturnType<typeof bucketTone>, string> = {
  empty:
    "bg-surface-elevated/50 border-[var(--color-border)]",
  future:
    "bg-surface/20 border-transparent",
  fail:
    "bg-danger/20 border-danger/30",
  low:
    "bg-warning/15 border-warning/25",
  mid:
    "bg-warning/25 border-warning/35",
  good:
    "bg-success/20 border-success/30",
  perfect:
    "bg-success/40 border-success/55 shadow-[0_0_18px_-8px_rgba(74,222,128,0.55)]",
};

function getWeekday(dateStr: string): number {
  // Returns 0..6 with Monday = 0 (so the grid columns line up with DAY_LABELS).
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay(); // 0..6 with Sunday=0
  return (dow + 6) % 7; // Monday=0..Sunday=6
}

/**
 * GitHub-style consistency heatmap. Cells are stacked into rows of full weeks
 * (Mon → Sun) so today's column is wherever the current weekday lands. Earlier
 * gaps are filled with `future`-style cells so the grid stays rectangular.
 */
export function ConsistencyHeatmap({
  cells,
  selectedDate,
  onSelect,
}: Props) {
  if (cells.length === 0) return null;

  // Build padded weeks: prepend empty cells until cells[0]'s weekday lines up.
  const firstWeekday = getWeekday(cells[0].date);
  const padded: (HeatmapCell | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) padded.push(null);
  padded.push(...cells);
  // Pad the tail so the last row is complete.
  while (padded.length % 7 !== 0) padded.push(null);

  const weeks: (HeatmapCell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-center">
            {d}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((cell, di) => {
              if (!cell) {
                return (
                  <span
                    key={di}
                    aria-hidden
                    className="block aspect-square rounded-[6px] bg-transparent"
                  />
                );
              }
              const tone = bucketTone(cell.pct, cell.inFuture);
              const isSelected = selectedDate === cell.date;
              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => !cell.inFuture && onSelect(cell.date)}
                  disabled={cell.inFuture}
                  aria-label={`${cell.date}${cell.pct !== null ? ` — ${cell.pct}% consistent` : ""}`}
                  className={cn(
                    "relative block aspect-square rounded-[6px] border transition-transform duration-150",
                    "active:scale-[0.95]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70",
                    CELL_STYLE[tone],
                    cell.inFuture && "cursor-default opacity-40",
                    isSelected && "ring-2 ring-purple-bright ring-offset-2 ring-offset-background",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConsistencyHeatmap;
