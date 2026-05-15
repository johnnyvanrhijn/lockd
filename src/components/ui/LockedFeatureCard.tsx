import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "./GlassCard";
import { PrimaryButton } from "./PrimaryButton";

type LockedFeatureCardProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Label for the unlock CTA. Defaults to "Unlock". */
  ctaLabel?: ReactNode;
  /** Click handler on the unlock CTA. */
  onUnlock?: () => void;
  /** Optional small label above the title (e.g. "Premium"). */
  eyebrow?: ReactNode;
  /** Lock icon override. Defaults to a built-in padlock SVG. */
  icon?: ReactNode;
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

export function LockedFeatureCard({
  title,
  description,
  ctaLabel = "Unlock",
  onUnlock,
  eyebrow = "Premium",
  icon,
  className,
}: LockedFeatureCardProps) {
  return (
    <GlassCard
      tone="purple"
      glow="soft"
      className={cn("flex flex-col items-center gap-4 text-center", className)}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center",
          "rounded-full",
          "bg-purple/20 text-purple-bright",
          "[&_svg]:h-6 [&_svg]:w-6",
        )}
      >
        {icon ?? <PadlockIcon />}
      </div>

      {eyebrow && (
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-purple-bright">
          {eyebrow}
        </span>
      )}

      <h3 className="text-lg font-semibold leading-snug text-foreground">
        {title}
      </h3>

      {description && (
        <p className="max-w-[28ch] text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}

      <PrimaryButton size="md" onClick={onUnlock} className="mt-1">
        {ctaLabel}
      </PrimaryButton>
    </GlassCard>
  );
}

export default LockedFeatureCard;
