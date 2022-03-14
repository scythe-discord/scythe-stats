import { ReactNode, FC, useState, useCallback, useContext } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { StyledLink as BaseLink } from 'baseui/link';
import { Menu } from 'baseui/icon';
import { ListItem } from 'baseui/list';
import { Button, KIND, SIZE } from 'baseui/button';
import { Drawer, SIZE as DRAWER_SIZE, ANCHOR } from 'baseui/drawer';
import Link from 'next/link';

import DiscordAuthItemSimple from './discord-auth-item-simple';
import BuyMeACoffee from './buy-me-a-coffee';
import { AuthContext, DISCORD_OAUTH_URL } from '../auth';
import { useCreateBidGameMutation } from 'lib/graphql/codegen';
import { useRouter } from 'next/router';

const StyledLink = withStyle(BaseLink as any, {
  textDecoration: 'none',
});

const SpacedNavigationItem: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <ListItem
      overrides={{
        Content: {
          style: {
            fontSize: '18px',
          },
        },
        Root: {},
        ArtworkContainer: {},
        EndEnhancerContainer: {},
      }}
    >
      {children}
    </ListItem>
  );
};

const CondensedNavItems: FC = () => {
  const [css] = useStyletron();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const onMenuClick = useCallback(() => setIsDrawerOpen(true), []);
  const onDrawerClose = useCallback(() => setIsDrawerOpen(false), []);
  const { discordMe, loading: isAuthLoading } = useContext(AuthContext);
  const [mutate, { loading }] = useCreateBidGameMutation();
  const router = useRouter();

  return (
    <>
      <li>
        <Button onClick={onMenuClick} kind={KIND.tertiary} size={SIZE.mini}>
          <Menu size={24} />
        </Button>
      </li>
      <Drawer
        onClose={onDrawerClose}
        isOpen={isDrawerOpen}
        anchor={ANCHOR.top}
        size={DRAWER_SIZE.auto}
        autoFocus={false}
      >
        <nav>
          <ul
            className={css({
              padding: '0',
            })}
          >
            <SpacedNavigationItem>
              <Link href="/" passHref={true}>
                <StyledLink>Home</StyledLink>
              </Link>
            </SpacedNavigationItem>
            <SpacedNavigationItem>
              <Link href="/tiers" passHref={true}>
                <StyledLink>Tier List</StyledLink>
              </Link>
            </SpacedNavigationItem>
            <SpacedNavigationItem>
              <a
                href={DISCORD_OAUTH_URL}
                onClick={async (e) => {
                  if (!discordMe) {
                    return;
                  }

                  e.preventDefault();

                  if (loading || isAuthLoading) {
                    return;
                  }
                  const { data } = await mutate();

                  if (data?.createBidGame.id) {
                    router.push(`/bid/${data.createBidGame.id}`);
                  }
                }}
              >
                <StyledLink>Create Bid Game</StyledLink>
              </a>
            </SpacedNavigationItem>
            <SpacedNavigationItem>
              <StyledLink
                href="https://discord.gg/dcRcxy2"
                target="_blank"
                rel="noopener"
              >
                Discord
              </StyledLink>
            </SpacedNavigationItem>
            <SpacedNavigationItem>
              <StyledLink
                href="https://github.com/shibrady/scythe-stats"
                target="_blank"
                rel="noopener"
              >
                Contribute
              </StyledLink>
            </SpacedNavigationItem>
            <SpacedNavigationItem>
              <BuyMeACoffee displayLabel={true} />
            </SpacedNavigationItem>
            <SpacedNavigationItem>
              <DiscordAuthItemSimple />
            </SpacedNavigationItem>
          </ul>
        </nav>
      </Drawer>
    </>
  );
};

export default CondensedNavItems;
