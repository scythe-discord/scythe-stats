import { ReactNode } from 'react';
import Link from 'next/link';
import { useStyletron, styled } from 'baseui';
import { StyledNavigationItem } from 'baseui/header-navigation';
import { StyledLink as BaseLink } from 'baseui/link';
import classNames from 'classnames';

const SpacedNavigationItem = ({
  className,
  children
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
            margin: '0 15px'
          }
        }),
        className
      )}
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
    <>
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
      <SpacedNavigationItem
        className={css({
          fontSize: '20px'
        })}
      >
        /
      </SpacedNavigationItem>
      <StyledNavigationItem>
        <StyledLink
          className={css({
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          })}
          target="_blank"
          href="https://www.buymeacoffee.com/Qianpou"
        >
          <span
            className={css({
              marginRight: '15px'
            })}
          >
            Buy me a coffee
          </span>
          <img
            src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
            alt="Buy me a coffee"
            className={css({
              width: '20px'
            })}
          />
        </StyledLink>
      </StyledNavigationItem>
    </>
  );
};
