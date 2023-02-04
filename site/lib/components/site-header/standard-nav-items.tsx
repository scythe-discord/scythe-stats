import { ReactNode, FC, useContext } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { StyledNavigationItem } from 'baseui/header-navigation';
import { StyledLink as BaseLink } from 'baseui/link';
import { Badge } from 'baseui/badge';
import { LabelLarge } from 'baseui/typography';
import Link from 'next/link';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faDiscord } from '@fortawesome/free-brands-svg-icons';
import {
  Button,
  KIND as BUTTON_KIND,
  SIZE as BUTTON_SIZE,
} from 'baseui/button';

import DiscordAuthItem from './discord-auth-item';
import BuyMeACoffee from './buy-me-a-coffee';
import { useCreateBidGameMutation } from 'lib/graphql/codegen';
import { useRouter } from 'next/router';
import { AuthContext, DISCORD_OAUTH_URL } from '../auth';

const SpacedNavigationItem = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  const [css] = useStyletron();

  return (
    <StyledNavigationItem
      className={classNames(
        css({
          margin: '0 5px',
        }),
        className
      )}
    >
      {children}
    </StyledNavigationItem>
  );
};

const SpacedExternalLink = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  const [css] = useStyletron();

  return (
    <StyledNavigationItem
      className={classNames(
        css({
          margin: '0 8px',
          paddingLeft: 0,
        }),
        className
      )}
    >
      {children}
    </StyledNavigationItem>
  );
};

const StyledLink = withStyle(BaseLink as any, ({ $theme }) => ({
  color: $theme.colors.primary,
  textDecoration: 'none',
}));

const StandardNavItems: FC = () => {
  const [css] = useStyletron();
  const [mutate, { loading }] = useCreateBidGameMutation();
  const router = useRouter();
  const { discordMe, loading: isAuthLoading } = useContext(AuthContext);

  return (
    <>
      <SpacedNavigationItem>
        <Link href="/" passHref={true} legacyBehavior={true}>
          <StyledLink>Home</StyledLink>
        </Link>
      </SpacedNavigationItem>
      <SpacedNavigationItem>
        <Link href="/tiers" passHref={true} legacyBehavior={true}>
          <StyledLink>Tier List</StyledLink>
        </Link>
      </SpacedNavigationItem>
      <SpacedNavigationItem>
        <Button
          kind={BUTTON_KIND.secondary}
          size={BUTTON_SIZE.compact}
          $as="a"
          href={DISCORD_OAUTH_URL}
          overrides={{
            BaseButton: {
              style: {
                fontSize: '16px',
              },
            },
          }}
          onClick={async (e) => {
            if (!discordMe) {
              return;
            }

            e.preventDefault();
            const { data } = await mutate();

            if (data?.createBidGame.id) {
              router.push(`/bid/${data.createBidGame.id}`);
            }
          }}
          isLoading={loading || isAuthLoading}
        >
          Create Bid Game
          <Badge
            overrides={{ Badge: { style: { marginLeft: '10px' } } }}
            content={
              <span className={css({ fontVariant: 'all-small-caps' })}>
                Beta
              </span>
            }
            hierarchy="secondary"
            color="primary"
          />
        </Button>
      </SpacedNavigationItem>
      <SpacedNavigationItem>
        <DiscordAuthItem isNavItem />
      </SpacedNavigationItem>
      <StyledNavigationItem
        className={css({
          paddingRight: '20px',
        })}
      >
        <LabelLarge
          overrides={{
            Block: {
              style: {
                fontSize: '20px',
              },
            },
          }}
        >
          /
        </LabelLarge>
      </StyledNavigationItem>
      <SpacedExternalLink>
        <StyledLink
          href="https://discord.gg/dcRcxy2"
          target="_blank"
          rel="noopener"
        >
          <FontAwesomeIcon icon={faDiscord} size="lg" />
        </StyledLink>
      </SpacedExternalLink>
      <SpacedExternalLink>
        <StyledLink
          href="https://github.com/shibrady/scythe-stats"
          target="_blank"
          rel="noopener"
        >
          <FontAwesomeIcon icon={faGithub} size="lg" />
        </StyledLink>
      </SpacedExternalLink>
      <SpacedExternalLink>
        <BuyMeACoffee />
      </SpacedExternalLink>
    </>
  );
};

export default StandardNavItems;
