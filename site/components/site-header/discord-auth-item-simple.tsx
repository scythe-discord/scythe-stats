import { FC, useContext } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { StyledSpinnerNext, SIZE as SPINNER_SIZE } from 'baseui/spinner';
import { StyledLink as BaseLink } from 'baseui/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import { AuthContext, API_LOGOUT_URL, DISCORD_OAUTH_URL } from '../../lib/auth';

const StyledLink = withStyle(BaseLink as any, ({ $theme }) => ({
  color: $theme.colors.primary,
  textDecoration: 'none',
}));

const DiscordAuthItemSimple: FC = () => {
  const [css, theme] = useStyletron();
  const { discordMe, loading: isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return <StyledSpinnerNext $size={SPINNER_SIZE.small} />;
  }

  if (!discordMe) {
    return <StyledLink href={DISCORD_OAUTH_URL}>Login with Discord</StyledLink>;
  }

  return (
    <StyledLink href={API_LOGOUT_URL}>
      Log out as {discordMe.username}
      <span
        className={css({
          color: theme.colors.primary400,
        })}
      >
        #{discordMe.discriminator}
      </span>
      <FontAwesomeIcon
        icon={faSignOutAlt}
        className={css({
          marginLeft: '10px',
        })}
      />
    </StyledLink>
  );
};

export default DiscordAuthItemSimple;
