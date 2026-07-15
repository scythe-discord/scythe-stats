/**
 * Drizzle `relations()` for the query API.
 *
 * Note: the bid_game host (bid_game.hostId -> bid_game_player) is deliberately
 * NOT modelled as a relation — it forms a cycle with the bid_game <-> player
 * one-to-many, which makes a one-to-one inverse ambiguous. The host is resolved
 * in-memory from the loaded `players` list (see bidGameRelations).
 */
import { relations } from 'drizzle-orm';
import * as s from './schema';

export const userRelations = relations(s.user, ({ one, many }) => ({
  trueskill: one(s.userTrueskill),
  player: one(s.player),
  bidGamePlayers: many(s.bidGamePlayer),
  bidGameMemberships: many(s.userBidGamesBidGame),
}));

export const userTrueskillRelations = relations(s.userTrueskill, ({ one }) => ({
  user: one(s.user, { fields: [s.userTrueskill.userId], references: [s.user.id] }),
}));

export const playerRelations = relations(s.player, ({ one, many }) => ({
  user: one(s.user, { fields: [s.player.userId], references: [s.user.id] }),
  matchResults: many(s.playerMatchResult),
}));

export const factionRelations = relations(s.faction, ({ many }) => ({
  matchResults: many(s.playerMatchResult),
  matComboTiers: many(s.matComboTier),
  bidPresetSettings: many(s.bidPresetSetting),
  bidGameCombos: many(s.bidGameCombo),
}));

export const playerMatRelations = relations(s.playerMat, ({ many }) => ({
  matchResults: many(s.playerMatchResult),
  matComboTiers: many(s.matComboTier),
  bidPresetSettings: many(s.bidPresetSetting),
  bidGameCombos: many(s.bidGameCombo),
}));

export const tierRelations = relations(s.tier, ({ many }) => ({
  matComboTiers: many(s.matComboTier),
}));

export const matComboTierRelations = relations(s.matComboTier, ({ one }) => ({
  tier: one(s.tier, { fields: [s.matComboTier.tierId], references: [s.tier.id] }),
  faction: one(s.faction, { fields: [s.matComboTier.factionId], references: [s.faction.id] }),
  playerMat: one(s.playerMat, {
    fields: [s.matComboTier.playerMatId],
    references: [s.playerMat.id],
  }),
}));

export const matchRelations = relations(s.match, ({ one, many }) => ({
  results: many(s.playerMatchResult),
  bidGame: one(s.bidGame),
}));

export const playerMatchResultRelations = relations(s.playerMatchResult, ({ one }) => ({
  player: one(s.player, { fields: [s.playerMatchResult.playerId], references: [s.player.id] }),
  faction: one(s.faction, { fields: [s.playerMatchResult.factionId], references: [s.faction.id] }),
  playerMat: one(s.playerMat, {
    fields: [s.playerMatchResult.playerMatId],
    references: [s.playerMat.id],
  }),
  match: one(s.match, { fields: [s.playerMatchResult.matchId], references: [s.match.id] }),
  bidGamePlayer: one(s.bidGamePlayer),
}));

export const bidPresetRelations = relations(s.bidPreset, ({ many }) => ({
  settings: many(s.bidPresetSetting),
  bidGames: many(s.bidGame),
}));

export const bidPresetSettingRelations = relations(s.bidPresetSetting, ({ one }) => ({
  bidPreset: one(s.bidPreset, {
    fields: [s.bidPresetSetting.bidPresetId],
    references: [s.bidPreset.id],
  }),
  faction: one(s.faction, { fields: [s.bidPresetSetting.factionId], references: [s.faction.id] }),
  playerMat: one(s.playerMat, {
    fields: [s.bidPresetSetting.playerMatId],
    references: [s.playerMat.id],
  }),
}));

export const bidGameRelations = relations(s.bidGame, ({ one, many }) => ({
  players: many(s.bidGamePlayer),
  // The host is one of `players` (the one whose id === bidGame.hostId); it isn't
  // a separate Drizzle relation because the bid_game <-> bid_game_player FK cycle
  // makes a one-to-one inverse ambiguous. Resolve it in-memory from `players`.
  match: one(s.match, { fields: [s.bidGame.matchId], references: [s.match.id] }),
  bidPreset: one(s.bidPreset, { fields: [s.bidGame.bidPresetId], references: [s.bidPreset.id] }),
  combos: many(s.bidGameCombo),
  members: many(s.userBidGamesBidGame),
}));

export const bidGamePlayerRelations = relations(s.bidGamePlayer, ({ one }) => ({
  bidGame: one(s.bidGame, {
    fields: [s.bidGamePlayer.bidGameId],
    references: [s.bidGame.id],
  }),
  user: one(s.user, { fields: [s.bidGamePlayer.userId], references: [s.user.id] }),
  playerMatchResult: one(s.playerMatchResult, {
    fields: [s.bidGamePlayer.playerMatchResultId],
    references: [s.playerMatchResult.id],
  }),
  bid: one(s.bid),
}));

export const bidGameComboRelations = relations(s.bidGameCombo, ({ one }) => ({
  bidGame: one(s.bidGame, { fields: [s.bidGameCombo.bidGameId], references: [s.bidGame.id] }),
  faction: one(s.faction, { fields: [s.bidGameCombo.factionId], references: [s.faction.id] }),
  playerMat: one(s.playerMat, {
    fields: [s.bidGameCombo.playerMatId],
    references: [s.playerMat.id],
  }),
  bid: one(s.bid),
}));

export const bidRelations = relations(s.bid, ({ one }) => ({
  bidGamePlayer: one(s.bidGamePlayer, {
    fields: [s.bid.bidGamePlayerId],
    references: [s.bidGamePlayer.id],
  }),
  bidGameCombo: one(s.bidGameCombo, {
    fields: [s.bid.bidGameComboId],
    references: [s.bidGameCombo.id],
  }),
}));

export const userBidGamesBidGameRelations = relations(s.userBidGamesBidGame, ({ one }) => ({
  user: one(s.user, { fields: [s.userBidGamesBidGame.userId], references: [s.user.id] }),
  bidGame: one(s.bidGame, {
    fields: [s.userBidGamesBidGame.bidGameId],
    references: [s.bidGame.id],
  }),
}));
