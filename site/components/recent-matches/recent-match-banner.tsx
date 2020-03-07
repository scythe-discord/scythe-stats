import { FC, useCallback, ReactNode } from 'react';
import { useStyletron } from 'baseui';
import { LabelSmall } from 'baseui/typography';

import FactionIcon from '../faction-icon';

const BannerLabel: FC<{ children: ReactNode }> = ({ children }) => (
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

interface Props {
  id: string;
  displayName: string;
  factionName: string;
  playerMatName: string;
  numRounds: number;
  isSelected: boolean;
  onClick?: (id: string) => void;
}

const RecentMatchBanner: FC<Props> = ({
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
        backgroundColor: isSelected
          ? '#daecff'
          : theme.colors.backgroundPrimary,
        cursor: 'pointer',
        border: `${isSelected ? '2px' : '1px'} solid #212121`,
        // Decrease padding when selected to preserve the same dimensions
        padding: `${isSelected ? '4px' : '5px'} ${
          isSelected ? '14px' : '15px'
        }`,
        transition: `background-color ${theme.animation.timing100} ${theme.animation.easeInOutCurve}`,

        [':hover']: {
          backgroundColor: '#ebf5ff'
        },

        [':active']: {
          backgroundColor: '#daecff'
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
