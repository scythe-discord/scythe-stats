import { ReactNode, FC, useState, useCallback } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { StyledLink as BaseLink } from 'baseui/link';
import { Menu } from 'baseui/icon';
import { ListItem } from 'baseui/list';
import { Button, KIND, SIZE } from 'baseui/button';
import { Drawer, SIZE as DRAWER_SIZE, ANCHOR } from 'baseui/drawer';
import Link from 'next/link';

import BuyMeACoffee from './buy-me-a-coffee';

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

export default () => {
  const [css] = useStyletron();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const onMenuClick = useCallback(() => setIsDrawerOpen(true), []);
  const onDrawerClose = useCallback(() => setIsDrawerOpen(false), []);

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
          </ul>
        </nav>
      </Drawer>
    </>
  );
};
