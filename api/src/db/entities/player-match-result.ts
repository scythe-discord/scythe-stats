import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import Faction from './faction';
import PlayerMat from './player-mat';
import Player from './player';
import Match from './match';

@Entity()
export default class PlayerMatchResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  coins: number;

  @ManyToOne(
    type => Player,
    player => player.playerMatchResults,
    {
      onDelete: 'CASCADE'
    }
  )
  player: Player;

  @ManyToOne(
    type => Faction,
    faction => faction.playerMatchResults,
    {
      onDelete: 'CASCADE'
    }
  )
  faction: Faction;

  @ManyToOne(
    type => PlayerMat,
    playerMat => playerMat.playerMatchResults,
    {
      onDelete: 'CASCADE'
    }
  )
  playerMat: PlayerMat;

  @ManyToOne(
    type => Match,
    match => match.playerMatchResults,
    {
      onDelete: 'CASCADE'
    }
  )
  match: Match[];
}
