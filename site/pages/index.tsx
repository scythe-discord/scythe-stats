import { NextPage } from 'next';
import { useStyletron } from 'baseui';
import { HeadingLevel, Heading } from 'baseui/heading';

import { SiteHeader, TopPlayers, RecentMatches } from '../components';

const HomePage: NextPage = () => {
  const [css] = useStyletron();

  return (
    <div>
      <SiteHeader />
      <div
        className={css({
          padding: '20px',
          margin: '0 auto',
          maxWidth: '1280px'
        })}
      >
        <HeadingLevel>
          <Heading>Recent Matches</Heading>
          <RecentMatches />
        </HeadingLevel>
        <div
          className={css({
            margin: '75px 0 0'
          })}
        >
          <HeadingLevel>
            <Heading>Top Players</Heading>
            <TopPlayers />
          </HeadingLevel>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
