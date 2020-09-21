import { StyledLink } from 'baseui/link';
import { useStyletron } from 'styletron-react';

export default (props: any) => {
  const [css] = useStyletron();
  return (
    <StyledLink
      className={css({
        // Some attempt at mimicking Discord blurple
        color: '#8da0e1',
        textDecoration: 'none',
        ':visited': {
          color: '#8da0e1',
        },
        ':hover': {
          color: '#a8b6e8',
        },
        ':active': {
          color: '#a8b6e8',
        },
        ':focus': {
          color: '#a8b6e8',
        },
      })}
      {...props}
    />
  );
};
