import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import PlayerMatchResult from './player-match-result';
import User from './user';

@Entity()
export default class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true, where: '"steamId" IS NULL AND "userId" IS NULL' })
  displayName: string;

  @Column({ type: 'varchar', nullable: true })
  steamId: string | null;

  @OneToMany(
    () => PlayerMatchResult,
    (playerMatchResult) => playerMatchResult.player
  )
  playerMatchResults: PlayerMatchResult[];

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @OneToOne(() => User, (user) => user.player)
  @JoinColumn({ name: 'userId' })
  user: User | null;
}
