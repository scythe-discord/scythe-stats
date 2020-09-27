import { FC } from 'react';
import { useStyletron } from 'baseui';
import { Button, SIZE, KIND } from 'baseui/button';
import { ButtonGroup } from 'baseui/button-group';
import { LabelSmall } from 'baseui/typography';
import classNames from 'classnames';

interface Props {
  className?: string;
  selectedPlayerCounts: Set<number>;
  onClickPlayerCount: (playerCount: number) => void;
}

const PlayerCountFilter: FC<Props> = ({
  className,
  selectedPlayerCounts,
  onClickPlayerCount,
}) => {
  const [css] = useStyletron();

  const selectedPlayerCountsArray = Array.from(
    selectedPlayerCounts.values()
  ).map((playerCount) => playerCount - 2);

  return (
    <div
      className={classNames(
        css({
          display: 'flex',
          alignItems: 'center',
        }),
        className
      )}
    >
      <LabelSmall
        overrides={{
          Block: {
            style: {
              marginRight: '10px',
            },
          },
        }}
      >
        Player Counts
      </LabelSmall>
      <ButtonGroup
        mode="checkbox"
        selected={selectedPlayerCountsArray}
        size={SIZE.mini}
        kind={KIND.secondary}
        onClick={(_, i) => {
          onClickPlayerCount(i + 2);
        }}
      >
        {[2, 3, 4, 5, 6, 7].map((playerCount) => (
          <Button
            key={playerCount}
            overrides={{
              BaseButton: {
                style: {
                  marginTop: 0,
                  marginBottom: 0,
                  marginLeft: '3px',
                  marginRight: '3px',
                  cursor:
                    selectedPlayerCounts.has(playerCount) &&
                    selectedPlayerCounts.size === 1
                      ? 'not-allowed'
                      : 'pointer',

                  opacity: selectedPlayerCounts.has(playerCount) ? 1 : 0.5,
                  [':first-child']: {
                    marginLeft: 0,
                  },
                  [':last-child']: {
                    marginRight: 0,
                  },
                },
              },
            }}
          >
            {playerCount}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

export default PlayerCountFilter;
