import { FunctionComponent, useCallback } from 'react';
import { useStyletron } from 'baseui';
import { Button, KIND } from 'baseui/button';

import FactionIcon from '../faction-icon';

interface Props {
  id: string;
  displayName: string;
  factionName: string;
  playerMatName: string;
  numRounds: number;
  onClick?: (id: string) => void;
}

const RecentMatchBanner: FunctionComponent<Props> = ({
  id,
  displayName,
  factionName,
  playerMatName,
  numRounds,
  onClick
}) => {
  const [css] = useStyletron();
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
        background: 'white',
        cursor: 'pointer',
        border: '1px solid black',
        padding: '5px 15px'
      })}
      onClick={onClickWithId}
    >
      <span>{displayName} won as</span>
      <FactionIcon
        faction={factionName}
        size={28}
        className={css({
          margin: '0 5px'
        })}
      />
      <span>
        {playerMatName} in {numRounds} rounds
      </span>
    </button>
  );
};

export default RecentMatchBanner;
