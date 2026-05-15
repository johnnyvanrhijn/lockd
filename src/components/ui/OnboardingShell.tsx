import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { MobilePage } from "@/components/layout/MobilePage";
import { StepIndicator } from "@/components/ui/StepIndicator";

type OnboardingShellProps = {
  /** Total step count (8 for solo, 10 for buddies path). */
  total: number;
  /** Current step, 1-based. */
  current: number;
  /** Small eyebrow above the title, e.g. "Jouw focus". */
  eyebrow?: ReactNode;
  /** Big title, supports inline Iris emphasis via <span className="text-purple-bright">. */
  title: ReactNode;
  /** Optional supporting copy under the title. */
  subtitle?: ReactNode;
  /** Main step content. */
  children: ReactNode;
  /** Sticky bottom action bar (typically `Volgende` + `Terug`). */
  actions: ReactNode;
  /** Optional small footer (skip link, privacy note, etc.) below actions. */
  footer?: ReactNode;
  className?: string;
};

export function OnboardingShell({
  total,
  current,
  eyebrow,
  title,
  subtitle,
  children,
  actions,
  footer,
  className,
}: OnboardingShellProps) {
  return (
    <MobilePage
      className={className}
      contentClassName="gap-6 pb-32"
    >
      <header className="flex flex-col gap-4 pt-1">
        <div className="flex items-center justify-between gap-3">
          <StepIndicator total={total} current={current} className="flex-1" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
            {current} van {total}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {eyebrow && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-bright">
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

      <div className="flex flex-1 flex-col gap-4">{children}</div>

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-30",
          "pb-[max(env(safe-area-inset-bottom),0.75rem)]",
        )}
      >
        <div className="pointer-events-auto mx-auto w-full max-w-[430px] px-5">
          <div
            className={cn(
              "flex flex-col gap-2 rounded-t-[var(--radius-lg)]",
              "border border-b-0 border-[var(--color-border)]",
              "bg-background/85 px-1 pb-1 pt-3 backdrop-blur-2xl",
            )}
          >
            {actions}
            {footer && <div className="pb-1 text-center">{footer}</div>}
          </div>
        </div>
      </div>
    </MobilePage>
  );
}

export default OnboardingShell;
