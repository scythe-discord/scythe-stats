import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';

import Faction from './faction';
import PlayerMat from './player-mat';
import Player from './player';
import Match from './match';

@Entity()
@Unique(['match', 'faction'])
@Unique(['match', 'playerMat'])
@Unique(['match', 'player'])
@Unique(['match', 'coins', 'tieOrder'])
export default class PlayerMatchResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  coins: number;

  @Column({ default: 0 })
  tieOrder: number;

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
}
