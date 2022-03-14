import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import BidGameCombo from './bid-game-combo';
import BidGamePlayer from './bid-game-player';

@Entity()
export default class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  coins: number;

  @OneToOne(() => BidGamePlayer, (bidGamePlayer) => bidGamePlayer.bid, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  bidGamePlayer: BidGamePlayer;

  @Column()
  date: Date;

  @OneToOne(() => BidGameCombo, (bidGameCombo) => bidGameCombo.bid, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  bidGameCombo: BidGameCombo;
}
