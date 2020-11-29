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

interface Props {
  factions: Pick<GQL.Faction, 'id' | 'name'>[];
  playerMats: Pick<GQL.PlayerMat, 'id' | 'name'>[];
  playerEntries: PlayerEntry[];
  formError?: string | null;
  numRounds: string;
  shouldPostMatchLog: boolean;
  onNumRoundsChange: Dispatch<SetStateAction<string>>;
  onShouldPostMatchLogChange: Dispatch<SetStateAction<boolean>>;
  onPlayerEntryChange: Dispatch<PlayerEntryAction>;
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
}) => {
  const [css] = useStyletron();

  return (
    <>
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
                onPlayerEntryChange={onPlayerEntryChange}
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
        onClick={() => onPlayerEntryChange({ type: 'add' })}
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
