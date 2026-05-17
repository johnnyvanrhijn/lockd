import type { BottomNavItem } from "./BottomNav";

function HomeNavIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11.5L12 5l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H14V15h-4v5.5H5.5A1.5 1.5 0 0 1 4 19v-7.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartNavIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 19V5M5 19h14M9 15v-3M13 15V9M17 15v-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NoteNavIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4h9l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 4v4h4M8 13h8M8 17h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileNavIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const NAV_ITEMS: ReadonlyArray<BottomNavItem> = [
  { id: "vandaag", label: "Vandaag", icon: <HomeNavIcon /> },
  { id: "inzicht", label: "Inzicht", icon: <ChartNavIcon /> },
  { id: "reflectie", label: "Reflectie", icon: <NoteNavIcon /> },
  { id: "jij", label: "Jij", icon: <ProfileNavIcon /> },
];

export const NAV_ROUTES: Record<string, string> = {
  vandaag: "/dashboard",
  inzicht: "/inzicht",
  reflectie: "/reflectie",
  jij: "/profiel",
};
