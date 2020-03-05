import { FunctionComponent, useCallback, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import { LabelSmall } from 'baseui/typography';

import FactionIcon from '../faction-icon';

interface Props {
  id: string;
  displayName: string;
  factionName: string;
  playerMatName: string;
  numRounds: number;
  isSelected: boolean;
  onClick?: (id: string) => void;
}

const BannerLabel: FunctionComponent<{ children: ReactNode }> = ({
  children
}) => (
  <LabelSmall
    overrides={{
      Block: {
        style: {
          whiteSpace: 'nowrap'
        }
      }
    }}
  >
    {children}
  </LabelSmall>
);

const RecentMatchBanner: FunctionComponent<Props> = ({
  id,
  displayName,
  factionName,
  playerMatName,
  numRounds,
  isSelected,
  onClick
}) => {
  const [css, theme] = useStyletron();
  const onClickWithId = useCallback(() => {
    if (onClick) {
      onClick(id);
    }
  }, [onClick, id]);

  return (
    <button
      className={css({
        display: 'flex',
        alignItems: 'center',
        backgroundColor: isSelected ? '#b8dbff' : theme.colors.background,
        cursor: 'pointer',
        border: '1px solid black',
        padding: '5px 15px',
        transition: `background-color ${theme.animation.timing100} ${theme.animation.easeInOutCurve}`,

        [':hover']: {
          backgroundColor: '#daecff'
        },

        [':active']: {
          backgroundColor: '#b8dbff'
        }
      })}
      onClick={onClickWithId}
    >
      <BannerLabel>{displayName} won as</BannerLabel>
      <FactionIcon
        faction={factionName}
        size={28}
        className={css({
          margin: '0 5px'
        })}
      />
      <BannerLabel>
        {playerMatName} in {numRounds} rounds
      </BannerLabel>
    </button>
  );
};

export default RecentMatchBanner;
