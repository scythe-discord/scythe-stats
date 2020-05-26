import { FC } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { StatefulPopover } from 'baseui/popover';
import { StyledSpinnerNext, SIZE as SPINNER_SIZE } from 'baseui/spinner';
import { StyledLink as BaseLink } from 'baseui/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import { API_LOGOUT_URL, DISCORD_OAUTH_URL } from '../../lib/auth';
import GQL from '../../lib/graphql';

const StyledLink = withStyle(BaseLink as any, ({ $theme }) => ({
  color: $theme.colors.primary,
  textDecoration: 'none',
}));

interface Props {
  discordMe: Pick<GQL.DiscordUser, 'id' | 'username' | 'discriminator'> | null;
  isAuthLoading: boolean;
}

const DiscordAuthItem: FC<Props> = ({ discordMe, isAuthLoading }) => {
  const [css, theme] = useStyletron();

  if (isAuthLoading) {
    return <StyledSpinnerNext $size={SPINNER_SIZE.small} />;
  }

  if (!discordMe) {
    return <StyledLink href={DISCORD_OAUTH_URL}>Login with Discord</StyledLink>;
  }

  return (
    <StatefulPopover
      content={() => (
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
          })}
        >
          <StyledLink href={API_LOGOUT_URL}>
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className={css({
                marginRight: '5px',
              })}
            />
            Log Out
          </StyledLink>
        </div>
      )}
    >
      <button
        className={css({
          backgroundColor: 'transparent',
          border: 'none',
          padding: 0,
          fontSize: '16px',
          cursor: 'pointer',
        })}
      >
        <span
          className={css({
            color: theme.colors.primary,
          })}
        >
          {discordMe.username}
        </span>
        <span
          className={css({
            color: theme.colors.primary400,
            paddingLeft: '2px',
          })}
        >
          #{discordMe.discriminator}
        </span>
      </button>
    </StatefulPopover>
  );
};

export default DiscordAuthItem;
