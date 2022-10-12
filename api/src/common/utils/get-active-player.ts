import { BidGame } from '../../db/entities';
import BidGamePlayer from '../../db/entities/bid-game-player';

export function getActivePlayer(bidGame: BidGame): BidGamePlayer | undefined {
  let playersWithoutBids = bidGame.players
    .filter((player) => !player.bid)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const history = bidGame.bidHistory;

  for (let i = 0; i < history.length; i++) {
    if (playersWithoutBids.length === 1) {
      return playersWithoutBids[0];
    }
    const curr = history[history.length - 1 - i];
    playersWithoutBids = playersWithoutBids.filter(
      (p) => p.id !== curr.playerId
    );
  }

  return playersWithoutBids[0];
}
