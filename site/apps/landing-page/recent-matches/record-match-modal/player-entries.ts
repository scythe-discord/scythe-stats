import { Value, OnChangeParams } from 'baseui/select';

export interface PlayerEntry {
  id: number;
  bidGamePlayerId?: number;
  bidCoins?: number;
  player: Value;
  faction: Value;
  playerMat: Value;
  coins: string;
  rank: Value;
}

export type PlayerEntryAction =
  | {
      type: 'update';
      id: number;
      field: 'player' | 'faction' | 'playerMat' | 'rank';
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
