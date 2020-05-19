import { FC } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { StyledTable, StyledHeadCell, StyledBodyCell } from 'baseui/table-grid';

import GQL from '../../lib/graphql';
import FactionIcon from '../faction-icon';

interface Props {
  tiers: GQL.TiersQuery;
  playerMats: GQL.PlayerMatsQuery;
}

const CenteredHeadCell = withStyle(StyledHeadCell, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const CenteredBodyCell = withStyle(StyledBodyCell, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '15px 10px',
});

const TierLabelCell = withStyle(CenteredBodyCell, {
  fontSize: '20px',
  fontWeight: 600,
});

const TierList: FC<Props> = ({ tiers, playerMats }) => {
  const [css] = useStyletron();

  const orderedTiers = tiers.tiers.sort((a, b) => {
    if (a.rank > b.rank) {
      return 1;
    } else {
      return -1;
    }
  });

  return (
    <StyledTable $gridTemplateColumns="80px auto auto auto auto auto auto auto">
      <CenteredHeadCell />
      {playerMats.playerMats.map(({ name }) => (
        <CenteredHeadCell>{name}</CenteredHeadCell>
      ))}
      {orderedTiers.map(({ name, factionMatCombos }, i) => {
        const playerMatToFactions: {
          [key: string]: Pick<GQL.Faction, 'id' | 'name'>[];
        } = {};
        factionMatCombos.forEach(({ faction, playerMat }) => {
          if (!playerMatToFactions[playerMat.id]) {
            playerMatToFactions[playerMat.id] = [];
          }
          playerMatToFactions[playerMat.id].push(faction);
        });

        const striped = i % 2 !== 0;

        return (
          <>
            <TierLabelCell $striped={striped}>{name}</TierLabelCell>
            {playerMats.playerMats.map(({ id }) => {
              const factions = playerMatToFactions[id];
              return (
                <CenteredBodyCell $striped={striped}>
                  {factions ? (
                    factions.map(({ name }) => (
                      <FactionIcon
                        faction={name}
                        size={42}
                        className={css({
                          margin: '0 5px',
                        })}
                      />
                    ))
                  ) : (
                    <div />
                  )}
                </CenteredBodyCell>
              );
            })}
          </>
        );
      })}
    </StyledTable>
  );
};

export default TierList;
