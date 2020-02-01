import { FunctionComponent, useState, useEffect } from 'react';
import { H1 } from 'baseui/typography';

interface Stat {
  count: number;
  descriptor: string;
}

interface Props {
  stats: Stat[];
}

const STAT_DURATION = 7500;

const RotatingStats: FunctionComponent<Props> = ({ stats }) => {
  const [statIdx, setStatIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatIdx(statIdx < stats.length - 1 ? statIdx + 1 : 0);
    }, STAT_DURATION);
    return () => clearInterval(interval);
  }, [statIdx]);

  if (!stats.length) {
    return null;
  }

  const stat = stats[statIdx];

  return (
    <H1>
      ... with {stat.count.toLocaleString()} {stat.descriptor} and counting
    </H1>
  );
};

export default RotatingStats;
