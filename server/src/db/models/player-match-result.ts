import { Model, INTEGER } from 'sequelize';

import { sequelize } from '../sequelize';

import Faction from './faction';
import PlayerMat from './player-mat';
import Player from './player';

export default class PlayerMatchResult extends Model {}
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

PlayerMatchResult.hasOne(Faction);
PlayerMatchResult.hasOne(PlayerMat);
PlayerMatchResult.hasOne(Player);
