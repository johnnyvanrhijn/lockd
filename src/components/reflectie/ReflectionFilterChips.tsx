import { cn } from "@/lib/utils/cn";
import type { ReflectionKind } from "@/lib/reflectie/helpers";

export type FilterValue = "all" | ReflectionKind;

type Option = { value: FilterValue; label: string };

const OPTIONS: ReadonlyArray<Option> = [
  { value: "all", label: "Alles" },
  { value: "open", label: "Vrij" },
  { value: "missie", label: "Missies" },
  { value: "struggle", label: "Struggle" },
  { value: "mood", label: "Stemming" },
];

type Props = {
  value: FilterValue;
  counts: Partial<Record<FilterValue, number>>;
  onChange: (value: FilterValue) => void;
};

export function ReflectionFilterChips({ value, counts, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filter reflecties"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hidden"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        const count = counts[opt.value] ?? 0;
        const disabled = opt.value !== "all" && count === 0;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={disabled || undefined}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5",
              "text-[12px] font-medium tracking-tight",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60",
              active
                ? "bg-purple/20 text-purple-bright border border-purple/45"
                : "border border-[var(--color-border)] bg-surface/60 text-muted hover:text-foreground",
              disabled && "cursor-not-allowed opacity-40",
            )}
          >
            <span>{opt.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                active ? "bg-purple-bright/15 text-purple-bright" : "text-muted/70",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ReflectionFilterChips;
