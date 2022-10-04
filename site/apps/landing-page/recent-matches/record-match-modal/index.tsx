import React, { FC, useState, useCallback, useReducer, Reducer } from 'react';
import { useApolloClient } from '@apollo/client';
import { useStyletron } from 'baseui';
import { KIND } from 'baseui/button';
import { toaster } from 'baseui/toast';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  ModalProps,
  SIZE,
} from 'baseui/modal';
import GQL from 'lib/graphql';

import {
  getFinalScore,
  PlayerEntry,
  PlayerEntryAction,
} from './player-entries';
import RecordMatchForm from './record-match-form';
import { BidGameFragment } from 'lib/graphql/codegen';
import { ParagraphSmall } from 'baseui/typography';
import { arrayMove, arrayRemove } from 'baseui/dnd-list';
import { StyledLink } from 'baseui/link';

interface Props {
  factions: Pick<GQL.Faction, 'id' | 'name'>[];
  playerMats: Pick<GQL.PlayerMat, 'id' | 'name'>[];
  bidGame?: BidGameFragment;
}

const defaultPlayerEntry = {
  player: [],
  faction: [],
  playerMat: [],
  rank: [],
  coins: '',
};

const playerEntriesReducer = (
  playerEntries: PlayerEntry[],
  action: PlayerEntryAction
) => {
  switch (action.type) {
    case 'sort':
      return [...playerEntries].sort(
        (a, b) => getFinalScore(b) - getFinalScore(a)
      );
    case 'reorder':
      return action.newIndex === -1
        ? arrayRemove(playerEntries, action.oldIndex)
        : arrayMove(playerEntries, action.oldIndex, action.newIndex);
    case 'update':
      return playerEntries.map((val) => {
        if (val.id !== action.id) {
          return val;
        }

        return {
          ...val,
          [action.field]:
            action.field === 'coins' ? action.value : action.params.value,
        };
      });
    case 'add':
      if (playerEntries.length >= 7) {
        return playerEntries;
      }

      return [
        ...playerEntries,
        {
          id: playerEntries.length
            ? playerEntries[playerEntries.length - 1].id + 1
            : 0,
          ...defaultPlayerEntry,
        },
      ];
    case 'remove':
      return playerEntries.filter(({ id }) => id !== action.id);
    case 'clear':
      return [
        {
          id: 0,
          ...defaultPlayerEntry,
          possibleRanks: [0, 1],
        },
        {
          id: 1,
          ...defaultPlayerEntry,
          possibleRanks: [0, 1],
        },
      ];
  }
};

const RecordMatchModal: FC<ModalProps & Props> = ({
  factions,
  playerMats,
  bidGame,
  ...modalProps
}) => {
  const [css, theme] = useStyletron();
  const client = useApolloClient();
  const [numRounds, setNumRounds] = useState<string>('');
  const playersWithCombos = bidGame?.players.map((player) => ({
    ...player,
    combo: bidGame.combos?.find((combo) => combo.bid?.id === player.bid?.id),
  }));
  const initialState: PlayerEntry[] = playersWithCombos
    ? playersWithCombos.map((p, idx) => {
        return {
          id: idx,
          player: [{ label: p.user.username }],
          faction: [{ id: p.combo?.faction.id, label: p.combo?.faction.name }],
          playerMat: [
            { id: p.combo?.playerMat.id, label: p.combo?.playerMat.name },
          ],
          coins: '',
          bidGamePlayerId: p.id,
          bidCoins: p.combo?.bid?.coins,
        };
      })
    : [
        {
          id: 0,
          ...defaultPlayerEntry,
        },
        {
          id: 1,
          ...defaultPlayerEntry,
        },
      ];
  const [playerEntries, dispatchPlayerEntries] = useReducer<
    Reducer<PlayerEntry[], PlayerEntryAction>
  >(playerEntriesReducer, initialState);

  const [shouldPostMatchLog, setShouldPostMatchLog] = useState(true);
  const [formError, setFormError] = useState<React.ReactNode>(null);
  const [logMatchMutation, { loading: logMatchLoading }] =
    GQL.useLogMatchMutation();

  const onCancel = useCallback(() => {
    if (modalProps.onClose) {
      modalProps.onClose({ closeSource: 'closeButton' });
    }
  }, [modalProps.onClose]);

  const onConfirm = useCallback(async () => {
    let error = null;
    const intRegex = /^[0-9]\d*$/;
    const numRoundsAsNum = Number.parseInt(numRounds);
    if (Number.isNaN(numRoundsAsNum) || !intRegex.test(numRounds)) {
      error = 'Enter a valid number of rounds played.';
    }

    let lastFinalScore: number | undefined;

    playerEntries.forEach((entry) => {
      if (
        !entry.player.length ||
        !entry.faction.length ||
        !entry.playerMat.length ||
        entry.coins === '' ||
        numRounds === ''
      ) {
        error = 'One or more fields is missing.';
      }

      const coinsAsNum = Number.parseInt(entry.coins);

      if (Number.isNaN(coinsAsNum) || !intRegex.test(entry.coins)) {
        error = 'Coins must be valid non-negative integers.';
      }

      const finalScore = getFinalScore(entry);

      if (lastFinalScore != null && coinsAsNum > lastFinalScore) {
        if (bidGame) {
          error = 'Players must be sorted in rank order after bids.';
        } else {
          error = 'Players must be sorted in rank order.';
        }
      }
      lastFinalScore = finalScore;
    });

    if (error) {
      setFormError(error);
      return;
    }

    const playerMatchResults: GQL.PlayerMatchResultInput[] = playerEntries.map(
      (entry, idx) => ({
        displayName: entry.player[0].label as string,
        faction: entry.faction[0].label as string,
        playerMat: entry.playerMat[0].label as string,
        coins: Number.parseInt(entry.coins),
        rank: idx + 1,
        bidGamePlayerId: entry.bidGamePlayerId,
      })
    );

    try {
      const res = await logMatchMutation({
        variables: {
          datePlayed: new Date().toISOString(),
          numRounds: numRoundsAsNum,
          playerMatchResults,
          shouldPostMatchLog,
          bidGameId: bidGame?.id,
        },
      });

      const existingMatches = client.readQuery<
        GQL.MatchesQuery,
        GQL.MatchesQueryVariables
      >({
        query: GQL.MatchesDocument,
        variables: {
          first: 10,
        },
      });

      if (res.data && res.data.logMatch) {
        if (existingMatches) {
          const loggedMatch = res.data.logMatch;
          client.writeQuery<GQL.MatchesQuery, GQL.MatchesQueryVariables>({
            query: GQL.MatchesDocument,
            variables: {
              first: 10,
            },
            data: {
              __typename: existingMatches.__typename,
              matches: {
                ...existingMatches.matches,
                edges: [
                  {
                    node: {
                      ...loggedMatch,
                    },
                    __typename: 'MatchEdge',
                  },
                  ...existingMatches.matches.edges,
                ],
              },
            },
          });
          setNumRounds('');
          dispatchPlayerEntries({ type: 'clear' });
        }

        toaster.positive(<span>Successfully recorded your match!</span>, {
          autoHideDuration: 3000,
        });

        onCancel();
      } else {
        setFormError('An unknown error occurred attempting to log your match');
      }
    } catch (e) {
      if (e.graphQLErrors && e.graphQLErrors.length) {
        setFormError(e.graphQLErrors[0].message);
      } else {
        setFormError('An unknown error occurred attempting to log your match');
      }
    }
  }, [numRounds, shouldPostMatchLog, playerEntries]);

  const playerEntriesCorrectOrder = playerEntries.reduce((acc, curr, idx) => {
    if (idx === 0) {
      return acc;
    }
    const last = playerEntries[idx - 1];
    if (getFinalScore(curr) > getFinalScore(last)) {
      return false;
    }
    return acc;
  }, true);

  return (
    <Modal
      overrides={{
        Dialog: {
          style: {
            maxWidth: '750px',
            width: '100%',
          },
        },
      }}
      closeable
      animate
      autoFocus
      size={SIZE.auto}
      {...modalProps}
    >
      <ModalHeader>Record Match</ModalHeader>
      <ModalBody
        className={css({
          overflow: 'auto',
          paddingBottom: '15px',

          [theme.mediaQuery.medium]: {
            overflow: 'visible',
          },
        })}
      >
        <RecordMatchForm
          factions={factions}
          playerMats={playerMats}
          formError={formError}
          numRounds={numRounds}
          playerEntries={playerEntries}
          shouldPostMatchLog={shouldPostMatchLog}
          onNumRoundsChange={setNumRounds}
          onShouldPostMatchLogChange={setShouldPostMatchLog}
          onPlayerEntryChange={dispatchPlayerEntries}
          isBidGame={!!bidGame}
        />
      </ModalBody>
      <ModalFooter
        className={css({
          display: 'flex',
          alignItems: 'center',
          borderTop: `1px solid ${theme.colors.primary600}`,
          justifyContent: 'space-between',
        })}
      >
        <ParagraphSmall
          className={css({ marginRight: '10px', textAlign: 'left' })}
        >
          Players must be sorted in rank order{bidGame ? ' after bids' : ''},
          and winners of ties should come first.{' '}
          {!playerEntriesCorrectOrder && (
            <>
              Click{' '}
              <StyledLink
                onClick={() => {
                  dispatchPlayerEntries({ type: 'sort' });
                }}
                className={css({ cursor: 'pointer' })}
              >
                here
              </StyledLink>{' '}
              to automatically sort based on coins.
            </>
          )}
        </ParagraphSmall>
        <div className={css({ flex: '0 0 auto' })}>
          <ModalButton kind={KIND.tertiary} onClick={onCancel}>
            Cancel
          </ModalButton>
          <ModalButton
            kind={KIND.secondary}
            onClick={onConfirm}
            isLoading={logMatchLoading}
          >
            Submit
          </ModalButton>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default RecordMatchModal;
