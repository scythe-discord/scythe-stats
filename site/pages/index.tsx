import { NextPage } from 'next';
import { useStyletron } from 'baseui';
import moment from 'moment';

import { SiteHeader, TopPlayers, RecentMatches } from '../components';
import { HeadingLevel, Heading } from 'baseui/heading';
import { Label1 } from 'baseui/typography';

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
            <div
              className={css({
                display: 'flex'
              })}
            >
              <div>
                <Label1
                  overrides={{
                    Block: {
                      style: {
                        margin: '10px 0'
                      }
                    }
                  }}
                >
                  of all time
                </Label1>
                <TopPlayers />
              </div>
              <div
                className={css({
                  marginLeft: '75px'
                })}
              >
                <Label1
                  overrides={{
                    Block: {
                      style: {
                        margin: '10px 0'
                      }
                    }
                  }}
                >
                  this past month
                </Label1>
                <TopPlayers
                  fromDate={moment()
                    .subtract(2, 'month')
                    .toISOString()}
                />
              </div>
            </div>
          </HeadingLevel>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
