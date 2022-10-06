import { FC } from 'react';
import { withStyle, useStyletron } from 'baseui';
import { StyledBodyCell } from 'baseui/table-grid';

import { FactionIcon } from 'lib/components';
import { PlayerTrueskill } from 'lib/graphql/codegen';
import { LabelSmall } from 'baseui/typography';

interface Props {
  striped: boolean;
  playerName: string;
  faction: string;
  playerMat: string;
  coins: number;
  bidCoins: number | undefined;
  playerTrueskill?: PlayerTrueskill | null;
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
  playerTrueskill,
}) => {
  const [css, theme] = useStyletron();

  const newMu = playerTrueskill?.after.mu;

  const muDiff = playerTrueskill
    ? playerTrueskill.after.mu - playerTrueskill.before.mu
    : undefined;

  let color = 'inherit';
  if (muDiff != null && muDiff > 0) {
    color = theme.colors.contentPositive;
  } else if (muDiff != null && muDiff < 0) {
    color = theme.colors.contentNegative;
  }

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
        {playerName}{' '}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        <FactionIcon
          faction={faction}
          size={32}
          className={css({
            paddingRight: '10px',
          })}
        />
        {faction} {playerMat}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        {coins}
        {bidCoins != null && ` - ${bidCoins} = ${coins - bidCoins}`}
      </CenteredBodyCell>
      <CenteredBodyCell $striped={striped}>
        {playerTrueskill && newMu != null && muDiff != null ? (
          <span className={css({ color })}>
            {newMu.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}{' '}
            (
            {muDiff.toLocaleString(undefined, {
              maximumFractionDigits: 1,
              signDisplay: 'exceptZero',
            })}
            )
          </span>
        ) : (
          <LabelSmall
            color={theme.colors.contentStateDisabled}
            className={css({ fontStyle: 'italic' })}
          >
            No change
          </LabelSmall>
        )}
      </CenteredBodyCell>
    </>
  );
};

export default MatchRow;
