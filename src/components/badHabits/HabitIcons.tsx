import type { ReactNode } from "react";

/**
 * Lucide-style monoline icons for the top-16 bad habits.
 *
 * The project intentionally hand-rolls inline SVGs instead of pulling a full
 * icon dependency (see DESIGN.md — "components don't depend on an icon
 * library, page files bring their own"). These icons match Lucide's visual
 * language: 24×24 viewbox, currentColor stroke, strokeWidth 1.6, round caps.
 *
 * Only the 16 default habits get icons. Extras (dropdown items) render label-
 * only so the grid stays consistent and the extras section remains denser.
 */

const stroke = { stroke: "currentColor", strokeWidth: 1.6 } as const;

function svg(children: ReactNode) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function Cigarette() {
  return svg(
    <>
      <rect x="2" y="13" width="14" height="3" rx="0.5" {...stroke} />
      <line x1="16" y1="13" x2="16" y2="16" {...stroke} />
      <path d="M18 13.5v2M20 13.5v2M22 13.5v2" {...stroke} />
      <path d="M10 8c1.4-1 1.4-2.5 0-3.5M13 9c1.4-1 1.4-2.5 0-3.5" {...stroke} />
    </>,
  );
}

function EyeOff() {
  return svg(
    <>
      <path
        d="M2.5 12s3.5-7 9.5-7c2.1 0 3.9.9 5.4 2M21.5 12c-.6 1.2-1.6 2.6-3 3.7M14.5 14.5a3 3 0 0 1-4.2-4.2"
        {...stroke}
      />
      <line x1="3" y1="3" x2="21" y2="21" {...stroke} />
    </>,
  );
}

function Hourglass() {
  return svg(
    <>
      <path d="M6 3h12M6 21h12" {...stroke} />
      <path d="M7 3v3a5 5 0 0 0 10 0V3M7 21v-3a5 5 0 0 1 10 0v3" {...stroke} />
    </>,
  );
}

function Wine() {
  return svg(
    <>
      <path d="M8 3h8l-1 7a3 3 0 0 1-6 0L8 3Z" {...stroke} />
      <path d="M12 13v6M9 21h6" {...stroke} />
      <path d="M8.4 7h7.2" {...stroke} />
    </>,
  );
}

function Candy() {
  return svg(
    <>
      <circle cx="12" cy="12" r="4" {...stroke} />
      <path d="M8.5 8.5L5 5l1 4-4 1 3.5 3.5M15.5 15.5L19 19l-1-4 4-1-3.5-3.5" {...stroke} />
    </>,
  );
}

function Leaf() {
  return svg(
    <>
      <path
        d="M4 20c0-8 5-15 16-15-.5 9-5 14-13 14a3 3 0 0 1-3-3"
        {...stroke}
      />
      <path d="M4 20c2-5 6-9 11-11" {...stroke} />
    </>,
  );
}

function Smartphone() {
  return svg(
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.5" {...stroke} />
      <line x1="11" y1="18" x2="13" y2="18" {...stroke} />
    </>,
  );
}

function Utensils() {
  return svg(
    <>
      <path d="M7 2v8a2 2 0 1 1-4 0V2M5 10v12" {...stroke} />
      <path d="M16 2c-2 0-3.5 1.5-3.5 4S14 10 16 10v12" {...stroke} />
      <path d="M19 2v8" {...stroke} />
    </>,
  );
}

function Burger() {
  return svg(
    <>
      <path d="M3 9c1-3 4-5 9-5s8 2 9 5H3Z" {...stroke} />
      <path
        d="M3 12.5h18M3 15.5c1 0 1.5-1 2.5-1s1.5 1 2.5 1 1.5-1 2.5-1 1.5 1 2.5 1 1.5-1 2.5-1 1.5 1 2.5 1"
        {...stroke}
      />
      <path d="M5 19h14" {...stroke} />
    </>,
  );
}

function Dice() {
  return svg(
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" {...stroke} />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="8" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
    </>,
  );
}

function Bolt() {
  return svg(
    <>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" {...stroke} />
    </>,
  );
}

function ShoppingBag() {
  return svg(
    <>
      <path d="M5 7h14l-1.2 13a2 2 0 0 1-2 1.8H8.2A2 2 0 0 1 6.2 20L5 7Z" {...stroke} />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" {...stroke} />
    </>,
  );
}

function Doomscroll() {
  return svg(
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.5" {...stroke} />
      <path d="M10 8h4M10 11h4M10 14h3" {...stroke} />
      <path d="M12 16.5v3M10.5 18l1.5 1.5 1.5-1.5" {...stroke} />
    </>,
  );
}

function Moon() {
  return svg(
    <>
      <path d="M21 13.5A8.5 8.5 0 1 1 10.5 3a6.5 6.5 0 0 0 10.5 10.5Z" {...stroke} />
    </>,
  );
}

function CloudRain() {
  return svg(
    <>
      <path d="M7 16a4 4 0 0 1-.4-7.9A6 6 0 0 1 18 9a3.5 3.5 0 0 1 .5 7" {...stroke} />
      <path d="M9 19l-1 2M13 19l-1 2M17 19l-1 2" {...stroke} />
    </>,
  );
}

function Tv() {
  return svg(
    <>
      <rect x="3" y="5" width="18" height="13" rx="2" {...stroke} />
      <path d="M8 22h8M9 18v4M15 18v4" {...stroke} />
    </>,
  );
}

const ICONS: Record<string, () => ReactNode> = {
  smoking: Cigarette,
  porn: EyeOff,
  procrastination: Hourglass,
  alcohol: Wine,
  sugar: Candy,
  weed: Leaf,
  social_media: Smartphone,
  emotional_eating: Utensils,
  fastfood: Burger,
  gambling: Dice,
  energy_drinks: Bolt,
  overspending: ShoppingBag,
  doomscroll: Doomscroll,
  late_sleep: Moon,
  negative_thinking: CloudRain,
  binge_watching: Tv,
};

/** Returns a Lucide-style icon for a top-16 habit, or `null` for extras. */
export function getHabitIcon(habitId: string): ReactNode {
  const Comp = ICONS[habitId];
  return Comp ? Comp() : null;
}
