import { ReactNode } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { StyledNavigationItem } from 'baseui/header-navigation';
import { StyledLink as BaseLink } from 'baseui/link';
import { LabelLarge } from 'baseui/typography';
import Link from 'next/link';
import classNames from 'classnames';

import BuyMeACoffee from './buy-me-a-coffee';

const SpacedNavigationItem = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  const [css, theme] = useStyletron();

  return (
    <StyledNavigationItem
      className={classNames(
        css({
          margin: '0 5px',

          [theme.mediaQuery.large]: {
            margin: '0 15px',
          },
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

export default () => {
  return (
    <>
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
      </SpacedNavigationItem>
      <StyledNavigationItem>
        <BuyMeACoffee />
      </StyledNavigationItem>
    </>
  );
};
