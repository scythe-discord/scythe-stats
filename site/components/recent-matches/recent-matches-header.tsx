import { FC, useState, useCallback, useContext } from 'react';
import { useStyletron } from 'baseui';
import { Button, KIND, SIZE } from 'baseui/button';
import { HeadingLarge } from 'baseui/typography';

import GQL from '../../lib/graphql';
import { AuthContext, DISCORD_OAUTH_URL } from '../../lib/auth';

import RecordMatchModal from './record-match-modal';

interface Props {
  factionStats: GQL.FactionStatsQuery;
  playerMats: GQL.PlayerMatsQuery;
}

const RecentMatches: FC<Props> = ({ factionStats, playerMats }) => {
  const [css] = useStyletron();
  const [isRecordModalVisible, setIsRecordModalVisible] = useState(false);
  const { discordMe, loading: isAuthLoading } = useContext(AuthContext);

  const onClickRecordMatch = useCallback(
    () => setIsRecordModalVisible(true),
    []
  );
  const onCancelRecordMatch = useCallback(
    () => setIsRecordModalVisible(false),
    []
  );

  let recordMatchButton = null;
  if (isAuthLoading) {
    recordMatchButton = (
      <Button kind={KIND.secondary} size={SIZE.compact} isLoading={true} />
    );
  } else if (!discordMe) {
    recordMatchButton = (
      <Button
        $as="a"
        href={DISCORD_OAUTH_URL}
        kind={KIND.secondary}
        size={SIZE.compact}
      >
        Login to Record Matches
      </Button>
    );
  } else {
    recordMatchButton = (
      <Button
        kind={KIND.secondary}
        size={SIZE.compact}
        onClick={onClickRecordMatch}
      >
        Record a Match
      </Button>
    );
  }

  return (
    <>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          margin: '0 0 10px',
        })}
      >
        <HeadingLarge
          as="h1"
          overrides={{
            Block: {
              style: {
                flex: '1 1 auto',
                margin: '0 0 10px',
              },
            },
          }}
        >
          Recent Matches
        </HeadingLarge>
        {recordMatchButton}
      </div>
      <RecordMatchModal
        factions={factionStats.factions}
        playerMats={playerMats.playerMats}
        isOpen={isRecordModalVisible}
        onClose={onCancelRecordMatch}
      ></RecordMatchModal>
    </>
  );
};

export default RecentMatches;
