import Link from 'next/link';
import { useStyletron, styled } from 'baseui';
import {
  HeaderNavigation,
  StyledNavigationList,
  StyledNavigationItem,
  ALIGN
} from 'baseui/header-navigation';
import { StyledLink as BaseLink } from 'baseui/link';

import BuyMeACoffee from './buy-me-a-coffee';
import { ReactNode } from 'react';

const SpacedNavigationItem = ({ children }: { children: ReactNode }) => {
  const [css] = useStyletron();

  return (
    <StyledNavigationItem
      className={css({
        margin: '0 15px'
      })}
    >
      {children}
    </StyledNavigationItem>
  );
};

const StyledLink = styled(BaseLink, () => ({
  textDecoration: 'none'
}));

export default () => {
  const [css] = useStyletron();

  return (
    <HeaderNavigation
      overrides={{
        Root: {
          style: {
            backgroundColor: 'white',
            boxShadow: '0 1px 8px rgba(0, 0, 0, .2);'
          }
        }
      }}
    >
      <div
        className={css({
          display: 'flex',
          flex: '1 1 auto',
          padding: '0 20px',
          margin: '0 auto',
          maxWidth: '1500px'
        })}
      >
        <StyledNavigationList $align={ALIGN.left}>
          <StyledNavigationItem
            className={css({
              fontSize: '20px'
            })}
          >
            beloved pacifist
          </StyledNavigationItem>
        </StyledNavigationList>
        <StyledNavigationList $align={ALIGN.center}></StyledNavigationList>
        <StyledNavigationList $align={ALIGN.right}>
          <SpacedNavigationItem>
            <Link href="/" passHref={true}>
              <StyledLink>Home</StyledLink>
            </Link>
          </SpacedNavigationItem>
          <SpacedNavigationItem>
            <Link href="/stats" passHref={true}>
              <StyledLink>Stats</StyledLink>
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
          <StyledNavigationItem
            className={css({
              fontSize: '20px',
              margin: '0 15px'
            })}
          >
            /
          </StyledNavigationItem>
          <StyledNavigationItem>
            <BuyMeACoffee />
          </StyledNavigationItem>
        </StyledNavigationList>
      </div>
    </HeaderNavigation>
  );
};
