import Link from 'next/link';
import {
  HeaderNavigation,
  StyledNavigationList,
  StyledNavigationItem,
  ALIGN
} from 'baseui/header-navigation';
import { StyledLink } from 'baseui/link';

export default () => (
  <HeaderNavigation>
    <StyledNavigationList $align={ALIGN.left}>
      <StyledNavigationItem>beloved pacifist</StyledNavigationItem>
    </StyledNavigationList>
    <StyledNavigationList $align={ALIGN.center}>
      <StyledNavigationItem>
        <Link href="/">Home</Link>
      </StyledNavigationItem>
      <StyledNavigationItem>
        <Link href="/stats">Stats</Link>
      </StyledNavigationItem>
      <StyledNavigationItem>
        <Link href="/about">About</Link>
      </StyledNavigationItem>
      <StyledNavigationItem>
        <StyledLink
          href="https://github.com/shibrady/scythe-stats"
          target="_blank"
        >
          Contribute
        </StyledLink>
      </StyledNavigationItem>
    </StyledNavigationList>
    <StyledNavigationList $align={ALIGN.right}>
      <StyledNavigationItem>Buy Me a Coffee</StyledNavigationItem>
    </StyledNavigationList>
  </HeaderNavigation>
);
