import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import PlayerMatchResult from './player-match-result';

@Entity()
export default class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  steamId: string;

  @OneToMany(
    type => PlayerMatchResult,
    playerMatchResult => playerMatchResult.player
  )
  playerMatchResults: PlayerMatchResult[];
}
