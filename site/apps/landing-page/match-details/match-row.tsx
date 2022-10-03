import { FC } from 'react';
import { withStyle, useStyletron } from 'baseui';
import { StyledBodyCell } from 'baseui/table-grid';

import { FactionIcon } from 'lib/components';

interface Props {
  striped: boolean;
  playerName: string;
  faction: string;
  playerMat: string;
  coins: number;
  bidCoins: number | undefined;
}

const CenteredBodyCell = withStyle(StyledBodyCell, {
  display: 'flex',
  alignItems: 'center',
});

const MatchRow: FC<Props> = ({
  striped,
  playerName,
  faction,
  playerMat,
  coins,
  bidCoins,
}) => {
  const [css] = useStyletron();

  return (
    <>
      <CenteredBodyCell
        $striped={striped}
        overrides={{
          Root: {
            style: {
              paddingBottom: '5px',
              paddingTop: '5px',
            },
          },
        }}
      >
        {playerName}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        <FactionIcon
          faction={faction}
          size={32}
          className={css({
            paddingRight: '10px',
          })}
        />
        {faction}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>{playerMat}</CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        {coins}
        {bidCoins != null && ` - ${bidCoins} = ${coins - bidCoins}`}
      </CenteredBodyCell>
    </>
  );
};

export default MatchRow;
