import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { QuickBidInput } from '../../graphql/schema/codegen/generated';
import Bid from './bid';
import BidGame from './bid-game';
import PlayerMatchResult from './player-match-result';

import User from './user';

@Entity()
@Unique('bid_game_player_unique', ['bidGame', 'user'])
@Unique('bid_game_order_unique', ['bidGame', 'order'])
export default class BidGamePlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BidGame, (bidGame) => bidGame.players, {
    onDelete: 'CASCADE',
  })
  bidGame: BidGame;

  @ManyToOne(() => User, (user) => user.bidGamePlayers, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @OneToOne(() => Bid, (bid) => bid.bidGamePlayer, {
    eager: true,
    nullable: true,
  })
  bid: Bid | null;

  @Column({ type: 'timestamptz' })
  dateJoined: Date;

  @Column({ nullable: true, type: 'int' })
  order: number | null;

  @OneToOne(
    () => PlayerMatchResult,
    (playerMatchResult) => playerMatchResult.bidGamePlayer,
    {
      nullable: true,
    }
  )
  @JoinColumn()
  playerMatchResult: PlayerMatchResult | null;

  @Column({ type: 'jsonb', nullable: true })
  quickBids: QuickBidInput[] | null;
}
