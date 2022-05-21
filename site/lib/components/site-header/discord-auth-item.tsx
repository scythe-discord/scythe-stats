import { FC, useContext } from 'react';
import { useStyletron, withStyle } from 'baseui';
import {
  Button,
  KIND as BUTTON_KIND,
  SIZE as BUTTON_SIZE,
} from 'baseui/button';
import { StatefulPopover } from 'baseui/popover';
import { Spinner, SIZE as SPINNER_SIZE } from 'baseui/spinner';
import { StyledLink as BaseLink } from 'baseui/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import { AuthContext, API_LOGOUT_URL, DISCORD_OAUTH_URL } from '../auth';

const StyledLink = withStyle(BaseLink as any, ({ $theme }) => ({
  color: $theme.colors.primary,
  textDecoration: 'none',
}));

const DiscordAuthItem: FC = () => {
  const [css, theme] = useStyletron();
  const { discordMe, loading: isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return <Spinner $size={SPINNER_SIZE.small} />;
  }

  if (!discordMe) {
    return (
      <Button
        $as="a"
        href={DISCORD_OAUTH_URL}
        kind={BUTTON_KIND.secondary}
        size={BUTTON_SIZE.compact}
        overrides={{
          BaseButton: {
            style: {
              fontSize: '16px',
            },
          },
        }}
      >
        Login with Discord
      </Button>
    );
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
      <Button
        overrides={{
          BaseButton: {
            style: {
              fontSize: '16px',
            },
          },
        }}
        kind={BUTTON_KIND.secondary}
        size={BUTTON_SIZE.compact}
      >
        <span>{discordMe.username}</span>
        <span
          className={css({
            color: theme.colors.primary400,
            paddingLeft: '2px',
          })}
        >
          #{discordMe.discriminator}
        </span>
      </Button>
    </StatefulPopover>
  );
};

export default DiscordAuthItem;
