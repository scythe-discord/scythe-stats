import { FunctionComponent } from 'react';
import { Card as BaseUICard, CardProps } from 'baseui/card';

const Card: FunctionComponent<CardProps> = props => {
  return (
    <BaseUICard
      overrides={{
        Root: {
          style: {
            border: 'none',
            padding: '20px',
            boxShadow: 'rgba(0, 0, 0, 0.15) 0 2px 8px'
          }
        }
      }}
      {...props}
    />
  );
};

export default Card;
