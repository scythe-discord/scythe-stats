import { NextPage } from 'next';
import { useStyletron } from 'baseui';

import { SiteHeader, RecentMatches } from '../components';

const HomePage: NextPage = () => {
  const [css] = useStyletron();

  return (
    <div>
      <SiteHeader />
      <div
        className={css({
          padding: '0 20px',
          margin: '0 auto',
          maxWidth: '1280px'
        })}
      >
        <RecentMatches />
      </div>
    </div>
  );
};

export default HomePage;
