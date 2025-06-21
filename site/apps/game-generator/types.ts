import { Faction } from 'lib/graphql/codegen';
import { PlayerMat } from 'lib/graphql/codegen';

export interface Combo {
  factionId: number;
  playerMatId: number;
}

export interface GeneratedCombo {
  faction: Faction;
  playerMat: PlayerMat;
  playerName: string;
}
