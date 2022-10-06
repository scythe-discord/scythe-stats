import { FC, Dispatch, SetStateAction } from 'react';
import { useStyletron } from 'baseui';
import { Button, KIND, SIZE as BUTTON_SIZE } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Plus } from 'baseui/icon';
import { Input } from 'baseui/input';
import { Notification, KIND as NOTIFICATION_KIND } from 'baseui/notification';
import { Checkbox, LABEL_PLACEMENT } from 'baseui/checkbox';

import GQL from 'lib/graphql';

import { PlayerEntry, PlayerEntryAction } from './player-entries';
import RecordMatchRow from './record-match-row';
import { BidGameFragment } from 'lib/graphql/codegen';
import { List } from 'baseui/dnd-list';

interface Props {
  factions: Pick<GQL.Faction, 'id' | 'name'>[];
  playerMats: Pick<GQL.PlayerMat, 'id' | 'name'>[];
  bidGame?: BidGameFragment;
  playerEntries: PlayerEntry[];
  formError?: React.ReactNode;
  numRounds: string;
  shouldPostMatchLog: boolean;
  onNumRoundsChange: Dispatch<SetStateAction<string>>;
  onShouldPostMatchLogChange: Dispatch<SetStateAction<boolean>>;
  onPlayerEntryChange: Dispatch<PlayerEntryAction>;
  isBidGame?: boolean;
}

const RecordMatchForm: FC<Props> = ({
  factions,
  playerMats,
  playerEntries,
  numRounds,
  formError,
  shouldPostMatchLog,
  onNumRoundsChange,
  onShouldPostMatchLogChange,
  onPlayerEntryChange,
  isBidGame,
}) => {
  const [css] = useStyletron();

  return (
    <>
      {formError && (
        <Notification
          kind={NOTIFICATION_KIND.negative}
          overrides={{
            Body: { style: { width: 'auto', margin: '0px 0px 20px' } },
          }}
        >
          {formError}
        </Notification>
      )}
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          alignItems: 'flex-end',
          marginBottom: '15px',
        })}
      >
        <div>
          <FormControl
            label={() => 'Rounds Played'}
            overrides={{
              ControlContainer: {
                style: () => ({ margin: '0px' }),
              },
            }}
          >
            <Input
              placeholder="Enter rounds"
              value={numRounds}
              min={1}
              type="number"
              onChange={(e) => {
                onNumRoundsChange((e.target as HTMLInputElement).value);
              }}
              autoFocus
              overrides={{
                Root: {
                  style: {
                    width: '165px',
                  },
                },
              }}
            />
          </FormControl>
        </div>
      </div>
      <FormControl>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          })}
        >
          <List
            removable={!isBidGame}
            overrides={{
              List: {
                style: () => ({
                  margin: '0px',
                }),
              },
              Label: {
                style: () => ({
                  minWidth: '0px',
                }),
              },
              Item: {
                style: () => ({
                  padding: '5px',
                }),
              },
            }}
            items={playerEntries.map(
              ({
                id,
                player,
                faction,
                playerMat,
                coins,
                bidCoins,
                bidGamePlayerId,
              }) => {
                return (
                  <RecordMatchRow
                    key={id}
                    id={id}
                    factions={factions}
                    playerMats={playerMats}
                    player={player}
                    faction={faction}
                    playerMat={playerMat}
                    coins={coins}
                    onPlayerEntryChange={onPlayerEntryChange}
                    bidCoins={bidCoins}
                    bidGamePlayerId={bidGamePlayerId}
                  />
                );
              }
            )}
            onChange={({ oldIndex, newIndex }) => {
              onPlayerEntryChange({ type: 'reorder', oldIndex, newIndex });
            }}
          />
        </div>
      </FormControl>
      {!isBidGame && (
        <Button
          size={BUTTON_SIZE.compact}
          kind={KIND.secondary}
          startEnhancer={() => <Plus size={14} />}
          disabled={playerEntries.length >= 7}
          onClick={() => onPlayerEntryChange({ type: 'add' })}
        >
          Add a Player
        </Button>
      )}
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
          onShouldPostMatchLogChange((e.target as HTMLInputElement).checked)
        }
        labelPlacement={LABEL_PLACEMENT.right}
      >
        Post this match in the Discord
      </Checkbox>
    </>
  );
};

export default RecordMatchForm;
