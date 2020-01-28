import { styled } from 'baseui';
import { StatefulInput } from 'baseui/input';
import { NextPage } from 'next';

const Centered = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%'
});

const HomePage: NextPage = () => {
  return (
    <Centered>
      <StatefulInput />
    </Centered>
  );
};

export default HomePage;
