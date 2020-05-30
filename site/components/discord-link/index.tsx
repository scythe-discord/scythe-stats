import { withStyle } from 'baseui';
import { StyledLink } from 'baseui/link';

export default withStyle(StyledLink as any, () => ({
  // Some attempt at mimicking Discord blurple
  color: '#8da0e1',
  textDecoration: 'none',
  ':visited': {
    color: '#8da0e1',
  },
  ':hover': {
    color: '#a8b6e8',
  },
  ':active, :focus': {
    color: '#a8b6e8',
  },
}));
