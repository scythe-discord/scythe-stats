import { FC, Fragment } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { StyledTable, StyledHeadCell, StyledBodyCell } from 'baseui/table-grid';

import GQL from '../../lib/graphql';

import MatComboIcon from './mat-combo-icon';

interface Props {
  tiers: GQL.TiersQuery;
  playerMats: GQL.PlayerMatsQuery;
  selectedMatCombo: {
    factionId: number;
    playerMatId: number;
  };
  onClickMatCombo: (factionId: number, playerMatId: number) => void;
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

const TierList: FC<Props> = ({
  tiers,
  playerMats,
  selectedMatCombo,
  onClickMatCombo,
}) => {
  const [css, theme] = useStyletron();

  const orderedTiers = tiers.tiers.sort((a, b) => {
    if (a.rank > b.rank) {
      return 1;
    } else {
      return -1;
    }
  });

  return (
    <>
      <StyledTable $gridTemplateColumns="80px auto auto auto auto auto auto auto">
        <CenteredHeadCell />
        {playerMats.playerMats.map(({ id, name }) => (
          <CenteredHeadCell key={id}>{name}</CenteredHeadCell>
        ))}
        {orderedTiers.map(({ id: tierId, name, factionMatCombos }, i) => {
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
            <Fragment key={name}>
              <TierLabelCell $striped={striped}>{name}</TierLabelCell>
              {playerMats.playerMats.map(({ id: playerMatId }) => {
                const factions = playerMatToFactions[playerMatId];
                return (
                  <CenteredBodyCell
                    key={`${tierId}:${playerMatId}`}
                    $striped={striped}
                  >
                    {factions ? (
                      factions.map(({ id: factionId, name }) => (
                        <MatComboIcon
                          key={`${factionId}:${playerMatId}`}
                          factionId={factionId}
                          playerMatId={playerMatId}
                          factionName={name}
                          isSelected={
                            selectedMatCombo.factionId === factionId &&
                            selectedMatCombo.playerMatId === playerMatId
                          }
                          onClick={onClickMatCombo}
                        />
                      ))
                    ) : (
                      <div />
                    )}
                  </CenteredBodyCell>
                );
              })}
            </Fragment>
          );
        })}
      </StyledTable>
      <small
        className={css({
          display: 'block',
          color: theme.colors.primary,
          margin: '15px 0 10px',
        })}
      >
        This tier list was created by members of our Discord community, and may
        not necessarily reflect collected stats. Thanks to @FOMOF,
        @AxlPrototype, @JoyDivision, @Mr. Derp, @Reyl, and @w0j0 for creating
        this list.
      </small>
    </>
  );
};

export default TierList;
