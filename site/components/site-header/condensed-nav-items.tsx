import { ReactNode, FC, useState, useCallback } from 'react';
import Link from 'next/link';
import { useStyletron, styled } from 'baseui';
import { StyledLink as BaseLink } from 'baseui/link';
import { Menu } from 'baseui/icon';
import { ListItem } from 'baseui/list';
import { Button, KIND, SIZE } from 'baseui/button';
import { Drawer, SIZE as DRAWER_SIZE, ANCHOR } from 'baseui/drawer';

import BuyMeACoffee from './buy-me-a-coffee';

const StyledLink = styled(BaseLink, () => ({
  textDecoration: 'none'
}));

const SpacedNavigationItem: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <ListItem
      overrides={{
        Content: {
          style: {
            fontSize: '18px'
          }
        },
        Root: {},
        ArtworkContainer: {},
        EndEnhancerContainer: {}
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
      <Button onClick={onMenuClick} kind={KIND.tertiary} size={SIZE.mini}>
        <Menu size={24} />
      </Button>
      <Drawer
        onClose={onDrawerClose}
        isOpen={isDrawerOpen}
        anchor={ANCHOR.top}
        size={DRAWER_SIZE.auto}
        autoFocus={false}
      >
        <ul
          className={css({
            padding: '0'
          })}
        >
          <SpacedNavigationItem>
            <Link href="/" passHref={true}>
              <StyledLink>Home</StyledLink>
            </Link>
          </SpacedNavigationItem>
          <SpacedNavigationItem>
            <StyledLink href="https://discord.gg/dcRcxy2" target="_blank">
              Discord
            </StyledLink>
          </SpacedNavigationItem>
          <SpacedNavigationItem>
            <StyledLink
              href="https://github.com/shibrady/scythe-stats"
              target="_blank"
            >
              Contribute
            </StyledLink>
          </SpacedNavigationItem>
          <SpacedNavigationItem>
            <BuyMeACoffee />
          </SpacedNavigationItem>
        </ul>
      </Drawer>
    </>
  );
};
