import { Model, STRING } from 'sequelize';

import { sequelize } from '../sequelize';

export default class PlayerMat extends Model {}
PlayerMat.init(
  {
    name: STRING
  },
  {
    sequelize
  }
);
