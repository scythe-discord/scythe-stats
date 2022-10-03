import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';

import Faction from './faction';
import PlayerMat from './player-mat';
import BidPreset from './bid-preset';

@Entity()
@Unique(['bidPreset', 'faction', 'playerMat'])
export default class BidPresetSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  enabled: boolean;

  @ManyToOne(() => BidPreset, (bidPreset) => bidPreset.bidPresetSettings, {
    onDelete: 'CASCADE',
  })
  bidPreset: BidPreset;

  @ManyToOne(() => Faction, (faction) => faction.bidPresetSettings, {
    onDelete: 'CASCADE',
    eager: true,
  })
  faction: Faction;

  @ManyToOne(() => PlayerMat, (playerMat) => playerMat.bidPresetSettings, {
    onDelete: 'CASCADE',
    eager: true,
  })
  playerMat: PlayerMat;
}
