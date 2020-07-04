import { FC, useState, useCallback, useContext } from 'react';
import { useStyletron } from 'baseui';
import { Button, KIND, SIZE } from 'baseui/button';
import { HeadingLarge } from 'baseui/typography';

import GQL from '../../../lib/graphql';
import { AuthContext, DISCORD_OAUTH_URL } from '../../../lib/components';

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

  const buttonAs = discordMe ? undefined : 'a';
  const buttonHref = discordMe ? undefined : DISCORD_OAUTH_URL;
  const buttonOnClick =
    discordMe && !isAuthLoading ? onClickRecordMatch : undefined;
  const buttonText = discordMe ? 'Record a Match' : 'Login to Record Matches';

  return (
    <>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
        })}
      >
        <HeadingLarge
          as="h1"
          overrides={{
            Block: {
              style: {
                flex: '1 1 auto',
                marginTop: 0,
                marginBottom: '15px',
              },
            },
          }}
        >
          Recent Matches
        </HeadingLarge>
        <Button
          overrides={{
            BaseButton: {
              style: {
                marginTop: 0,
                marginBottom: '15px',
              },
            },
          }}
          $as={buttonAs}
          href={buttonHref}
          kind={KIND.secondary}
          size={SIZE.compact}
          onClick={buttonOnClick}
          isLoading={isAuthLoading}
        >
          {buttonText}
        </Button>
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
