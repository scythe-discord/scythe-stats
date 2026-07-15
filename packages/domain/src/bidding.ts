export interface Combo {
  factionId: number;
  playerMatId: number;
}

// --- Active player ---------------------------------------------------------

export interface PlayerBidState {
  id: number;
  order: number | null;
  hasBid: boolean;
}

/**
 * Determine whose turn it is to bid. Players without a bid are ordered by their
 * turn `order`; the bid history is then walked backwards to skip those who most
 * recently acted, landing on the next player up. Mirrors the legacy algorithm.
 */
export function getActivePlayerId(
  players: PlayerBidState[],
  bidHistoryPlayerIds: number[],
): number | undefined {
  let withoutBids = players
    .filter((p) => !p.hasBid)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (let i = 0; i < bidHistoryPlayerIds.length; i++) {
    if (withoutBids.length === 1) {
      return withoutBids[0]?.id;
    }
    const recentPlayerId = bidHistoryPlayerIds[bidHistoryPlayerIds.length - 1 - i];
    withoutBids = withoutBids.filter((p) => p.id !== recentPlayerId);
  }

  return withoutBids[0]?.id;
}

// --- Bidding completion ----------------------------------------------------

/** Bidding is finished once every combo has a bid on it. */
export function isBiddingComplete(combos: Array<{ hasBid: boolean }>): boolean {
  return combos.length > 0 && combos.every((c) => c.hasBid);
}

// --- Combo assignment ------------------------------------------------------

/**
 * Pick `numPlayers` combos such that no two share a faction or a player mat,
 * via backtracking. Deterministic in the given order (callers shuffle first for
 * randomness). Returns null if no valid assignment exists.
 */
export function assignCombos(numPlayers: number, enabledCombos: Combo[]): Combo[] | null {
  return backtrack(numPlayers, enabledCombos, []);
}

function backtrack(
  numPlayers: number,
  enabledCombos: Combo[],
  assignments: Combo[],
): Combo[] | null {
  if (assignments.length === numPlayers) {
    return [...assignments];
  }
  if (enabledCombos.length === 0) {
    return null;
  }

  for (const combo of enabledCombos) {
    assignments.push(combo);
    const remaining = enabledCombos.filter(
      (c) => c.factionId !== combo.factionId && c.playerMatId !== combo.playerMatId,
    );
    const found = backtrack(numPlayers, remaining, assignments);
    if (found) {
      return found;
    }
    assignments.pop();
  }

  return null;
}

// --- Quick-bid resolution --------------------------------------------------

export interface QuickBid {
  comboId: number;
  bidCoins: number;
  /** The player's preference order among their own quick bids (tie-breaker). */
  order: number;
}

export interface QuickBidPlayer {
  id: number;
  order: number | null;
  quickBids: QuickBid[];
}

export interface ResolvedBid {
  playerId: number;
  bidCoins: number;
}

const QUICK_BID_SAFETY_LIMIT = 1000;

/**
 * Resolve every player's quick bids into a final winning bid per combo.
 *
 * Players take turns in `order`. On each turn the active player claims the combo
 * where they have the largest margin over the current price (ties broken by their
 * own preference order). Claiming a contested combo bumps its price by one and
 * returns the displaced player to the queue. Mirrors the legacy algorithm.
 */
export function resolveQuickBids(
  players: QuickBidPlayer[],
  comboIds: number[],
): Map<number, ResolvedBid> {
  const queue = [...players]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p) => ({ id: p.id, quickBids: p.quickBids }));
  const byId = new Map(queue.map((p) => [p.id, p]));

  const bids = new Map<number, ResolvedBid | null>();
  for (const comboId of comboIds) {
    bids.set(comboId, null);
  }

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    let chosen: QuickBid | null = null;
    for (const qb of current.quickBids) {
      if (chosen === null) {
        chosen = qb;
        continue;
      }
      const currMargin = qb.bidCoins - ((bids.get(qb.comboId)?.bidCoins ?? -1) + 1);
      const bestMargin = chosen.bidCoins - ((bids.get(chosen.comboId)?.bidCoins ?? -1) + 1);
      if (currMargin === bestMargin) {
        chosen = qb.order < chosen.order ? qb : chosen;
      } else if (currMargin > bestMargin) {
        chosen = qb;
      }
    }

    if (!chosen) {
      throw new Error('A player has no quick bids to resolve');
    }

    const previous = bids.get(chosen.comboId);
    if (previous) {
      if (previous.bidCoins > QUICK_BID_SAFETY_LIMIT) {
        throw new Error('Quick bid resolution exceeded the safety limit');
      }
      const displaced = byId.get(previous.playerId);
      if (displaced) {
        queue.push(displaced);
      }
      bids.set(chosen.comboId, { bidCoins: previous.bidCoins + 1, playerId: current.id });
    } else {
      bids.set(chosen.comboId, { bidCoins: 0, playerId: current.id });
    }
  }

  const resolved = new Map<number, ResolvedBid>();
  for (const [comboId, bid] of bids) {
    if (bid) {
      resolved.set(comboId, bid);
    }
  }
  return resolved;
}
