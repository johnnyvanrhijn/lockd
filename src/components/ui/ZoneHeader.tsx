/**
 * Tier-A zone divider: thin top border + extra letter-spacing + muted color so
 * the major structural breaks read distinctly from inner Tier-B group labels.
 * Shared by profile and inzicht pages.
 */
export function ZoneHeader({ label }: { label: string }) {
  return (
    <div className="-mx-1 border-t border-[var(--color-border)] px-1 pt-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted/70">
        {label}
      </span>
    </div>
  );
}

export default ZoneHeader;
