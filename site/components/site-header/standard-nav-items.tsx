import { ReactNode, FC } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { StyledNavigationItem } from 'baseui/header-navigation';
import { StyledLink as BaseLink } from 'baseui/link';
import { LabelLarge } from 'baseui/typography';
import Link from 'next/link';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faDiscord } from '@fortawesome/free-brands-svg-icons';

import DiscordAuthItem from './discord-auth-item';
import BuyMeACoffee from './buy-me-a-coffee';

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

  return (
    <>
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
        <DiscordAuthItem />
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
