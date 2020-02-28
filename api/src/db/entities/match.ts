import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn
} from 'typeorm';

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
    () => PlayerMatchResult,
    playerMatchResult => playerMatchResult.match
  )
  playerMatchResults: PlayerMatchResult[];

  // Exists because in cases of ties, we cannot calculate
  // the winner solely from coins - it needs to be determined
  // at the time of logging
  @OneToOne(() => PlayerMatchResult)
  @JoinColumn()
  winner: PlayerMatchResult;
}
