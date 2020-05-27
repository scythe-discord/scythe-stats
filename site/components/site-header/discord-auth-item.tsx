import { FC } from 'react';
import { useStyletron, withStyle } from 'baseui';
import { Button, KIND, SIZE } from 'baseui/button';
import { StatefulPopover } from 'baseui/popover';
import { StyledLink as BaseLink } from 'baseui/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import { API_LOGOUT_URL } from '../../lib/auth';
import GQL from '../../lib/graphql';

const StyledLink = withStyle(BaseLink as any, ({ $theme }) => ({
  color: $theme.colors.primary,
  textDecoration: 'none',
}));

interface Props {
  discordMe: Pick<GQL.DiscordUser, 'id' | 'username' | 'discriminator'>;
}

const DiscordAuthItem: FC<Props> = ({ discordMe }) => {
  const [css, theme] = useStyletron();

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
        kind={KIND.secondary}
        size={SIZE.compact}
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
