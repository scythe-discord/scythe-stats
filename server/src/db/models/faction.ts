import { Model, STRING } from 'sequelize';

import { sequelize } from '../sequelize';

export default class Faction extends Model {}
Faction.init(
  {
    name: STRING
  },
  {
    sequelize
  }
);
