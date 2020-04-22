import { FC, useState, useCallback } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { HeadingLarge, LabelSmall } from 'baseui/typography';
import { StyledLink } from 'baseui/link';
import { StyledSpinnerNext } from 'baseui/spinner';

import GQL from '../../lib/graphql';
import { VerticalTimeline, TimelineElement } from '../vertical-timeline';
import Card from '../card';
import MatchDetails from '../match-details';

import RecentMatchBanner from './recent-match-banner';

const DiscordLink = withStyle(StyledLink as any, {
  // Some attempt at mimicking Discord blurple
  color: '#304eb6',
  textDecoration: 'none',
  ':visited': {
    color: '#304eb6'
  },
  ':hover': {
    color: '#8da0e1'
  },
  ':active, :focus': {
    color: '#8da0e1'
  }
});

const RecentMatches: FC = () => {
  const [css, theme] = useStyletron();
  const [selected, setSelected] = useState(0);
  const { data: recentMatches, loading } = GQL.useMatchesQuery({
    query: GQL.MatchesDocument,
    variables: {
      first: 10
    }
  });

  const onMatchClick = useCallback(
    (id: string) => {
      if (!recentMatches) {
        return;
      }

      const idx = recentMatches.matches.edges.findIndex(({ node }) => {
        return node.id === id;
      });
      setSelected(idx);
    },
    [recentMatches]
  );

  let content = null;

  if (loading) {
    content = (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '550px',
          height: '450px'
        })}
      >
        <StyledSpinnerNext />
      </div>
    );
  } else if (!recentMatches) {
    content = (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '550px',
          height: '450px'
        })}
      >
        We failed to load recent matches :(
      </div>
    );
  } else {
    const timelineElements: TimelineElement[] = recentMatches.matches.edges.map(
      ({ node }, idx) => {
        const { id, datePlayed, numRounds, playerResults, winner } = node;
        // Although hypothetically this never fails to find a winner
        const winningResult =
          playerResults.find(({ id }) => id === winner.id) || playerResults[0];

        const {
          faction: { name: factionName },
          playerMat: { name: playerMatName },
          player: { displayName }
        } = winningResult;

        const content = (
          <RecentMatchBanner
            id={id}
            displayName={displayName}
            factionName={factionName}
            playerMatName={playerMatName}
            numRounds={numRounds}
            isSelected={idx === selected}
            onClick={onMatchClick}
          />
        );

        const rawContentDescriptor = `${displayName} won as ${factionName} ${playerMatName} in ${numRounds} rounds`;

        return {
          key: id,
          isSelectable: true,
          content,
          rawContentDescriptor,
          date: datePlayed
        };
      }
    );

    const selectedMatch = recentMatches.matches.edges[selected].node;

    const matchDetailsRows = selectedMatch.playerResults.map(
      ({
        player: { displayName },
        faction: { name: factionName },
        playerMat: { name: playerMatName },
        coins
      }) => {
        return {
          playerName: displayName,
          faction: factionName,
          playerMat: playerMatName,
          coins
        };
      }
    );

    content = (
      <>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',

            [theme.mediaQuery.large]: {
              flexDirection: 'column',
              flexWrap: 'nowrap'
            }
          })}
        >
          <VerticalTimeline
            elements={timelineElements}
            selected={selected}
            onClick={onMatchClick}
          />
          <MatchDetails
            className={css({
              // Intended to style the table such that changes in height
              // (more or less players) do not shift container sizes
              // Height reflects a max 7 player game
              gridTemplateRows: '45px',
              minHeight: '315px',
              margin: '40px 0 0'
            })}
            rows={matchDetailsRows}
          />
        </div>
        <LabelSmall
          overrides={{
            Block: {
              style: {
                textAlign: 'center',
                margin: '25px 0 0',

                [theme.mediaQuery.large]: {
                  textAlign: 'left'
                }
              }
            }
          }}
        >
          Looking for more matches?{' '}
          <DiscordLink
            href="https://discord.gg/dcRcxy2"
            target="_blank"
            rel="noopener"
          >
            Join our Discord!
          </DiscordLink>
        </LabelSmall>
      </>
    );
  }

  return (
    <Card>
      <HeadingLarge
        as="h1"
        overrides={{
          Block: {
            style: {
              marginTop: 0
            }
          }
        }}
      >
        Recent Matches
      </HeadingLarge>
      {content}
    </Card>
  );
};

export default RecentMatches;
