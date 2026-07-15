import { describe, expect, it } from 'vitest';
import {
  assignCombos,
  type Combo,
  getActivePlayerId,
  isBiddingComplete,
  type QuickBidPlayer,
  resolveQuickBids,
} from './bidding';

describe('getActivePlayerId', () => {
  const players = [
    { id: 1, order: 1, hasBid: false },
    { id: 2, order: 2, hasBid: false },
    { id: 3, order: 3, hasBid: false },
  ];

  it('starts with the lowest-order player when nobody has bid', () => {
    expect(getActivePlayerId(players, [])).toBe(1);
  });

  it('advances to the next player after a bid', () => {
    const after = [{ ...players[0]!, hasBid: true }, players[1]!, players[2]!];
    expect(getActivePlayerId(after, [1])).toBe(2);
  });

  it('returns the last remaining player', () => {
    const state = [
      { id: 1, order: 1, hasBid: true },
      { id: 2, order: 2, hasBid: true },
      { id: 3, order: 3, hasBid: false },
    ];
    expect(getActivePlayerId(state, [1, 2])).toBe(3);
  });
});

describe('isBiddingComplete', () => {
  it('is true only when every combo has a bid', () => {
    expect(isBiddingComplete([{ hasBid: true }, { hasBid: true }])).toBe(true);
    expect(isBiddingComplete([{ hasBid: true }, { hasBid: false }])).toBe(false);
    expect(isBiddingComplete([])).toBe(false);
  });
});

describe('assignCombos', () => {
  it('assigns combos with no shared faction or mat', () => {
    const combos: Combo[] = [
      { factionId: 1, playerMatId: 1 },
      { factionId: 2, playerMatId: 2 },
      { factionId: 3, playerMatId: 3 },
    ];
    const result = assignCombos(2, combos);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    expect(new Set(result?.map((c) => c.factionId)).size).toBe(2);
    expect(new Set(result?.map((c) => c.playerMatId)).size).toBe(2);
  });

  it('returns null when no valid assignment exists', () => {
    // Both combos share a faction -> can't seat two players.
    const combos: Combo[] = [
      { factionId: 1, playerMatId: 1 },
      { factionId: 1, playerMatId: 2 },
    ];
    expect(assignCombos(2, combos)).toBeNull();
  });
});

describe('resolveQuickBids', () => {
  it('awards a contested combo to the higher valuation and frees the loser', () => {
    // Both players want combo 101; A values it 5, B values it 3.
    const players: QuickBidPlayer[] = [
      {
        id: 1,
        order: 1,
        quickBids: [
          { comboId: 101, bidCoins: 5, order: 1 },
          { comboId: 102, bidCoins: 0, order: 2 },
        ],
      },
      {
        id: 2,
        order: 2,
        quickBids: [
          { comboId: 101, bidCoins: 3, order: 1 },
          { comboId: 102, bidCoins: 0, order: 2 },
        ],
      },
    ];

    const result = resolveQuickBids(players, [101, 102]);

    // A outbids B for 101 (settling just above B's willingness); B takes 102 free.
    expect(result.get(101)).toEqual({ playerId: 1, bidCoins: 4 });
    expect(result.get(102)).toEqual({ playerId: 2, bidCoins: 0 });
  });

  it('gives each player an uncontested combo at zero', () => {
    const players: QuickBidPlayer[] = [
      { id: 1, order: 1, quickBids: [{ comboId: 1, bidCoins: 10, order: 1 }] },
      { id: 2, order: 2, quickBids: [{ comboId: 2, bidCoins: 10, order: 1 }] },
    ];
    const result = resolveQuickBids(players, [1, 2]);
    expect(result.get(1)).toEqual({ playerId: 1, bidCoins: 0 });
    expect(result.get(2)).toEqual({ playerId: 2, bidCoins: 0 });
  });
});
