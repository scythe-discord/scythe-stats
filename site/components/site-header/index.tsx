import { useStyletron } from 'baseui';
import {
  HeaderNavigation,
  StyledNavigationList,
  StyledNavigationItem,
  ALIGN,
} from 'baseui/header-navigation';
import { Block } from 'baseui/block';
import { LabelLarge } from 'baseui/typography';

import StandardNavItems from './standard-nav-items';
import CondensedNavItems from './condensed-nav-items';

export default () => {
  const [css, theme] = useStyletron();

  return (
    <HeaderNavigation
      overrides={{
        Root: {
          style: {
            backgroundColor: theme.colors.backgroundSecondary,
            boxShadow: '0 1px 8px rgba(0, 0, 0, .2)',
          },
        },
      }}
    >
      <div
        className={css({
          display: 'flex',
          flex: '1 1 auto',
          padding: '0 20px 0 0',
          margin: '0 auto',
          maxWidth: '1650px',
        })}
      >
        <StyledNavigationList $align={ALIGN.left}>
          <StyledNavigationItem
            className={css({
              fontSize: '20px',
            })}
          >
            <LabelLarge
              overrides={{
                Block: {
                  style: {
                    fontSize: '22px',
                  },
                },
              }}
            >
              beloved pacifist
            </LabelLarge>
          </StyledNavigationItem>
        </StyledNavigationList>
        <StyledNavigationList $align={ALIGN.center}></StyledNavigationList>
        <Block display={['flex', 'flex', 'none']}>
          <StyledNavigationList $align={ALIGN.right}>
            <CondensedNavItems />
          </StyledNavigationList>
        </Block>
        <Block display={['none', 'none', 'flex']}>
          <StyledNavigationList $align={ALIGN.right}>
            <StandardNavItems />
          </StyledNavigationList>
        </Block>
      </div>
    </HeaderNavigation>
  );
};
