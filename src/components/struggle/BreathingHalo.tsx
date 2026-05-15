"use client";

import { cn } from "@/lib/utils/cn";

type Props = {
  /** Diameter in px. */
  size?: number;
  /** When true (timer mode), the halo pulses synced to a slower in/out rhythm. */
  slow?: boolean;
  className?: string;
};

/**
 * A soft Iris-tinted radial halo that breathes. Used as the ambient backdrop
 * on Entry and Timer screens. Pure CSS — no JS frame loop, so the OS can keep
 * it animating even when the tab is throttled.
 */
export function BreathingHalo({ size = 280, slow = false, className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none relative",
        slow ? "lockd-halo-slow" : "lockd-halo",
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(167,139,250,0.45) 0%, rgba(139,92,246,0.20) 35%, rgba(139,92,246,0) 70%)",
        }}
      />
      <span
        className="absolute inset-[12%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(167,139,250,0.55) 0%, rgba(139,92,246,0.15) 50%, rgba(139,92,246,0) 80%)",
        }}
      />
    </div>
  );
}

export default BreathingHalo;
