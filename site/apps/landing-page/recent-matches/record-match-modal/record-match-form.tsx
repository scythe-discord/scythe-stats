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
import { LabelSmall } from 'baseui/typography';

interface Props {
  factions: Pick<GQL.Faction, 'id' | 'name'>[];
  playerMats: Pick<GQL.PlayerMat, 'id' | 'name'>[];
  bidGame?: BidGameFragment;
  playerEntries: PlayerEntry[];
  formError?: string | null;
  numRounds: string;
  shouldPostMatchLog: boolean;
  onNumRoundsChange: Dispatch<SetStateAction<string>>;
  onShouldPostMatchLogChange: Dispatch<SetStateAction<boolean>>;
  onPlayerEntryChange: Dispatch<PlayerEntryAction>;
  idToPossibleRankMap: Record<number, number[]>;
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
  idToPossibleRankMap,
  isBidGame,
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
      <FormControl>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: '60px 2fr 1fr 1fr 1fr auto',
            gap: '10px',
          })}
        >
          <LabelSmall>Rank</LabelSmall>
          <LabelSmall>Player</LabelSmall>
          <LabelSmall>Faction</LabelSmall>
          <LabelSmall>Player Mat</LabelSmall>
          <LabelSmall>Coins</LabelSmall>
          {isBidGame ? <LabelSmall>Final Score</LabelSmall> : <div />}
          {playerEntries.map(
            ({
              id,
              player,
              faction,
              playerMat,
              coins,
              rank,
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
                  rank={rank}
                  possibleRanks={idToPossibleRankMap[id]}
                  bidCoins={bidCoins}
                  bidGamePlayerId={bidGamePlayerId}
                />
              );
            }
          )}
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
