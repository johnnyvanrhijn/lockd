import type { MoodId } from "@/lib/mood/options";

export type ReflectionKind = "open" | "missie" | "struggle" | "mood";

export type ReflectionEntry = {
  id: string;
  kind: ReflectionKind;
  body: string;
  createdAt: string;
  goalTitle: string | null;
  result: string | null;
  tags: string[];
  /** Mood id when kind === "mood". */
  moodId?: MoodId;
  /** Urge scores for struggle entries (0–10 scale). */
  urgeBefore?: number | null;
  urgeAfter?: number | null;
};

export type Bucket = {
  label: string;
  entries: ReflectionEntry[];
};

function localDateKey(iso: string): string {
  const dt = new Date(iso);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function todayKey(): string {
  return localDateKey(new Date().toISOString());
}

function diffDays(aIso: string, bIso: string): number {
  const a = new Date(localDateKey(aIso) + "T00:00:00").getTime();
  const b = new Date(localDateKey(bIso) + "T00:00:00").getTime();
  return Math.round((a - b) / 86400000);
}

/**
 * Group entries into Vandaag · Deze week (last 7 days incl. today) · Eerder.
 * Empty buckets are filtered out by the caller if desired.
 */
export function groupByDate(entries: ReflectionEntry[]): Bucket[] {
  const today = new Date();
  const todayMs = new Date(localDateKey(today.toISOString()) + "T00:00:00").getTime();

  const vandaag: ReflectionEntry[] = [];
  const dezeWeek: ReflectionEntry[] = [];
  const eerder: ReflectionEntry[] = [];

  for (const e of entries) {
    const ms = new Date(localDateKey(e.createdAt) + "T00:00:00").getTime();
    const days = Math.round((todayMs - ms) / 86400000);
    if (days <= 0) vandaag.push(e);
    else if (days < 7) dezeWeek.push(e);
    else eerder.push(e);
  }

  return [
    { label: "Vandaag", entries: vandaag },
    { label: "Deze week", entries: dezeWeek },
    { label: "Eerder", entries: eerder },
  ];
}

/**
 * Compute the consecutive-day reflection streak ending today.
 * Counts a day as "reflected" if any entry exists on that local date.
 */
export function computeReflectionStreak(entries: ReflectionEntry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => localDateKey(e.createdAt)));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = localDateKey(cursor.toISOString());
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    // Allow today to be "not yet" — start counting from yesterday if today empty.
    if (streak === 0 && key === todayKey()) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }
  return streak;
}

/**
 * Pick the most frequent tag across all entries.
 * Returns null when there are fewer than 3 tag occurrences total — avoids
 * promoting a noise word as a "theme".
 */
export function topTheme(entries: ReflectionEntry[]): string | null {
  const counts = new Map<string, number>();
  let total = 0;
  for (const e of entries) {
    for (const t of e.tags) {
      const clean = t.trim();
      if (!clean) continue;
      counts.set(clean, (counts.get(clean) ?? 0) + 1);
      total += 1;
    }
  }
  if (total < 3) return null;
  let best: string | null = null;
  let bestCount = 0;
  for (const [tag, c] of counts) {
    if (c > bestCount) {
      best = tag;
      bestCount = c;
    }
  }
  return bestCount >= 2 ? best : null;
}

/**
 * Top N tags by frequency for the theme cloud.
 */
export function topTags(
  entries: ReflectionEntry[],
  limit = 5,
): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const e of entries) {
    for (const t of e.tags) {
      const clean = t.trim();
      if (!clean) continue;
      counts.set(clean, (counts.get(clean) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

/**
 * Find the entry whose date is closest to 7 days ago (±2 days window).
 * Used by the "Een week geleden" callback. Returns null when nothing fits.
 */
export function findRecall(entries: ReflectionEntry[]): ReflectionEntry | null {
  if (entries.length === 0) return null;
  const target = new Date();
  target.setDate(target.getDate() - 7);
  const targetIso = target.toISOString();
  let best: ReflectionEntry | null = null;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const e of entries) {
    const delta = Math.abs(diffDays(e.createdAt, targetIso));
    if (delta <= 2 && delta < bestDelta) {
      best = e;
      bestDelta = delta;
    }
  }
  return best;
}

/**
 * Days-ago label for the recall card.
 */
export function daysAgoLabel(iso: string): string {
  const days = Math.max(0, -diffDays(iso, new Date().toISOString()));
  if (days === 0) return "Vandaag";
  if (days === 1) return "Gisteren";
  if (days < 7) return `${days} dagen geleden`;
  if (days < 14) return "Een week geleden";
  if (days < 31) return `${Math.round(days / 7)} weken geleden`;
  return `${Math.round(days / 30)} maand${days >= 60 ? "en" : ""} geleden`;
}
