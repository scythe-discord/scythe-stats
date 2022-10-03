import { FC, useState, useCallback, useReducer, Reducer } from 'react';
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

import { PlayerEntry, PlayerEntryAction } from './player-entries';
import RecordMatchForm from './record-match-form';
import { BidGameFragment } from 'lib/graphql/codegen';

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
    case 'update': {
      const newPlayerEntries = playerEntries.map((val) => {
        if (val.id !== action.id) {
          return val;
        }

        return {
          ...val,
          [action.field]:
            action.field === 'coins' ? action.value : action.params.value,
        };
      });

      if (action.field !== 'coins') {
        return newPlayerEntries;
      }

      const idToPossibleRankMap = getIdsToPossibleRankMap(newPlayerEntries);

      return newPlayerEntries.map((val) => {
        const possibleRanks = idToPossibleRankMap[val.id];
        return {
          ...val,
          rank:
            possibleRanks.length === 1
              ? [{ id: possibleRanks[0], label: possibleRanks[0] }]
              : [],
        };
      });
    }
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

const getFinalScore = (playerEntry: PlayerEntry) => {
  return Number(playerEntry.coins) - (playerEntry.bidCoins ?? 0);
};

const getIdsToPossibleRankMap = (playerEntries: Array<PlayerEntry>) => {
  const sortedPlayerEntries = [...playerEntries].sort(
    (a, b) => getFinalScore(b) - getFinalScore(a)
  );

  let lastCoinValue = getFinalScore(sortedPlayerEntries[0]);
  const idToPossibleRankMap: Record<number, number[]> = {};
  let idsToSetRanks = [sortedPlayerEntries[0].id];
  let possibleRanks = [1];
  for (let i = 1; i < sortedPlayerEntries.length; i++) {
    const entry = sortedPlayerEntries[i];
    if (getFinalScore(entry) === lastCoinValue) {
      possibleRanks.push(i + 1);
      idsToSetRanks.push(entry.id);
    } else {
      idsToSetRanks.forEach((id) => {
        idToPossibleRankMap[id] = possibleRanks;
      });
      idsToSetRanks = [entry.id];
      possibleRanks = [i + 1];
    }
    lastCoinValue = getFinalScore(entry);
  }

  idsToSetRanks.forEach((id) => {
    idToPossibleRankMap[id] = possibleRanks;
  });

  return idToPossibleRankMap;
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
          rank: [],
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

  const idToPossibleRankMap = getIdsToPossibleRankMap(playerEntries);

  const [shouldPostMatchLog, setShouldPostMatchLog] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [logMatchMutation, { loading: logMatchLoading }] =
    GQL.useLogMatchMutation();

  const onCancel = useCallback(() => {
    if (modalProps.onClose) {
      modalProps.onClose({ closeSource: 'closeButton' });
    }
  }, [modalProps.onClose]);

  const onConfirm = useCallback(async () => {
    let error = null;
    const intRegex = /^[1-9]\d*$/;
    const numRoundsAsNum = Number.parseInt(numRounds);
    if (Number.isNaN(numRoundsAsNum) || !intRegex.test(numRounds)) {
      error = 'Enter a valid number of rounds played';
    }
    const rankSet = new Set<number>();
    playerEntries.forEach((entry) => {
      if (
        !entry.player.length ||
        !entry.faction.length ||
        !entry.playerMat.length ||
        !entry.rank.length ||
        entry.coins === '' ||
        numRounds === ''
      ) {
        error = 'One or more fields are missing';
      }

      const coinsAsNum = Number.parseInt(entry.coins);

      if (Number.isNaN(coinsAsNum) || !intRegex.test(entry.coins)) {
        error = 'Coins must be valid positive integers';
      }

      const rankLabel = entry.rank[0]?.label as string;
      if (rankLabel == null) {
        error = 'Invalid rank';
      } else {
        const rankInt = Number.parseInt(rankLabel, 10);
        if (Number.isNaN(rankInt) || !intRegex.test(rankLabel)) {
          error = 'Rank must be valid positive integer';
        } else if (rankSet.has(rankInt)) {
          error = 'Ranks must be unique';
        } else {
          rankSet.add(rankInt);
        }
      }
    });

    if (error) {
      setFormError(error);
      return;
    }

    const playerMatchResults: GQL.PlayerMatchResultInput[] = playerEntries.map(
      (entry) => ({
        displayName: entry.player[0].label as string,
        faction: entry.faction[0].label as string,
        playerMat: entry.playerMat[0].label as string,
        coins: Number.parseInt(entry.coins),
        rank: Number.parseInt(entry.rank[0].label as string),
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
          idToPossibleRankMap={idToPossibleRankMap}
          isBidGame={!!bidGame}
        />
      </ModalBody>
      <ModalFooter
        className={css({
          display: 'flex',
          alignItems: 'center',
          borderTop: `1px solid ${theme.colors.primary600}`,
          justifyContent: 'flex-end',
        })}
      >
        <ModalButton kind={KIND.tertiary} onClick={onCancel}>
          Cancel
        </ModalButton>
        <ModalButton
          kind={KIND.secondary}
          onClick={onConfirm}
          isLoading={logMatchLoading}
        >
          Confirm
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

export default RecordMatchModal;
