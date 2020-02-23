import { useStyletron } from 'baseui';
import { StyledLink } from 'baseui/link';

export default () => {
  const [css] = useStyletron();

  return (
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
  );
};
