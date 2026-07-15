/** Display metadata for a bid combo (faction/mat names + combo win rate + tier). */
export interface ComboMeta {
  comboId: number | null;
  factionId: number;
  playerMatId: number;
  faction: string;
  mat: string;
  tier: string | null;
  winRate: number | null;
  /** Faction board position (1–7), for the legacy table sort. */
  position: number;
  /** Player-mat turn order (1–7), for the legacy table sort. */
  matOrder: number;
}

/** A 50% combo win rate reads as a full strength meter. */
export const WINRATE_MAX = 50;

/** Win rate → 0–100 meter fill. */
export function strengthOf(m: ComboMeta): number {
  return Math.min(100, ((m.winRate ?? 0) / WINRATE_MAX) * 100);
}

/**
 * Legacy combo display order: start from the combo whose player mat goes first,
 * then follow faction positions clockwise around the board (positions below
 * the first combo's wrap past 7).
 */
export function tableOrder<T>(items: T[], of: (item: T) => ComboMeta): T[] {
  if (items.length === 0) return items;
  const first = items.reduce((a, b) => (of(b).matOrder < of(a).matOrder ? b : a));
  const firstPos = of(first).position;
  const key = (item: T) => of(item).position + (of(item).position < firstPos ? 7 : 0);
  return [...items].sort((a, b) => key(a) - key(b));
}
