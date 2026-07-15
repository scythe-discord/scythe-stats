/** Win rate as a percentage (0 when no matches). */
export function winRate(totalWins: number, totalMatches: number): number {
  return totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** Coarse "3 months ago" style relative time. */
export function timeAgo(date: Date, now = new Date()): string {
  const diffSec = (date.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diffSec);
  for (const [unit, secs] of RELATIVE_UNITS) {
    if (abs >= secs) return rtf.format(Math.round(diffSec / secs), unit);
  }
  return rtf.format(Math.round(diffSec / 60), 'minute');
}
