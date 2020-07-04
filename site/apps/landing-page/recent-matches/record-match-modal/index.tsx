import { FC, useState, useCallback, useReducer, Reducer } from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import { useStyletron } from 'baseui';
import { Button, KIND, SIZE as BUTTON_SIZE } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Plus } from 'baseui/icon';
import { Input } from 'baseui/input';
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
import { Notification, KIND as NOTIFICATION_KIND } from 'baseui/notification';
import { Checkbox, LABEL_PLACEMENT } from 'baseui/checkbox';

import GQL from 'lib/graphql';

import { PlayerEntry, PlayerEntryAction } from './player-entries';
import RecordMatchRow from './record-match-row';

interface Props {
  factions: Pick<GQL.Faction, 'id' | 'name'>[];
  playerMats: Pick<GQL.PlayerMat, 'id' | 'name'>[];
}

const defaultPlayerEntry = {
  player: [],
  faction: [],
  playerMat: [],
  coins: '',
};

const playerEntriesReducer = (
  playerEntries: PlayerEntry[],
  action: PlayerEntryAction
) => {
  switch (action.type) {
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
        },
        {
          id: 1,
          ...defaultPlayerEntry,
        },
      ];
  }
};

const RecordMatchModal: FC<ModalProps & Props> = ({
  factions,
  playerMats,
  ...modalProps
}) => {
  const [css, theme] = useStyletron();
  const client = useApolloClient();
  const [numRounds, setNumRounds] = useState<string>('');
  const [playerEntries, dispatchPlayerEntries] = useReducer<
    Reducer<PlayerEntry[], PlayerEntryAction>
  >(playerEntriesReducer, [
    {
      id: 0,
      ...defaultPlayerEntry,
    },
    {
      id: 1,
      ...defaultPlayerEntry,
    },
  ]);
  const [shouldPostMatchLog, setShouldPostMatchLog] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [
    logMatchMutation,
    { loading: logMatchLoading },
  ] = GQL.useLogMatchMutation();

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
    playerEntries.forEach((entry) => {
      if (
        !entry.player.length ||
        !entry.faction.length ||
        !entry.playerMat.length ||
        entry.coins === '' ||
        numRounds === ''
      ) {
        error = 'One or more fields are missing';
      }

      const coinsAsNum = Number.parseInt(entry.coins);

      if (Number.isNaN(coinsAsNum) || !intRegex.test(entry.coins)) {
        error = 'Coins must be valid positive integers';
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
      })
    );

    try {
      const res = await logMatchMutation({
        variables: {
          datePlayed: new Date().toISOString(),
          numRounds: numRoundsAsNum,
          playerMatchResults,
          shouldPostMatchLog,
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

      if (res.data && res.data.logMatch && existingMatches) {
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
      unstable_ModalBackdropScroll={true}
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
        {formError && (
          <Notification
            kind={NOTIFICATION_KIND.negative}
            overrides={{
              Body: { style: { width: 'auto', marginBottom: '20px' } },
            }}
          >
            {formError}
          </Notification>
        )}
        <FormControl label={() => 'Rounds Played'}>
          <Input
            placeholder="Enter rounds"
            value={numRounds}
            min={1}
            type="number"
            onChange={(e) => {
              setNumRounds((e.target as HTMLInputElement).value);
            }}
            autoFocus
            overrides={{
              InputContainer: {
                style: {
                  width: '165px',
                },
              },
            }}
          />
        </FormControl>
        <FormControl label={() => 'Players'}>
          <>
            {playerEntries.map(({ id, player, faction, playerMat, coins }) => (
              <div
                key={id}
                className={css({
                  margin: '10px 0',
                })}
              >
                <RecordMatchRow
                  id={id}
                  factions={factions}
                  playerMats={playerMats}
                  player={player}
                  faction={faction}
                  playerMat={playerMat}
                  coins={coins}
                  onPlayerEntryChange={dispatchPlayerEntries}
                />
              </div>
            ))}
          </>
        </FormControl>
        <Button
          size={BUTTON_SIZE.compact}
          kind={KIND.secondary}
          startEnhancer={() => <Plus size={14} />}
          disabled={playerEntries.length >= 7}
          onClick={() => dispatchPlayerEntries({ type: 'add' })}
        >
          Add a Player
        </Button>
        <Checkbox
          overrides={{
            Root: {
              style: {
                margin: '25px 0 0',
              },
            },
          }}
          checked={shouldPostMatchLog}
          onChange={(e) =>
            setShouldPostMatchLog((e.target as HTMLInputElement).checked)
          }
          labelPlacement={LABEL_PLACEMENT.right}
        >
          Post this match in the Discord
        </Checkbox>
      </ModalBody>
      <ModalFooter
        className={css({
          display: 'flex',
          alignItems: 'center',
        })}
      >
        <small
          className={css({
            color: theme.colors.primary,
            flex: '1 1 auto',
            textAlign: 'left',
          })}
        >
          *In the event of ties, the first listed player will be the tiebreaker
        </small>
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
