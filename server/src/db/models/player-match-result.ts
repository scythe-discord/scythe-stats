import { Model, INTEGER } from 'sequelize';

import { sequelize } from '../sequelize';
import PlayerMat from './player-mat';
import Faction from './faction';
import Player from './player';
import Match from './match';

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

PlayerMatchResult.belongsTo(Faction);
PlayerMatchResult.belongsTo(Match);
PlayerMatchResult.belongsTo(PlayerMat);
PlayerMatchResult.belongsTo(Player);
