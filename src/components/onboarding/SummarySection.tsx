"use client";

import { useState, type ReactNode } from "react";
import { IconBadge } from "@/components/ui/IconBadge";
import { cn } from "@/lib/utils/cn";

type SummarySectionProps = {
  /** Eyebrow label above the title, e.g. "Jouw focus". */
  eyebrow?: ReactNode;
  /** Section title. */
  title: ReactNode;
  /** Optional leading icon (rendered inside an IconBadge). */
  icon?: ReactNode;
  /** Compact summary content shown when collapsed; full content when expanded. */
  children: ReactNode;
  /** Called when the user taps the edit affordance. */
  onEdit?: () => void;
  /** Editable by default, set false for read-only sections. */
  editable?: boolean;
  /** Start expanded, defaults to true; collapse to save vertical space. */
  defaultOpen?: boolean;
  className?: string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "h-4 w-4 transition-transform duration-200",
        open && "rotate-180",
      )}
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 20h4l10-10-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SummarySection({
  eyebrow,
  title,
  icon,
  children,
  onEdit,
  editable = true,
  defaultOpen = true,
  className,
}: SummarySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70 rounded-[var(--radius-sm)]",
        )}
      >
        {icon && <IconBadge icon={icon} tone="purple" size="md" />}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <span className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
              {eyebrow}
            </span>
          )}
          <span className="block truncate text-base font-semibold text-foreground">
            {title}
          </span>
        </div>
        <span className="text-muted">
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 pl-[3.25rem]">
          <div className="text-sm text-muted">{children}</div>
          {editable && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-full",
                "border border-[var(--color-border-strong)] px-3 py-1.5",
                "text-xs font-medium text-foreground",
                "transition-colors duration-150 hover:border-purple/60 hover:text-purple-bright",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-bright/70",
              )}
            >
              <PencilIcon />
              Aanpassen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SummarySection;
