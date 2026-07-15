/**
 * Drizzle schema for the Scythe Stats database.
 *
 * Hand-translated from the production schema (see ../reference/legacy-schema.sql,
 * extracted via `pg_restore --schema-only` from a prod dump). Kept in a single
 * file because the bid tables form a reference cycle
 * (bid_game.hostId -> bid_game_player -> bid_game) and because this mirrors what
 * `drizzle-kit introspect` emits, keeping future diffs clean.
 *
 * Column names are given explicitly (camelCase) to match the existing quoted
 * identifiers exactly — we point Drizzle at the SAME database, so names must
 * line up. The two TypeORM internal tables (`migrations`, `typeorm_metadata`)
 * are intentionally omitted.
 */
import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

// --- Shared column helpers & JSONB shapes ----------------------------------

/**
 * `numeric(7,2)` surfaced to JS as a `number` (mirrors the old TypeORM
 * `ColumnNumericTransformer`). Safe here: mu/sigma are small, bounded values.
 */
const numericAsNumber = customType<{ data: number; driverData: string }>({
  dataType() {
    return 'numeric(7, 2)';
  },
  fromDriver(value) {
    return Number(value);
  },
  toDriver(value) {
    return value.toString();
  },
});

const timestampCol = (name: string) => timestamp(name, { mode: 'date', withTimezone: false });

export type Combo = { factionId: number; playerMatId: number };
export type BidHistoryEntry = {
  factionId: number;
  playerMatId: number;
  coins: number;
  playerId: number;
  date: string;
};
export type QuickBid = { comboId: number; bidCoins: number; order: number };
export type Trueskill = { mu: number; sigma: number };
export type PlayerTrueskill = { before: Trueskill; after: Trueskill };

// --- Enums -----------------------------------------------------------------

export const bidGameStatusEnum = pgEnum('bid_game_status_enum', [
  'CREATED',
  'DELETED',
  'BIDDING',
  'BIDDING_FINISHED',
  'GAME_RECORDED',
  'EXPIRED',
]);

// --- Users & players -------------------------------------------------------

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  username: varchar('username').notNull(),
  discordId: varchar('discordId').notNull().unique(),
  displayName: varchar('displayName'),
  discriminator: varchar('discriminator').notNull(),
  // Discord avatar hash captured at sign-in (null until the user next logs in,
  // or if they have no custom avatar). Used to build CDN avatar URLs.
  discordAvatarHash: varchar('discordAvatarHash'),
});

export const userTrueskill = pgTable('user_trueskill', {
  id: serial('id').primaryKey(),
  // Defaults written to match the legacy DB's stored representation exactly
  // (mu was quoted-cast in the original migration, sigma was a bare literal) so
  // an introspect against prod shows zero drift.
  mu: numericAsNumber('mu').notNull().default(sql`'25'::numeric`),
  sigma: numericAsNumber('sigma').notNull().default(8.333333333333334),
  userId: integer('userId')
    .notNull()
    .unique()
    .references(() => user.id),
});

export const discordBlacklist = pgTable('discord_blacklist', {
  id: serial('id').primaryKey(),
  discordId: varchar('discordId').notNull(),
});

export const player = pgTable(
  'player',
  {
    id: serial('id').primaryKey(),
    displayName: varchar('displayName').notNull(),
    steamId: varchar('steamId'),
    userId: integer('userId')
      .unique()
      .references(() => user.id),
  },
  (t) => [
    // Floating players (no steamId, no linked user) must have a unique display name.
    uniqueIndex('player_floating_display_name_unique')
      .on(t.displayName)
      .where(sql`${t.steamId} IS NULL AND ${t.userId} IS NULL`),
  ],
);

// --- Reference data --------------------------------------------------------

export const faction = pgTable('faction', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique(),
  position: integer('position').notNull().unique(),
});

export const playerMat = pgTable('player_mat', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique(),
  abbrev: varchar('abbrev').notNull().unique(),
  order: integer('order').notNull().unique(),
});

export const tier = pgTable('tier', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique(),
  rank: integer('rank').notNull().unique(),
});

export const matComboTier = pgTable(
  'mat_combo_tier',
  {
    id: serial('id').primaryKey(),
    tierId: integer('tierId').references(() => tier.id, { onDelete: 'cascade' }),
    factionId: integer('factionId').references(() => faction.id, { onDelete: 'cascade' }),
    playerMatId: integer('playerMatId').references(() => playerMat.id, { onDelete: 'cascade' }),
  },
  (t) => [unique().on(t.factionId, t.playerMatId)],
);

// --- Matches ---------------------------------------------------------------

export const match = pgTable(
  'match',
  {
    id: serial('id').primaryKey(),
    numRounds: integer('numRounds').notNull(),
    datePlayed: timestampCol('datePlayed').notNull(),
    recordingUserId: varchar('recordingUserId'),
  },
  // The match timeline paginates on datePlayed (ORDER BY … DESC + cursor WHERE).
  (t) => [index('match_date_played_idx').on(t.datePlayed)],
);

export const playerMatchResult = pgTable(
  'player_match_result',
  {
    id: serial('id').primaryKey(),
    coins: integer('coins').notNull(),
    playerId: integer('playerId').references(() => player.id, { onDelete: 'cascade' }),
    factionId: integer('factionId').references(() => faction.id, { onDelete: 'cascade' }),
    playerMatId: integer('playerMatId').references(() => playerMat.id, { onDelete: 'cascade' }),
    matchId: integer('matchId').references(() => match.id, { onDelete: 'cascade' }),
    // Deprecated in legacy (2022) in favor of rank; exists only to receive
    // imported legacy rows. Never written by the app (defaults to 0) and never
    // queried — post-2022 legacy data has 0 even for tied coins, so it can't
    // distinguish ties. Rank order within equal coins carries the tie outcome.
    tieOrder: integer('tieOrder').notNull().default(0),
    rank: integer('rank').notNull(),
    playerTrueskill: jsonb('playerTrueskill').$type<PlayerTrueskill>(),
  },
  (t) => [
    unique().on(t.matchId, t.rank),
    unique().on(t.matchId, t.playerId),
    unique().on(t.matchId, t.factionId),
    unique().on(t.matchId, t.playerMatId),
    // The matchId-led uniques above don't serve lookups keyed on these alone:
    // playerId drives players.totalWins/totalMatches and the floating-player
    // merge UPDATE; factionId drives stats.topPlayers.
    index('player_match_result_player_id_idx').on(t.playerId),
    index('player_match_result_faction_id_idx').on(t.factionId),
  ],
);

// --- Bidding ---------------------------------------------------------------

export const bidPreset = pgTable('bid_preset', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  position: integer('position').notNull(),
  // Only one preset may be the default; NULL means "not the default".
  default: boolean('default').unique(),
});

export const bidPresetSetting = pgTable(
  'bid_preset_setting',
  {
    id: serial('id').primaryKey(),
    enabled: boolean('enabled').notNull(),
    bidPresetId: integer('bidPresetId').references(() => bidPreset.id, { onDelete: 'cascade' }),
    factionId: integer('factionId').references(() => faction.id, { onDelete: 'cascade' }),
    playerMatId: integer('playerMatId').references(() => playerMat.id, { onDelete: 'cascade' }),
  },
  (t) => [unique().on(t.bidPresetId, t.factionId, t.playerMatId)],
);

export const bidGame = pgTable(
  'bid_game',
  {
    id: serial('id').primaryKey(),
    status: bidGameStatusEnum('status').notNull().default('CREATED'),
    matchId: integer('matchId')
      .unique()
      .references(() => match.id),
    bidPresetId: integer('bidPresetId').references(() => bidPreset.id, { onDelete: 'set null' }),
    createdAt: timestampCol('createdAt').notNull(),
    modifiedAt: timestampCol('modifiedAt').notNull(),
    // Forward ref into bid_game_player (cycle) — annotated to break TS recursion.
    hostId: integer('hostId')
      .unique()
      .references((): AnyPgColumn => bidGamePlayer.id),
    bidTimeLimitSeconds: integer('bidTimeLimitSeconds'),
    enabledCombos: jsonb('enabledCombos').$type<Combo[]>(),
    bidHistory: jsonb('bidHistory').$type<BidHistoryEntry[]>().notNull().default([]),
    quickBid: boolean('quickBid').notNull().default(false),
    ranked: boolean('ranked').notNull().default(false),
  },
  (t) => [index('bid_game_ranked_status_idx').on(t.ranked, t.status)],
);

export const bidGamePlayer = pgTable(
  'bid_game_player',
  {
    id: serial('id').primaryKey(),
    dateJoined: timestampCol('dateJoined').notNull(),
    bidGameId: integer('bidGameId').references(() => bidGame.id, { onDelete: 'cascade' }),
    userId: integer('userId').references(() => user.id, { onDelete: 'cascade' }),
    order: integer('order'),
    // Forward ref into player_match_result (defined above) is fine, kept lazy.
    playerMatchResultId: integer('playerMatchResultId')
      .unique()
      .references(() => playerMatchResult.id),
    quickBids: jsonb('quickBids').$type<QuickBid[]>(),
  },
  (t) => [unique().on(t.bidGameId, t.order), unique().on(t.bidGameId, t.userId)],
);

export const bidGameCombo = pgTable(
  'bid_game_combo',
  {
    id: serial('id').primaryKey(),
    bidGameId: integer('bidGameId').references(() => bidGame.id, { onDelete: 'cascade' }),
    factionId: integer('factionId').references(() => faction.id, { onDelete: 'cascade' }),
    playerMatId: integer('playerMatId').references(() => playerMat.id, { onDelete: 'cascade' }),
  },
  (t) => [unique().on(t.bidGameId, t.factionId, t.playerMatId)],
);

export const bid = pgTable('bid', {
  id: serial('id').primaryKey(),
  coins: integer('coins').notNull(),
  date: timestampCol('date').notNull(),
  bidGamePlayerId: integer('bidGamePlayerId')
    .unique()
    .references(() => bidGamePlayer.id, { onDelete: 'cascade' }),
  bidGameComboId: integer('bidGameComboId')
    .unique()
    .references(() => bidGameCombo.id, { onDelete: 'cascade' }),
});

/** TypeORM-generated many-to-many junction: which users belong to a bid game. */
export const userBidGamesBidGame = pgTable(
  'user_bid_games_bid_game',
  {
    userId: integer('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    bidGameId: integer('bidGameId')
      .notNull()
      .references(() => bidGame.id),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.bidGameId] }),
    index('user_bid_games_bid_game_idx').on(t.bidGameId),
    index('user_bid_games_user_idx').on(t.userId),
  ],
);
