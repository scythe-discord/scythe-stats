import { NextPage } from 'next';
import { useStyletron } from 'baseui';

import { SiteHeader, TopPlayers, MatchTable } from '../components';
import { HeadingLevel, Heading } from 'baseui/heading';

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
          <MatchTable />
        </HeadingLevel>
        <TopPlayers />
      </div>
    </div>
  );
};

export default HomePage;
