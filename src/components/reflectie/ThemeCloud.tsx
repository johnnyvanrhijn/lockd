import { GlassCard } from "@/components/ui/GlassCard";

type Props = {
  tags: ReadonlyArray<{ tag: string; count: number }>;
};

export function ThemeCloud({ tags }: Props) {
  if (tags.length === 0) return null;
  const max = tags[0]?.count ?? 1;
  return (
    <GlassCard padding="md">
      <div className="flex items-center justify-between pb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-purple-bright">
          Wat komt steeds terug
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
          Top {tags.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => {
          // Scale font-size by relative frequency: 12-15px.
          const relative = max > 0 ? count / max : 0;
          const fontSize = 12 + Math.round(relative * 3);
          const opacity = 0.55 + relative * 0.45;
          return (
            <span
              key={tag}
              className="inline-flex items-baseline gap-1.5 rounded-full border border-[var(--color-border)] bg-surface/60 px-3 py-1"
              style={{ fontSize: `${fontSize}px`, color: `rgba(255,255,255,${opacity})` }}
            >
              {tag}
              <span className="text-[10px] font-semibold tabular-nums text-purple-bright">
                {count}
              </span>
            </span>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default ThemeCloud;
