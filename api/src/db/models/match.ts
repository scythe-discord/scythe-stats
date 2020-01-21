import {
  Model,
  NUMBER,
  DATE,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  Association
} from 'sequelize';

import { sequelize } from '../sequelize';

import PlayerMatchResult from './player-match-result';

export default class Match extends Model {
  public id: number;
  public numRounds: number;
  public datePlayed: Date;

  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public getPlayerMatchResults: HasManyGetAssociationsMixin<PlayerMatchResult>;
  public hasPlayerMatchResult: HasManyHasAssociationMixin<
    PlayerMatchResult,
    number
  >;
  public hasPlayerMatchResults: HasManyHasAssociationsMixin<
    PlayerMatchResult,
    number
  >;
  public addPlayerMatchResult: HasManyAddAssociationMixin<
    PlayerMatchResult,
    number
  >;
  public addPlayerMatchResults: HasManyAddAssociationsMixin<
    PlayerMatchResult,
    number
  >;
  public createPlayerMatchResult: HasManyCreateAssociationMixin<
    PlayerMatchResult
  >;
  public removePlayerMatchResult: HasManyRemoveAssociationMixin<
    PlayerMatchResult,
    number
  >;
  public removePlayerMatchResults: HasManyRemoveAssociationsMixin<
    PlayerMatchResult,
    number
  >;
  public countPlayerMatchResults: HasManyCountAssociationsMixin;
  public setPlayerMatchResults: HasManySetAssociationsMixin<
    PlayerMatchResult,
    number
  >;

  public static associations: {
    PlayerMatchResults: Association<Match, PlayerMatchResult>;
  };
}
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
