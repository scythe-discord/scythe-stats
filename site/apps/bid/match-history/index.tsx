import { FC } from 'react';

import GQL from 'lib/graphql';

import Card from '../../landing-page/card';
import MatchHistoryHeader from './match-history-header';

interface Props {
  factions: GQL.FactionsQuery;
  playerMats: GQL.PlayerMatsQuery;
  bidPresets: GQL.BidPresetsQuery;
}

const RecentMatches: FC<Props> = ({ factions, playerMats, bidPresets }) => {
  return (
    <Card>
      <MatchHistoryHeader
        factions={factions}
        playerMats={playerMats}
        bidPresets={bidPresets}
      />
    </Card>
  );
};

export default RecentMatches;
