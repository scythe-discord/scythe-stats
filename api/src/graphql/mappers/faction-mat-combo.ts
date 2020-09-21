import { Faction, PlayerMat } from '../../db/entities';

export interface FactionMatComboBase {
  faction: Faction;
  playerMat: PlayerMat;
}

export interface FactionMatComboStatsWithPlayerCountBase {
  faction: Faction;
  playerMat: PlayerMat;
  playerCount: number;
}

export interface FactionStatsWithPlayerCountBase {
  faction: Faction;
  playerCount: number;
}
