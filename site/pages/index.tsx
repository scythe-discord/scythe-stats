import { NextPage } from 'next';
import { useStyletron } from 'baseui';

import {
  SiteHeader,
  TopPlayers,
  MatchTable,
  VerticalTimeline
} from '../components';
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
          <VerticalTimeline elements={[]} selected={0} />
        </HeadingLevel>
        <HeadingLevel>
          <Heading>Recent Matches</Heading>
          <MatchTable />
        </HeadingLevel>
        <HeadingLevel>
          <Heading>Top Players</Heading>
          <TopPlayers />
        </HeadingLevel>
      </div>
    </div>
  );
};

export default HomePage;
