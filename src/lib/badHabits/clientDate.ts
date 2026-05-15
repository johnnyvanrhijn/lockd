/**
 * Date helpers for the bad-habits logging system.
 *
 * The product rule: a day stays "pending" until 03:00 the next morning, so a
 * user logging at 02:00 should log against *yesterday*, not against today.
 * The server uses these dates without questioning them; the client is the
 * one that knows the user's local clock, so the cutoff lives here.
 */

const CUTOFF_HOUR = 3;

/** YYYY-MM-DD in the user's local timezone. */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * The date that "today's" log should be attributed to. Before 03:00 local time,
 * users are still living "yesterday" — taps go to the previous date.
 */
export function getActiveLogDate(now: Date = new Date()): string {
  const adjusted = new Date(now);
  if (now.getHours() < CUTOFF_HOUR) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  return formatLocalDate(adjusted);
}

/**
 * The user's local calendar date right now (regardless of cutoff). Used by
 * the history screen as the right-edge of the heatmap.
 */
export function getLocalToday(now: Date = new Date()): string {
  return formatLocalDate(now);
}

/** Subtract `days` from a YYYY-MM-DD date and return YYYY-MM-DD. */
export function subDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - days);
  return formatLocalDate(dt);
}

/** Inclusive day count between two YYYY-MM-DD dates (from <= to). */
export function daysBetween(fromStr: string, toStr: string): number {
  const [fy, fm, fd] = fromStr.split("-").map(Number);
  const [ty, tm, td] = toStr.split("-").map(Number);
  const from = new Date(fy, fm - 1, fd);
  const to = new Date(ty, tm - 1, td);
  return Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
}
