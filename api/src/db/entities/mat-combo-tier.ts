import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';

import Faction from './faction';
import PlayerMat from './player-mat';
import Tier from './tier';

@Entity()
@Unique(['faction', 'playerMat'])
export default class MatComboTier {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tier, (tier) => tier.matComboTiers, {
    onDelete: 'CASCADE',
  })
  tier: Tier;

  @ManyToOne(() => Faction, (faction) => faction.matComboTiers, {
    onDelete: 'CASCADE',
  })
  faction: Faction;

  @ManyToOne(() => PlayerMat, (playerMat) => playerMat.matComboTiers, {
    onDelete: 'CASCADE',
  })
  playerMat: PlayerMat;
}
