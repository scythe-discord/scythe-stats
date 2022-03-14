import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import PlayerMatchResult from './player-match-result';
import MatComboTier from './mat-combo-tier';
import BidPresetSetting from './bid-preset-setting';
import BidGameCombo from './bid-game-combo';

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

  @OneToMany(() => BidGameCombo, (bidGameCombo) => bidGameCombo.faction)
  bidGameCombos: BidGameCombo[];

  // number that shows relative position of the faction on the map
  // e.g. if Polania is 1, then Albion 2, Nordic 3, Rusviet 4...
  // used for ordering combinations in turn order
  @Column({ unique: true })
  position: number;
}
