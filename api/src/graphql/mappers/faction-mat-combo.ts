import { Faction, PlayerMat } from '../../db/entities';

export interface FactionMatComboBase {
  faction: Faction;
  playerMat: PlayerMat;
}
