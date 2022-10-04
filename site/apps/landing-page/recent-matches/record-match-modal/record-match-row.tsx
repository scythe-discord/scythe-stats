import { FC, useCallback, useRef, Dispatch } from 'react';
import { useDebounceCallback } from '@react-hook/debounce';
import { useStyletron, styled } from 'baseui';
import { Select, Value, Option, TYPE } from 'baseui/select';
import { Input } from 'baseui/input';

import GQL from 'lib/graphql';
import { FactionIcon } from 'lib/components';

import { PlayerEntryAction } from './player-entries';
import { ParagraphMedium } from 'baseui/typography';

interface Props {
  id: number;
  factions: Pick<GQL.Faction, 'id' | 'name'>[];
  playerMats: Pick<GQL.PlayerMat, 'id' | 'name'>[];
  player: Value;
  faction: Value;
  playerMat: Value;
  coins: number | string;
  onPlayerEntryChange: Dispatch<PlayerEntryAction>;
  bidCoins?: number;
  bidGamePlayerId?: number;
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
  bidGamePlayerId,
  bidCoins,
}) => {
  const [css] = useStyletron();

  const [loadPlayers, { loading, data: playersByName }] =
    GQL.usePlayersByNameLazyQuery();

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
      className={css({ display: 'flex', gap: '10px', alignItems: 'center' })}
    >
      <div
        className={css({ flex: '1 1 0', minWidth: '135px', width: 'auto' })}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Select
          type={TYPE.search}
          options={playerNameOptions}
          value={player}
          disabled={bidGamePlayerId != null}
          placeholder="Player Name"
          onChange={(params) =>
            onPlayerEntryChange({ type: 'update', id, field: 'player', params })
          }
          onInputChange={onChangePlayerInput}
          isLoading={loading}
          creatable
          required
        />
      </div>
      <div
        className={css({ flex: '0 0 140px' })}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Select
          type={TYPE.select}
          options={factions.map(({ id, name }) => ({
            id,
            label: name,
          }))}
          value={faction}
          disabled={bidGamePlayerId != null}
          placeholder="Faction"
          onChange={(params) =>
            onPlayerEntryChange({
              type: 'update',
              id,
              field: 'faction',
              params,
            })
          }
          getOptionLabel={getFactionLabel}
          getValueLabel={getFactionLabel}
          required
          clearable={false}
        />
      </div>
      <div
        className={css({ flex: '0 0 140px' })}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Select
          type={TYPE.select}
          disabled={bidGamePlayerId != null}
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
          clearable={false}
        />
      </div>
      <div
        className={css({ flex: '0 0 100px' })}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Input
          value={coins}
          placeholder="Coins"
          onChange={(e) =>
            onPlayerEntryChange({
              type: 'update',
              id,
              field: 'coins',
              value: (e.target as HTMLInputElement).value,
            })
          }
          type="number"
          min={0}
          required
        />
      </div>
      {bidGamePlayerId && bidCoins != null ? (
        <ParagraphMedium
          className={css({
            display: 'flex',
            alignItems: 'center',
            flex: '0 0 80px',
          })}
        >
          - ${bidCoins} = ${Number(coins) - bidCoins}
        </ParagraphMedium>
      ) : null}
    </div>
  );
};

export default RecordMatchRow;
