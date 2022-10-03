import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Combo } from '../../common/utils/types';
import { BidGameStatus } from '../../graphql/schema/codegen/generated';

import BidGameCombo from './bid-game-combo';
import BidGamePlayer from './bid-game-player';
import BidPreset from './bid-preset';
import Match from './match';

@Entity()
@Index(['ranked', 'status'])
export default class BidGame {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => BidGamePlayer, (player) => player.bidGame, {
    cascade: true,
    eager: true,
  })
  players: BidGamePlayer[];

  @OneToOne(() => BidGamePlayer, { cascade: true, eager: true })
  @JoinColumn()
  host: BidGamePlayer;

  @OneToOne(() => Match, (match) => match.bidGame, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  match: Match | null;

  @Column({ type: 'enum', enum: BidGameStatus, default: BidGameStatus.Created })
  status: BidGameStatus;

  @ManyToOne(() => BidPreset, (bidPreset) => bidPreset.bidGames, {
    nullable: true,
    eager: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  bidPreset: BidPreset | null;

  @OneToMany(() => BidGameCombo, (bidGameCombo) => bidGameCombo.bidGame, {
    nullable: true,
    eager: true,
    cascade: true,
  })
  combos: BidGameCombo[] | null;

  @Column()
  createdAt: Date;

  @Column()
  modifiedAt: Date;

  @Column({ type: 'int', nullable: true })
  bidTimeLimitSeconds: number | null;

  @Column({ type: 'jsonb', nullable: true })
  enabledCombos: Array<Combo> | null;

  @Column({ type: 'jsonb', default: [] })
  bidHistory: Array<Combo & { coins: number; playerId: number; date: Date }>;

  @Column({ type: 'boolean', default: false })
  quickBid: boolean;

  @Column({ type: 'boolean', default: false })
  ranked: boolean;
}
