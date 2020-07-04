import { Value, OnChangeParams } from 'baseui/select';

export interface PlayerEntry {
  id: number;
  player: Value;
  faction: Value;
  playerMat: Value;
  coins: string;
}

export type PlayerEntryAction =
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
