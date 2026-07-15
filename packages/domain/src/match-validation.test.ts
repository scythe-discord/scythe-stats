import { describe, expect, it } from 'vitest';
import { type MatchResultInput, MatchValidationError, validateMatch } from './match-validation';

function results(n: number): MatchResultInput[] {
  return Array.from({ length: n }, (_, i) => ({
    displayName: `P${i}`,
    faction: `F${i}`,
    playerMat: `M${i}`,
    coins: 100 - i * 10,
    rank: i + 1,
  }));
}

describe('validateMatch', () => {
  it('accepts a well-formed match', () => {
    expect(() => validateMatch(6, results(4))).not.toThrow();
  });

  it.each([
    [0, 'Matches must have more than 0 rounds played'],
    [-1, 'Matches must have more than 0 rounds played'],
    [51, 'The match length exceeds the max number of rounds'],
  ])('rejects %i rounds', (rounds, message) => {
    expect(() => validateMatch(rounds, results(4))).toThrow(message);
  });

  it.each([1, 8])('rejects %i players', (n) => {
    expect(() => validateMatch(6, results(n))).toThrow('Matches must have 2-7 players');
  });

  it('rejects negative coins', () => {
    const r = results(2);
    r[1] = { ...r[1]!, coins: -5 };
    expect(() => validateMatch(6, r)).toThrow('Coins must be valid non-negative integers');
  });

  it('rejects coins over the cap', () => {
    const r = results(2);
    r[0] = { ...r[0]!, coins: 251 };
    expect(() => validateMatch(6, r)).toThrow(MatchValidationError);
  });

  it('rejects duplicate factions/mats/players', () => {
    const r = results(2);
    r[1] = { ...r[1]!, faction: r[0]!.faction };
    expect(() => validateMatch(6, r)).toThrow(
      'Match cannot contain duplicate factions, player mats, or players',
    );
  });

  it('rejects rank/coins that do not align', () => {
    // rank 1 has fewer coins than rank 2 -> inconsistent
    const r: MatchResultInput[] = [
      { displayName: 'A', faction: 'F1', playerMat: 'M1', coins: 30, rank: 1 },
      { displayName: 'B', faction: 'F2', playerMat: 'M2', coins: 50, rank: 2 },
    ];
    expect(() => validateMatch(6, r)).toThrow('Rank and coins data do not align.');
  });

  it('uses bid-adjusted final scores for the rank check', () => {
    // Winner has more raw coins but a large bid, so final scores still descend.
    const r: MatchResultInput[] = [
      { displayName: 'A', faction: 'F1', playerMat: 'M1', coins: 60, rank: 1, bid: 20 }, // final 40
      { displayName: 'B', faction: 'F2', playerMat: 'M2', coins: 35, rank: 2, bid: 0 }, // final 35
    ];
    expect(() => validateMatch(6, r)).not.toThrow();
  });
});
