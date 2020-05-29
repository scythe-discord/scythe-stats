import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import PlayerMatchResult from './player-match-result';
import MatComboTier from './mat-combo-tier';

@Entity()
export default class PlayerMat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  abbrev: string;

  @OneToMany(
    () => PlayerMatchResult,
    (playerMatchResult) => playerMatchResult.playerMat
  )
  playerMatchResults: PlayerMatchResult[];

  @OneToMany(() => MatComboTier, (matComboTier) => matComboTier.playerMat)
  matComboTiers: MatComboTier[];
}
