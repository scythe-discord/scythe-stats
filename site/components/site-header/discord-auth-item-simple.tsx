import { FC } from 'react';
import { useStyletron, withStyle } from 'baseui';
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

const DiscordAuthItemSimple: FC<Props> = ({ discordMe, isAuthLoading }) => {
  const [css, theme] = useStyletron();

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
