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

export default class Player extends Model {
  public id: number;
  public displayName: string;
  public steamId: string | null;

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
    PlayerMatchResults: Association<Player, PlayerMatchResult>;
  };
}
Player.init(
  {
    /*
      If we read a log that existed prior to introducing Steam IDs,
      the steamId will initially be left blank. The displayName will
      be used as a pseudo-unique identifier in the meantime (we assume
      few to no collisions).

      That is, when a match result is associated with a player:
      1. If a steamId is available in the log, it will attempt to look 
         for a Player via the steamId.

         a. If no Player with that steamId exists, and a Player 
            with the same displayName (but no steamId) exists, 
            it will optimistically assume the steamId belongs to that Player.

      2. If only a displayName is available, it will attempt to look 
         for a Player with a matching displayName, and no steamId, or
         create one if none exists.
    */
    displayName: {
      type: STRING,
      allowNull: false
    },
    steamId: {
      type: STRING,
      unique: true
    }
  },
  {
    sequelize
  }
);
