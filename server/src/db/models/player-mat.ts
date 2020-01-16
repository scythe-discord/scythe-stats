import { Model, STRING } from 'sequelize';

import { sequelize } from '../sequelize';

export class PlayerMat extends Model {}
PlayerMat.init(
  {
    name: STRING
  },
  {
    sequelize
  }
);
