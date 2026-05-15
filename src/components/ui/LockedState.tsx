import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { IconBadge } from "./IconBadge";
import { PrimaryButton } from "./PrimaryButton";

type LockedStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  ctaLabel?: ReactNode;
  onUnlock?: () => void;
  className?: string;
};

function PadlockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function LockedState({
  title = "Premium feature",
  description = "Deze functie is onderdeel van LOCKD Premium.",
  ctaLabel = "Unlock",
  onUnlock,
  className,
}: LockedStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        "py-12 px-6 text-center",
        className,
      )}
    >
      <IconBadge tone="purple" size="lg" shape="circle" icon={<PadlockIcon />} />
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="max-w-[32ch] text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {onUnlock && (
        <PrimaryButton size="md" onClick={onUnlock} className="mt-1">
          {ctaLabel}
        </PrimaryButton>
      )}
    </div>
  );
}

export default LockedState;
