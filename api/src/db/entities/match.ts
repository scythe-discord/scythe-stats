import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import PlayerMatchResult from './player-match-result';

@Entity()
export default class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numRounds: number;

  @Column()
  datePlayed: Date;

  @OneToMany(
    type => PlayerMatchResult,
    playerMatchResult => playerMatchResult.match
  )
  playerMatchResults: PlayerMatchResult[];
}
