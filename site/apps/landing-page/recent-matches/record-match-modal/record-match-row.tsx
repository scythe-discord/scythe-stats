import { FC, useCallback, useRef, Dispatch } from 'react';
import { useDebounceCallback } from '@react-hook/debounce';
import { useStyletron, styled } from 'baseui';
import { Button, KIND, SIZE, SHAPE } from 'baseui/button';
import { Delete } from 'baseui/icon';
import { Select, Value, Option, TYPE } from 'baseui/select';
import { Input } from 'baseui/input';

import GQL from 'lib/graphql';
import { FactionIcon } from 'lib/components';

import { PlayerEntryAction } from './player-entries';

interface Props {
  id: number;
  factions: Pick<GQL.Faction, 'id' | 'name'>[];
  playerMats: Pick<GQL.PlayerMat, 'id' | 'name'>[];
  player: Value;
  faction: Value;
  playerMat: Value;
  coins: number | string;
  onPlayerEntryChange: Dispatch<PlayerEntryAction>;
}

const FactionLabelContainer = styled('div', () => ({
  display: 'flex',
  alignItems: 'center',
}));

const FactionLabelName = styled('span', () => ({
  marginLeft: '7px',
}));

const getFactionLabel = ({ option }: { option?: Option }) => {
  if (!option || !option.label || typeof option.label !== 'string') {
    return null;
  }

  return (
    <FactionLabelContainer>
      <FactionIcon faction={option.label} size={24} />
      <FactionLabelName>{option.label}</FactionLabelName>
    </FactionLabelContainer>
  );
};

const RecordMatchRow: FC<Props> = ({
  id,
  factions,
  playerMats,
  player,
  faction,
  playerMat,
  coins,
  onPlayerEntryChange,
}) => {
  const [css] = useStyletron();

  const [
    loadPlayers,
    { loading, data: playersByName },
  ] = GQL.usePlayersByNameLazyQuery();

  const playerNameRef = useRef('');

  const onLoadPlayerOptions = useDebounceCallback(() => {
    const playerName = playerNameRef.current;
    loadPlayers({
      variables: {
        startsWith: playerName,
        first: 10,
      },
    });
  }, 300);

  const onChangePlayerInput = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      playerNameRef.current = (event.target as HTMLInputElement).value;
      onLoadPlayerOptions();
    },
    []
  );

  const playerNameOptions = playersByName
    ? playersByName.playersByName.edges.map(
        ({ node: { id, displayName } }) => ({
          id,
          label: displayName,
        })
      )
    : [];

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
      })}
    >
      <Select
        type={TYPE.search}
        options={playerNameOptions}
        value={player}
        placeholder="Player Name"
        onChange={(params) =>
          onPlayerEntryChange({ type: 'update', id, field: 'player', params })
        }
        onInputChange={onChangePlayerInput}
        isLoading={loading}
        creatable
        required
        overrides={{
          Root: {
            style: {
              flex: '1 1 auto',
              minWidth: '135px',
              width: 'auto',
            },
          },
          ControlContainer: {
            style: {
              width: '100%',
            },
          },
        }}
      />
      <Select
        type={TYPE.select}
        options={factions.map(({ id, name }) => ({
          id,
          label: name,
        }))}
        value={faction}
        placeholder="Faction"
        onChange={(params) =>
          onPlayerEntryChange({ type: 'update', id, field: 'faction', params })
        }
        getOptionLabel={getFactionLabel}
        getValueLabel={getFactionLabel}
        required
        overrides={{
          Root: {
            style: {
              flex: '0 0 auto',
              margin: '0 15px',
              width: 'auto',
            },
          },
          ControlContainer: {
            style: {
              width: '160px',
            },
          },
        }}
        clearable={false}
      />
      <Select
        type={TYPE.select}
        options={playerMats.map(({ id, name }) => ({
          id,
          label: name,
        }))}
        value={playerMat}
        placeholder="Player Mat"
        onChange={(params) =>
          onPlayerEntryChange({
            type: 'update',
            id,
            field: 'playerMat',
            params,
          })
        }
        required
        overrides={{
          Root: {
            style: {
              flex: '0 0 auto',
              margin: '0 15px 0 0',
              width: 'auto',
            },
          },
          ControlContainer: {
            style: {
              width: '155px',
            },
          },
        }}
        clearable={false}
      />
      <Input
        value={coins}
        onChange={(e) =>
          onPlayerEntryChange({
            type: 'update',
            id,
            field: 'coins',
            value: (e.target as HTMLInputElement).value,
          })
        }
        placeholder="Coins"
        type="number"
        min={0}
        required
        overrides={{
          Root: {
            style: {
              flex: '0 0 auto',
              margin: '0 15px 0 0',
              width: 'auto',
            },
          },
          InputContainer: {
            style: {
              width: '100px',
            },
          },
        }}
      />
      <Button
        kind={KIND.tertiary}
        size={SIZE.compact}
        shape={SHAPE.square}
        onClick={() => onPlayerEntryChange({ type: 'remove', id })}
        overrides={{
          Root: {
            style: {
              flex: '0 0 auto',
            }
          }
        }}
      >
        <Delete size={24} />
      </Button>
    </div>
  );
};

export default RecordMatchRow;
