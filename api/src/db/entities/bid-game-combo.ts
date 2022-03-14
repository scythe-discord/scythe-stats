import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  OneToOne,
} from 'typeorm';
import Bid from './bid';
import BidGame from './bid-game';

import Faction from './faction';
import PlayerMat from './player-mat';

@Entity()
@Unique('bid_game_combo_unique', ['bidGame', 'faction', 'playerMat'])
export default class BidGameCombo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BidGame, (bidGame) => bidGame.combos, {
    onDelete: 'CASCADE',
  })
  bidGame: BidGame;

  @ManyToOne(() => Faction, (faction) => faction.bidGameCombos, {
    onDelete: 'CASCADE',
    eager: true,
  })
  faction: Faction;

  @ManyToOne(() => PlayerMat, (playerMat) => playerMat.bidGameCombos, {
    onDelete: 'CASCADE',
    eager: true,
  })
  playerMat: PlayerMat;

  @OneToOne(() => Bid, (bid) => bid.bidGameCombo, {
    nullable: true,
    eager: true,
  })
  bid: Bid | null;
}
