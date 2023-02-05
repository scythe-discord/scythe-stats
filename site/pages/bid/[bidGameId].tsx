import { useCallback, useContext, useEffect, useState } from 'react';
import { Button, KIND, SIZE } from 'baseui/button';
import { Card } from 'baseui/card';
import PlayerList from 'lib/components/bid-game/player-list';
import {
  BidGameFragmentDoc,
  BidGameStatus,
  useBidGameQuery,
  useJoinBidGameMutation,
  useStartBidGameMutation,
  useUpdateQuickBidSettingMutation,
  useUpdateRankedBidGameSettingMutation,
} from 'lib/graphql/codegen';
import { useRouter } from 'next/router';
import { gql } from '@apollo/client';
import { AuthContext } from 'lib/components';
import { HeadingSmall, LabelMedium } from 'baseui/typography';
import { useStyletron } from 'baseui';
import { StyledLink } from 'baseui/link';
import EditSettingsModal from 'apps/bid/edit-settings-modal';
import client from 'lib/apollo-client';
import GQL from 'lib/graphql';
import { NextComponentType } from 'next';
import { BaseContext } from 'next/dist/shared/lib/utils';
import ComboTableModal from 'lib/components/bid-game/combo-table-modal';
import { ToasterContainer, toaster } from 'baseui/toast';
import CombosList from 'lib/components/bid-game/combos-list';
import StatusBanner from 'lib/components/bid-game/status-banner';
import RecordMatchModal from 'apps/landing-page/recent-matches/record-match-modal';
import DiscordAuthItem from 'lib/components/site-header/discord-auth-item';
import { Checkbox, LABEL_PLACEMENT, STYLE_TYPE } from 'baseui/checkbox';
import MatchDetails from 'apps/landing-page/match-details';

const MIN_PLAYERS = 2;

interface Props {
  factions: GQL.FactionsQuery;
  playerMats: GQL.PlayerMatsQuery;
  bidPresets: GQL.BidPresetsQuery;
}

const BidGame: NextComponentType<BaseContext, Props, Props> = ({
  factions,
  playerMats,
  bidPresets,
}) => {
  const router = useRouter();
  const { discordMe } = useContext(AuthContext);
  const { bidGameId } = router.query;

  const [css, theme] = useStyletron();

  const bidGameIdAsNumber = Number(bidGameId);

  if (!Number.isInteger(bidGameIdAsNumber)) {
    throw new Error('invalid bid game id');
  }

  const { data, subscribeToMore } = useBidGameQuery({
    variables: { bidGameId: bidGameIdAsNumber },
  });

  const [updateQuickBidSetting] = useUpdateQuickBidSettingMutation();
  const [updateRankedSetting] = useUpdateRankedBidGameSettingMutation();

  const [isSettingModalVisible, setIsSettingModalVisible] = useState(false);
  const [recordMatchModalOpen, setRecordMatchModalOpen] = useState(false);

  const onClickEditSettings = useCallback(
    () => setIsSettingModalVisible(true),
    []
  );
  const onCancelEditSettings = useCallback(
    () => setIsSettingModalVisible(false),
    []
  );
  const onClickRecordMatch = useCallback(
    () => setRecordMatchModalOpen(true),
    []
  );
  const onCancelRecordMatch = useCallback(
    () => setRecordMatchModalOpen(false),
    []
  );
  const onCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.toString());
    toaster.info('Link copied to clipboard.', {
      autoHideDuration: 3000,
    });
  }, []);

  const ownPlayer =
    (data &&
      discordMe &&
      data.bidGame.players.find((p) => p.user.id === discordMe.id)) ||
    undefined;

  const isHost = Boolean(
    data && discordMe && data.bidGame.host.user.id === discordMe.id
  );

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: gql`
        subscription BidGameUpdated($bidGameId: Int!) {
          bidGameUpdated(bidGameId: $bidGameId) {
            ...BidGame
          }
        }

        ${BidGameFragmentDoc}
      `,
      variables: { bidGameId: bidGameIdAsNumber },
    });
    return unsubscribe;
  }, [subscribeToMore, bidGameIdAsNumber]);

  const [joinBidGame, { loading: joinBidGameLoading }] = useJoinBidGameMutation(
    {
      variables: { bidGameId: bidGameIdAsNumber },
      onError: (err) => {
        err.graphQLErrors.forEach(({ message }) => {
          toaster.negative(message, {});
        });
      },
    }
  );

  const [startBidGame, { loading: startBidGameLoading }] =
    useStartBidGameMutation({
      variables: { bidGameId: bidGameIdAsNumber },
      onError: (err) => {
        err.graphQLErrors.forEach(({ message }) => {
          toaster.negative(message, {});
        });
      },
    });

  return (
    <div
      className={css({
        minHeight: '100vh',
        backgroundColor: theme.colors.backgroundPrimary,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '40px 20px',
        [theme.mediaQuery.medium]: {
          padding: '40px',
        },
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
        })}
      >
        {data && (
          <>
            <div
              className={css({
                display: 'flex',
                gap: '20px',
                flexDirection: 'column',

                [theme.mediaQuery.medium]: {
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                },
              })}
            >
              <div
                className={css({
                  flex: '1 0 auto',

                  [theme.mediaQuery.medium]: {
                    flex: '0 1 280px',
                  },
                })}
              >
                <Card>
                  <div>
                    <div
                      className={css({
                        display: 'flex',
                        gap: '16px',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      })}
                    >
                      <HeadingSmall
                        as="h3"
                        overrides={{
                          Block: {
                            style: {
                              marginTop: 0,
                              marginBottom: '10px',
                            },
                          },
                        }}
                      >
                        Bid Game
                      </HeadingSmall>
                      <Button
                        kind={KIND.secondary}
                        size={SIZE.compact}
                        onClick={onCopyLink}
                      >
                        Share
                      </Button>
                    </div>
                    {data && (
                      <>
                        <LabelMedium>
                          {new Date(data.bidGame.createdAt).toLocaleDateString(
                            undefined,
                            {
                              dateStyle: 'medium',
                            }
                          )}
                          <br />
                        </LabelMedium>
                        <LabelMedium>
                          Game setting:{' '}
                          <StyledLink
                            onClick={onClickEditSettings}
                            className={css({ cursor: 'pointer' })}
                          >
                            {data.bidGame.bidPreset?.name ?? 'Custom'}
                          </StyledLink>
                        </LabelMedium>
                        {isHost &&
                        data.bidGame.status === BidGameStatus.Created ? (
                          <>
                            <div className={css({ marginTop: '20px' })}>
                              <Checkbox
                                checked={data.bidGame.quickBid}
                                onChange={async (e) => {
                                  updateQuickBidSetting({
                                    variables: {
                                      bidGameId: bidGameIdAsNumber,
                                      quickBid: e.target.checked,
                                    },
                                  });
                                }}
                                checkmarkType={STYLE_TYPE.toggle_round}
                                labelPlacement={LABEL_PLACEMENT.right}
                              >
                                Quick Bid
                              </Checkbox>
                            </div>
                            <div className={css({ marginTop: '20px' })}>
                              <Checkbox
                                checked={data.bidGame.ranked}
                                onChange={async (e) => {
                                  updateRankedSetting({
                                    variables: {
                                      bidGameId: bidGameIdAsNumber,
                                      ranked: e.target.checked,
                                    },
                                  });
                                }}
                                checkmarkType={STYLE_TYPE.toggle_round}
                                labelPlacement={LABEL_PLACEMENT.right}
                              >
                                Ranked
                              </Checkbox>
                            </div>
                          </>
                        ) : (
                          <>
                            {data.bidGame.quickBid && (
                              <LabelMedium>Quick Bid</LabelMedium>
                            )}
                            {data.bidGame.ranked && (
                              <LabelMedium>Ranked</LabelMedium>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <PlayerList
                    players={data?.bidGame.players}
                    hostPlayerId={data.bidGame.host.id}
                    ownPlayer={ownPlayer}
                  />
                  {discordMe && !ownPlayer && (
                    <Button
                      onClick={() => {
                        joinBidGame();
                      }}
                      kind={KIND.secondary}
                      size={SIZE.compact}
                      isLoading={joinBidGameLoading}
                    >
                      Join Bid Game
                    </Button>
                  )}
                  {!discordMe && (
                    <DiscordAuthItem isNavItem={false}>
                      Login with Discord
                    </DiscordAuthItem>
                  )}
                  {discordMe &&
                    isHost &&
                    data.bidGame.status === BidGameStatus.Created && (
                      <Button
                        onClick={() => {
                          startBidGame();
                        }}
                        kind={KIND.secondary}
                        size={SIZE.compact}
                        disabled={data.bidGame.players.length < MIN_PLAYERS}
                        isLoading={startBidGameLoading}
                      >
                        Start Bid Game
                      </Button>
                    )}
                  {discordMe &&
                    ownPlayer &&
                    data.bidGame.status === BidGameStatus.BiddingFinished && (
                      <Button
                        onClick={onClickRecordMatch}
                        kind={KIND.secondary}
                        size={SIZE.compact}
                        disabled={data.bidGame.players.length < MIN_PLAYERS}
                        isLoading={startBidGameLoading}
                      >
                        Record Match Results
                      </Button>
                    )}
                </Card>
              </div>
              <div
                className={css({
                  flex: '1 0 auto',

                  [theme.mediaQuery.medium]: {
                    flex: '1 1 280px',
                  },
                })}
              >
                {data &&
                  (data.bidGame.match ? (
                    <MatchDetails
                      selectedMatch={data.bidGame.match}
                      bidGamePage
                    />
                  ) : (
                    <CombosList
                      // initialize when combos are first loaded
                      key={JSON.stringify(data.bidGame.combos)}
                      bidGame={data.bidGame}
                      ownPlayer={ownPlayer}
                    />
                  ))}

                <StatusBanner
                  bidGame={data.bidGame}
                  onClickEditGameSettings={onClickEditSettings}
                  onClickStartGame={() => {
                    startBidGame();
                  }}
                  onClickJoinGame={() => {
                    joinBidGame();
                  }}
                  joinGameLoading={joinBidGameLoading}
                  startGameLoading={startBidGameLoading}
                  ownPlayer={ownPlayer}
                  onCopyLink={onCopyLink}
                />
              </div>
            </div>
          </>
        )}
      </div>
      {isHost && data?.bidGame.status === BidGameStatus.Created ? (
        <EditSettingsModal
          isOpen={isSettingModalVisible}
          factions={factions}
          playerMats={playerMats}
          bidPresets={bidPresets}
          onClose={onCancelEditSettings}
          bidGameId={bidGameIdAsNumber}
        />
      ) : (
        <ComboTableModal
          isOpen={isSettingModalVisible}
          factions={factions}
          playerMats={playerMats}
          onClose={onCancelEditSettings}
          bidPresetName={data?.bidGame.bidPreset?.name}
          combos={data?.bidGame.enabledCombos || undefined}
        />
      )}
      {data?.bidGame.status === BidGameStatus.BiddingFinished && (
        <RecordMatchModal
          isOpen={recordMatchModalOpen}
          factions={factions.factions}
          playerMats={playerMats.playerMats}
          bidGame={data.bidGame}
          onClose={onCancelRecordMatch}
        />
      )}
      <ToasterContainer />
    </div>
  );
};

export const getServerSideProps = async () => {
  const { data: factions } = await client.query<
    GQL.FactionsQuery,
    GQL.FactionsQueryVariables
  >({
    query: GQL.FactionsDocument,
    fetchPolicy: 'no-cache',
  });
  const { data: playerMats } = await client.query<GQL.PlayerMatsQuery>({
    query: GQL.PlayerMatsDocument,
    fetchPolicy: 'no-cache',
  });
  const { data: bidPresets } = await client.query<GQL.BidPresetsQuery>({
    query: GQL.BidPresetsDocument,
    fetchPolicy: 'no-cache',
  });

  return {
    props: {
      factions,
      playerMats,
      bidPresets,
      initialApolloState: client.cache.extract(),
    },
  };
};

export default BidGame;
