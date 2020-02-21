import { FC } from 'react';
import { withStyle, useStyletron } from 'baseui';
import { StyledBodyCell } from 'baseui/table-grid';

import FactionIcon from '../faction-icon';

interface Props {
  striped: boolean;
  playerName: string;
  faction: string;
  playerMat: string;
  coins: number;
}

const CenteredBodyCell = withStyle(StyledBodyCell, {
  display: 'flex',
  alignItems: 'center'
});

const MatchRow: FC<Props> = ({
  striped,
  playerName,
  faction,
  playerMat,
  coins
}) => {
  const [css] = useStyletron();

  return (
    <>
      <CenteredBodyCell $striped={striped}>{playerName}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        <FactionIcon
          faction={faction}
          size={32}
          className={css({
            paddingRight: '10px'
          })}
        />
        {faction}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{playerMat}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{coins}</CenteredBodyCell>
    </>
  );
};

export default MatchRow;
