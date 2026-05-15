import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { IconBadge } from "./IconBadge";
import { SecondaryButton } from "./SecondaryButton";

type ErrorStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  /** Optional retry handler — renders a SecondaryButton when provided. */
  onRetry?: () => void;
  retryLabel?: ReactNode;
  className?: string;
};

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 8v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      <path
        d="M10.6 3.7L2.9 17a1.6 1.6 0 0 0 1.4 2.4h15.4a1.6 1.6 0 0 0 1.4-2.4L13.4 3.7a1.6 1.6 0 0 0-2.8 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ErrorState({
  title = "Er ging iets mis",
  description = "Probeer het zo opnieuw. Blijft het hangen, ga terug en probeer het later.",
  onRetry,
  retryLabel = "Opnieuw proberen",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        "py-12 px-6 text-center",
        className,
      )}
    >
      <IconBadge tone="danger" size="lg" icon={<AlertIcon />} />
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="max-w-[32ch] text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {onRetry && (
        <SecondaryButton size="md" onClick={onRetry}>
          {retryLabel}
        </SecondaryButton>
      )}
    </div>
  );
}

export default ErrorState;
