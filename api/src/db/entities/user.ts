import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import BidGamePlayer from './bid-game-player';
import Player from './player';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  discordId: string;

  @Column()
  discriminator: string;

  // the user's nickname in the Scythe Discord server
  @Column({ type: 'varchar', nullable: true })
  displayName: string | null;

  @OneToMany(() => BidGamePlayer, (bidGamePlayer) => bidGamePlayer.user)
  bidGamePlayers: BidGamePlayer[];

  @OneToOne(() => Player, (player) => player.user, { cascade: true })
  player: Player;
}
