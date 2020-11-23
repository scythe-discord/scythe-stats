import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';

import PlayerMatchResult from './player-match-result';

@Entity()
export default class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true, where: '"steamId" IS NULL' })
  displayName: string;

  @Column({ type: 'varchar', nullable: true })
  steamId: string | null;

  @OneToMany(
    () => PlayerMatchResult,
    (playerMatchResult) => playerMatchResult.player
  )
  playerMatchResults: PlayerMatchResult[];
}
