import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { IconBadge } from "./IconBadge";

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Icon shown in a subtle tinted square at the top. */
  icon?: ReactNode;
  /** Optional CTA — e.g. <PrimaryButton>Add habit</PrimaryButton>. */
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        "py-12 px-6 text-center",
        className,
      )}
    >
      {icon && <IconBadge tone="neutral" size="lg" icon={icon} />}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="max-w-[32ch] text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export default EmptyState;
