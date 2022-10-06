import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';

import BidGame from './bid-game';
import PlayerMatchResult from './player-match-result';

@Entity()
export default class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numRounds: number;

  @Column({ type: 'timestamptz' })
  datePlayed: Date;

  @Column({ type: 'varchar', nullable: true })
  recordingUserId: string;

  @OneToMany(
    () => PlayerMatchResult,
    (playerMatchResult) => playerMatchResult.match
  )
  playerMatchResults: PlayerMatchResult[];

  @OneToOne(() => BidGame, (bidGame) => bidGame.match)
  bidGame: BidGame | null;
}
