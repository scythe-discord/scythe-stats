import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import ColumnNumericTransformer from '../../graphql/utils/ColumnNumericTransformer';
import User from './user';

@Entity()
export default class UserTrueskill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'numeric',
    default: 25,
    precision: 7,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  mu: number;

  @Column({
    type: 'numeric',
    default: 25 / 3,
    precision: 7,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  sigma: number;

  @Column({ type: 'jsonb', default: [] })
  history: { mu: number; sigma: number }[];

  @Column({ type: 'int' })
  userId: number;

  @OneToOne(() => User, (user) => user.trueskill)
  @JoinColumn({ name: 'userId' })
  user: User;
}
