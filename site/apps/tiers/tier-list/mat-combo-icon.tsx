import { FC, useCallback } from 'react';
import { useStyletron } from 'baseui';

import { FactionIcon } from 'lib/components';

interface Props {
  factionId: number;
  playerMatId: number;
  factionName: string;
  isSelected: boolean;
  onClick: (factionId: number, playerMatId: number) => void;
}

const MatComboIcon: FC<Props> = ({
  factionId,
  playerMatId,
  factionName,
  isSelected,
  onClick,
}) => {
  const [css, theme] = useStyletron();

  const onClickWrapper = useCallback(() => {
    onClick(factionId, playerMatId);
  }, [onClick, factionId, playerMatId]);

  return (
    <button
      className={css({
        backgroundColor: 'transparent',
        border: 'none',
        padding: '0',
        opacity: isSelected ? 1 : 0.5,
        transition: `opacity ${theme.animation.timing100} ${theme.animation.easeInOutCurve}`,
      })}
      onClick={onClickWrapper}
    >
      <FactionIcon
        faction={factionName}
        size={42}
        className={css({
          display: 'block',
          margin: '0 5px',
        })}
      />
    </button>
  );
};

export default MatComboIcon;
