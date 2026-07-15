export interface MatchResultInput {
  displayName: string;
  faction: string;
  playerMat: string;
  coins: number;
  rank: number;
  /** Resolved bid (coins) for ranked bid games; subtracted from coins for the
   * rank/score consistency check. Null/undefined for casual matches. */
  bid?: number | null;
}

/** Thrown when a logged match violates a structural rule. */
export class MatchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MatchValidationError';
  }
}

export const MAX_ROUNDS = 50;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 7;
export const MAX_COINS = 250;

/**
 * Validate the structure of a logged match. Pure: existence checks for factions
 * and player mats (a DB concern) live in the data layer, not here.
 *
 * Error messages are kept identical to the legacy API for behavioural parity.
 */
export function validateMatch(numRounds: number, results: MatchResultInput[]): void {
  if (numRounds <= 0) {
    throw new MatchValidationError('Matches must have more than 0 rounds played');
  }
  if (numRounds > MAX_ROUNDS) {
    throw new MatchValidationError('The match length exceeds the max number of rounds');
  }
  if (results.length < MIN_PLAYERS || results.length > MAX_PLAYERS) {
    throw new MatchValidationError('Matches must have 2-7 players');
  }

  const ordered = [...results].sort((a, b) => a.rank - b.rank);
  const seenFactions = new Set<string>();
  const seenPlayerMats = new Set<string>();
  const seenPlayers = new Set<string>();
  let prevFinalScore: number | null = null;

  for (const { faction, playerMat, displayName, coins, bid } of ordered) {
    if (coins < 0) {
      throw new MatchValidationError('Coins must be valid non-negative integers');
    }
    if (coins > MAX_COINS) {
      throw new MatchValidationError("One or more players' coins exceeds the max number of coins");
    }

    const finalScore = coins - (bid ?? 0);
    if (prevFinalScore !== null && finalScore > prevFinalScore) {
      throw new MatchValidationError('Rank and coins data do not align.');
    }
    prevFinalScore = finalScore;

    if (
      seenFactions.has(faction) ||
      seenPlayerMats.has(playerMat) ||
      seenPlayers.has(displayName)
    ) {
      throw new MatchValidationError(
        'Match cannot contain duplicate factions, player mats, or players',
      );
    }
    seenFactions.add(faction);
    seenPlayerMats.add(playerMat);
    seenPlayers.add(displayName);
  }
}
