import { Value, OnChangeParams } from 'baseui/select';

export interface PlayerEntry {
  id: number;
  bidGamePlayerId?: number;
  bidCoins?: number;
  player: Value;
  faction: Value;
  playerMat: Value;
  coins: string;
}

export type PlayerEntryAction =
  | {
      type: 'sort';
    }
  | {
      type: 'reorder';
      oldIndex: number;
      newIndex: number;
    }
  | {
      type: 'update';
      id: number;
      field: 'player' | 'faction' | 'playerMat';
      params: OnChangeParams;
    }
  | {
      type: 'update';
      id: number;
      field: 'coins';
      value: string;
    }
  | {
      type: 'add';
    }
  | {
      type: 'remove';
      id: number;
    }
  | {
      type: 'clear';
    };

export const getFinalScore = (playerEntry: PlayerEntry) => {
  return Number(playerEntry.coins) - (playerEntry.bidCoins ?? 0);
};
