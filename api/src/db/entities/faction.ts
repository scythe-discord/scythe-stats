import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import PlayerMatchResult from './player-match-result';
import MatComboTier from './mat-combo-tier';
import BidPresetSetting from './bid-preset-setting';

@Entity()
export default class Faction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => PlayerMatchResult,
    (playerMatchResult) => playerMatchResult.faction
  )
  playerMatchResults: PlayerMatchResult[];

  @OneToMany(() => MatComboTier, (matComboTier) => matComboTier.faction)
  matComboTiers: MatComboTier[];

  @OneToMany(
    () => BidPresetSetting,
    (bidPresetSetting) => bidPresetSetting.faction
  )
  bidPresetSettings: BidPresetSetting[];
}
