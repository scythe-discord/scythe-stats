import { NextPage } from 'next';
import { useStyletron } from 'baseui';

import {
  SiteHeader,
  TopPlayers,
  RecentMatches,
  FactionsCard
} from '../components';

const HomePage: NextPage = () => {
  const [css] = useStyletron();

  return (
    <div>
      <SiteHeader />
      <div
        className={css({
          display: 'flex',
          padding: '20px',
          margin: '0 auto',
          width: '100%',
          maxWidth: '1650px'
        })}
      >
        <div
          className={css({
            display: 'flex',
            flex: '1 1 auto',
            margin: '0 50px 0 0',
            minWidth: 0
          })}
        >
          <FactionsCard
            className={css({
              flex: '1 1 auto',
              minWidth: 0
            })}
          />
        </div>
        <div>
          <RecentMatches />
          <div
            className={css({
              margin: '50px 0 0'
            })}
          >
            <TopPlayers />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
