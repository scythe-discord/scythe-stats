import { FC } from 'react';
import { withStyle, useStyletron } from 'baseui';
import { StyledBodyCell } from 'baseui/table-grid';

import FactionIcon from '../faction-icon';

interface Props {
  striped: boolean;
  playerName: string;
  factionName: string;
  playerMatName: string;
  numRounds: number;
  datePlayed: string;
}

const CenteredBodyCell = withStyle(StyledBodyCell, {
  display: 'flex',
  alignItems: 'center'
});

const MatchRow: FC<Props> = ({
  striped,
  playerName,
  factionName,
  playerMatName,
  numRounds,
  datePlayed
}) => {
  const [css] = useStyletron();

  return (
    <>
      <CenteredBodyCell $striped={striped}>{playerName}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        <FactionIcon
          faction={factionName}
          size={28}
          className={css({
            paddingRight: '10px'
          })}
        />
        {factionName}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{playerMatName}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{numRounds}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{datePlayed}</CenteredBodyCell>
    </>
  );
};

export default MatchRow;
