import { useStyletron } from 'baseui';
import {
  HeaderNavigation,
  StyledNavigationList,
  StyledNavigationItem,
  ALIGN
} from 'baseui/header-navigation';
import { Block } from 'baseui/block';

import StandardNavItems from './standard-nav-items';
import CondensedNavItems from './condensed-nav-items';

export default () => {
  const [css] = useStyletron();

  return (
    <HeaderNavigation
      overrides={{
        Root: {
          style: {
            backgroundColor: 'white',
            boxShadow: '0 1px 8px rgba(0, 0, 0, .2);'
          }
        }
      }}
    >
      <div
        className={css({
          display: 'flex',
          flex: '1 1 auto',
          padding: '0 20px',
          margin: '0 auto',
          maxWidth: '1500px'
        })}
      >
        <StyledNavigationList $align={ALIGN.left}>
          <StyledNavigationItem
            className={css({
              fontSize: '20px'
            })}
          >
            beloved pacifist
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
