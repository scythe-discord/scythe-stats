import { rate } from 'openskill';

export interface Rating {
  mu: number;
  sigma: number;
}

export interface PlayerRatingInput {
  rating: Rating;
  /** 1-based finishing position; only "is this the winner" matters (legacy parity). */
  finishingRank: number;
}

export interface RatingChange {
  before: Rating;
  after: Rating;
}

/**
 * Recompute OpenSkill ratings for a finished ranked game.
 *
 * Mirrors the legacy behaviour exactly: every player is a one-person "team", the
 * winner is rank 1 and everyone else is rank 2 (a tie for second). Only the
 * winner's victory affects ratings; relative placement among losers does not.
 */
export function computeRatingUpdate(players: PlayerRatingInput[]): RatingChange[] {
  if (players.length === 0) {
    return [];
  }

  const teams = players.map((p) => [{ mu: p.rating.mu, sigma: p.rating.sigma }]);
  const ranks = players.map((p) => (p.finishingRank === 1 ? 1 : 2));

  const updated = rate(teams, { rank: ranks });

  return players.map((p, i) => {
    const after = updated[i]?.[0];
    if (!after) {
      throw new Error('openskill returned an unexpected result shape');
    }
    return { before: p.rating, after: { mu: after.mu, sigma: after.sigma } };
  });
}
