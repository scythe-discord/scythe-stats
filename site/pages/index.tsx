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
          width: '100%'
        })}
      >
        <div
          className={css({
            flex: '1 1 auto',
            margin: '0 50px 0 0'
          })}
        >
          <FactionsCard />
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
