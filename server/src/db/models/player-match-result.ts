import { Model, INTEGER } from 'sequelize';

import { sequelize } from '../sequelize';

export default class PlayerMatchResult extends Model {
  public id: number;
  public coins: number;
}
PlayerMatchResult.init(
  {
    coins: {
      type: INTEGER,
      allowNull: false
    }
  },
  {
    sequelize
  }
);
