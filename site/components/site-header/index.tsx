import Link from 'next/link';
import { useStyletron } from 'baseui';
import {
  HeaderNavigation,
  StyledNavigationList,
  StyledNavigationItem,
  ALIGN
} from 'baseui/header-navigation';
import { StyledLink } from 'baseui/link';

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

export default () => {
  const [css] = useStyletron();

  return (
    <HeaderNavigation>
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
            <Link href="/">
              <a>Home</a>
            </Link>
          </SpacedNavigationItem>
          <SpacedNavigationItem>
            <Link href="/stats">
              <a>Stats</a>
            </Link>
          </SpacedNavigationItem>
          <SpacedNavigationItem>
            <StyledLink href="https://discord.gg/dcRcxy2" target="_blank">
              <a>Discord</a>
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
              fontSize: '24px',
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
