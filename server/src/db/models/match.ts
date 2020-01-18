import { Model, NUMBER, DATE } from 'sequelize';

import { sequelize } from '../sequelize';

import PlayerMatchResult from './player-match-result';

export default class Match extends Model {}
Match.init(
  {
    numRounds: {
      type: NUMBER,
      allowNull: false
    },
    datePlayed: {
      type: DATE,
      allowNull: false
    }
  },
  {
    sequelize
  }
);

Match.hasMany(PlayerMatchResult);
