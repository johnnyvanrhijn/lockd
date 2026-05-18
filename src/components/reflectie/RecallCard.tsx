import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils/cn";
import type { ReflectionEntry } from "@/lib/reflectie/helpers";
import { daysAgoLabel } from "@/lib/reflectie/helpers";

type Props = {
  entry: ReflectionEntry;
  onClick: () => void;
};

const KIND_LABEL: Record<ReflectionEntry["kind"], string> = {
  open: "Vrije reflectie",
  missie: "Missie afgerond",
  struggle: "Struggle moment",
  mood: "Stemming",
};

export function RecallCard({ entry, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full text-left",
        "transition-transform duration-200",
        "active:scale-[0.995]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/60 rounded-[var(--radius-md)]",
      )}
    >
      <GlassCard padding="md" tone="purple" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-bright">
            {daysAgoLabel(entry.createdAt)}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
            {KIND_LABEL[entry.kind]}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-foreground/90">
          {entry.body}
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-bright">
          Lees terug
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="h-3 w-3"
          >
            <path
              d="M5 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </GlassCard>
    </button>
  );
}

export default RecallCard;
