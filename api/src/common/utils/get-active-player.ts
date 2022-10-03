import { BidGame } from '../../db/entities';
import BidGamePlayer from '../../db/entities/bid-game-player';

export function getActivePlayer(bidGame: BidGame): BidGamePlayer | undefined {
  return bidGame.players
    .filter((player) => !player.bid)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
}
