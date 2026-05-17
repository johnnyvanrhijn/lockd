/**
 * Hand-drawn line-icons for the 5 mood states. Inherit currentColor via
 * stroke; sized 28×28 by default. Designed minimal-face-on-circle style to
 * match LOCKD's premium line-icon language.
 */

import type { MoodId } from "@/lib/mood/options";

type IconProps = { className?: string };

function FaceFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className ?? "h-7 w-7"}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.55"
      />
      {children}
    </svg>
  );
}

export function PrimaIcon({ className }: IconProps) {
  // Calm/steady — eyes as dots, neutral relaxed mouth
  return (
    <FaceFrame className={className}>
      <circle cx="9" cy="10" r="0.9" fill="currentColor" />
      <circle cx="15" cy="10" r="0.9" fill="currentColor" />
      <path
        d="M9 15.2c1.2 0.5 4.8 0.5 6 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </FaceFrame>
  );
}

export function GestrestIcon({ className }: IconProps) {
  // Tense — short brow strokes, squiggly mouth
  return (
    <FaceFrame className={className}>
      <path
        d="M7.5 8.5l1.8 0.5M16.5 8.5l-1.8 0.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="9" cy="11" r="0.9" fill="currentColor" />
      <circle cx="15" cy="11" r="0.9" fill="currentColor" />
      <path
        d="M8.5 15.5c1-1 2-1 3 0s2 1 3 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </FaceFrame>
  );
}

export function MoeIcon({ className }: IconProps) {
  // Tired — half-closed eyes (curves), slack mouth
  return (
    <FaceFrame className={className}>
      <path
        d="M7.5 10.5c0.6 0.8 2 0.8 2.6 0M13.9 10.5c0.6 0.8 2 0.8 2.6 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 16h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </FaceFrame>
  );
}

export function GeirriteerdIcon({ className }: IconProps) {
  // Irritated — angled brows downward to center, flat-firm mouth
  return (
    <FaceFrame className={className}>
      <path
        d="M7.5 8l2 1.2M16.5 8l-2 1.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="9" cy="11.5" r="0.9" fill="currentColor" />
      <circle cx="15" cy="11.5" r="0.9" fill="currentColor" />
      <path
        d="M9 15.5h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </FaceFrame>
  );
}

export function SomberIcon({ className }: IconProps) {
  // Gloomy — drooping eyes, downturned mouth
  return (
    <FaceFrame className={className}>
      <circle cx="9" cy="11" r="0.9" fill="currentColor" />
      <circle cx="15" cy="11" r="0.9" fill="currentColor" />
      <path
        d="M9 16.2c1.2-1 4.8-1 6 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </FaceFrame>
  );
}

export function MoodIcon({
  id,
  className,
}: {
  id: MoodId;
  className?: string;
}) {
  switch (id) {
    case "prima":
      return <PrimaIcon className={className} />;
    case "gestrest":
      return <GestrestIcon className={className} />;
    case "moe":
      return <MoeIcon className={className} />;
    case "geirriteerd":
      return <GeirriteerdIcon className={className} />;
    case "somber":
      return <SomberIcon className={className} />;
  }
}
