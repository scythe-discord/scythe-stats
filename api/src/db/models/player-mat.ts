import {
  Model,
  STRING,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManySetAssociationsMixin,
  Association
} from 'sequelize';

import { sequelize } from '../sequelize';
import PlayerMatchResult from './player-match-result';

export default class PlayerMat extends Model {
  public id: number;
  public name: string;

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
    PlayerMatchResults: Association<PlayerMat, PlayerMatchResult>;
  };
}
PlayerMat.init(
  {
    name: {
      type: STRING,
      unique: true,
      allowNull: false
    }
  },
  {
    sequelize
  }
);
