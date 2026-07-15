import { describe, expect, it } from 'vitest';
import { computeRatingUpdate, type PlayerRatingInput } from './ratings';

const DEFAULT: PlayerRatingInput['rating'] = { mu: 25, sigma: 8.333333333333334 };

describe('computeRatingUpdate', () => {
  it('returns an empty array for no players', () => {
    expect(computeRatingUpdate([])).toEqual([]);
  });

  it('raises the winner and lowers the losers', () => {
    const [winner, loser] = computeRatingUpdate([
      { rating: { ...DEFAULT }, finishingRank: 1 },
      { rating: { ...DEFAULT }, finishingRank: 2 },
    ]);

    expect(winner?.after.mu).toBeGreaterThan(winner?.before.mu ?? 0);
    expect(loser?.after.mu).toBeLessThan(loser?.before.mu ?? 0);
  });

  it('shrinks sigma (uncertainty) for everyone after a result', () => {
    const changes = computeRatingUpdate([
      { rating: { ...DEFAULT }, finishingRank: 1 },
      { rating: { ...DEFAULT }, finishingRank: 2 },
      { rating: { ...DEFAULT }, finishingRank: 3 },
    ]);
    for (const c of changes) {
      expect(c.after.sigma).toBeLessThan(c.before.sigma);
    }
  });

  it('treats every non-winner identically regardless of placement', () => {
    const [, second, third] = computeRatingUpdate([
      { rating: { ...DEFAULT }, finishingRank: 1 },
      { rating: { ...DEFAULT }, finishingRank: 2 },
      { rating: { ...DEFAULT }, finishingRank: 3 },
    ]);
    expect(second?.after).toEqual(third?.after);
  });

  it('is deterministic', () => {
    const input: PlayerRatingInput[] = [
      { rating: { ...DEFAULT }, finishingRank: 1 },
      { rating: { ...DEFAULT }, finishingRank: 2 },
    ];
    expect(computeRatingUpdate(input)).toEqual(computeRatingUpdate(input));
  });
});
