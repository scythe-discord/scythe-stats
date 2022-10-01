import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  OneToOne,
} from 'typeorm';

import Faction from './faction';
import PlayerMat from './player-mat';
import Player from './player';
import Match from './match';
import BidGamePlayer from './bid-game-player';

@Entity()
@Unique(['match', 'faction'])
@Unique(['match', 'playerMat'])
@Unique(['match', 'player'])
@Unique(['match', 'rank'])
export default class PlayerMatchResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  coins: number;

  // deprecated, use rank instead
  @Column({ default: 0 })
  tieOrder: number;

  @Column({ type: 'int' })
  rank: number;

  @OneToOne(
    () => BidGamePlayer,
    (bidGamePlayer) => bidGamePlayer.playerMatchResult,
    { nullable: true, eager: true, onDelete: 'CASCADE' }
  )
  bidGamePlayer: BidGamePlayer | null;

  @ManyToOne(() => Player, (player) => player.playerMatchResults, {
    onDelete: 'CASCADE',
  })
  player: Player;

  @ManyToOne(() => Faction, (faction) => faction.playerMatchResults, {
    onDelete: 'CASCADE',
  })
  faction: Faction;

  @ManyToOne(() => PlayerMat, (playerMat) => playerMat.playerMatchResults, {
    onDelete: 'CASCADE',
  })
  playerMat: PlayerMat;

  @ManyToOne(() => Match, (match) => match.playerMatchResults, {
    onDelete: 'CASCADE',
  })
  match: Match;

  @Column({ type: 'jsonb', nullable: true })
  playerTrueskill: {
    before: {
      sigma: number;
      mu: number;
    };
    after: {
      sigma: number;
      mu: number;
    };
  } | null;
}
