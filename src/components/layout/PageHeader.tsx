import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type PageHeaderProps = {
  /** Small uppercase label above the title (e.g. "Vandaag"). */
  eyebrow?: ReactNode;
  /** Main title — required. */
  title: ReactNode;
  /** Optional supporting copy under the title. */
  subtitle?: ReactNode;
  /** Slot for a left action — typically a back button or avatar. */
  leading?: ReactNode;
  /** Slot for a right action — typically an icon button or status badge. */
  trailing?: ReactNode;
  /** Center-align the title block (used on auth/onboarding screens). */
  centered?: boolean;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  leading,
  trailing,
  centered = false,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {(leading || trailing) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">{leading}</div>
          <div className="flex items-center gap-2">{trailing}</div>
        </div>
      )}

      <div className={cn("flex flex-col gap-2", centered && "items-center text-center")}>
        {eyebrow && (
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-[34ch] text-sm leading-relaxed text-muted">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
