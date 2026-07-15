CREATE TYPE "public"."bid_game_status_enum" AS ENUM('CREATED', 'DELETED', 'BIDDING', 'BIDDING_FINISHED', 'GAME_RECORDED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "bid" (
	"id" serial PRIMARY KEY NOT NULL,
	"coins" integer NOT NULL,
	"date" timestamp NOT NULL,
	"bidGamePlayerId" integer,
	"bidGameComboId" integer,
	CONSTRAINT "bid_bidGamePlayerId_unique" UNIQUE("bidGamePlayerId"),
	CONSTRAINT "bid_bidGameComboId_unique" UNIQUE("bidGameComboId")
);
--> statement-breakpoint
CREATE TABLE "bid_game" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "bid_game_status_enum" DEFAULT 'CREATED' NOT NULL,
	"matchId" integer,
	"bidPresetId" integer,
	"createdAt" timestamp NOT NULL,
	"modifiedAt" timestamp NOT NULL,
	"hostId" integer,
	"bidTimeLimitSeconds" integer,
	"enabledCombos" jsonb,
	"bidHistory" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quickBid" boolean DEFAULT false NOT NULL,
	"ranked" boolean DEFAULT false NOT NULL,
	CONSTRAINT "bid_game_matchId_unique" UNIQUE("matchId"),
	CONSTRAINT "bid_game_hostId_unique" UNIQUE("hostId")
);
--> statement-breakpoint
CREATE TABLE "bid_game_combo" (
	"id" serial PRIMARY KEY NOT NULL,
	"bidGameId" integer,
	"factionId" integer,
	"playerMatId" integer,
	CONSTRAINT "bid_game_combo_bidGameId_factionId_playerMatId_unique" UNIQUE("bidGameId","factionId","playerMatId")
);
--> statement-breakpoint
CREATE TABLE "bid_game_player" (
	"id" serial PRIMARY KEY NOT NULL,
	"dateJoined" timestamp NOT NULL,
	"bidGameId" integer,
	"userId" integer,
	"order" integer,
	"playerMatchResultId" integer,
	"quickBids" jsonb,
	CONSTRAINT "bid_game_player_playerMatchResultId_unique" UNIQUE("playerMatchResultId"),
	CONSTRAINT "bid_game_player_bidGameId_order_unique" UNIQUE("bidGameId","order"),
	CONSTRAINT "bid_game_player_bidGameId_userId_unique" UNIQUE("bidGameId","userId")
);
--> statement-breakpoint
CREATE TABLE "bid_preset" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"position" integer NOT NULL,
	"default" boolean,
	CONSTRAINT "bid_preset_default_unique" UNIQUE("default")
);
--> statement-breakpoint
CREATE TABLE "bid_preset_setting" (
	"id" serial PRIMARY KEY NOT NULL,
	"enabled" boolean NOT NULL,
	"bidPresetId" integer,
	"factionId" integer,
	"playerMatId" integer,
	CONSTRAINT "bid_preset_setting_bidPresetId_factionId_playerMatId_unique" UNIQUE("bidPresetId","factionId","playerMatId")
);
--> statement-breakpoint
CREATE TABLE "discord_blacklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"discordId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faction" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "faction_name_unique" UNIQUE("name"),
	CONSTRAINT "faction_position_unique" UNIQUE("position")
);
--> statement-breakpoint
CREATE TABLE "mat_combo_tier" (
	"id" serial PRIMARY KEY NOT NULL,
	"tierId" integer,
	"factionId" integer,
	"playerMatId" integer,
	CONSTRAINT "mat_combo_tier_factionId_playerMatId_unique" UNIQUE("factionId","playerMatId")
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" serial PRIMARY KEY NOT NULL,
	"numRounds" integer NOT NULL,
	"datePlayed" timestamp NOT NULL,
	"recordingUserId" varchar
);
--> statement-breakpoint
CREATE TABLE "player" (
	"id" serial PRIMARY KEY NOT NULL,
	"displayName" varchar NOT NULL,
	"steamId" varchar,
	"userId" integer,
	CONSTRAINT "player_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "player_mat" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"abbrev" varchar NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "player_mat_name_unique" UNIQUE("name"),
	CONSTRAINT "player_mat_abbrev_unique" UNIQUE("abbrev"),
	CONSTRAINT "player_mat_order_unique" UNIQUE("order")
);
--> statement-breakpoint
CREATE TABLE "player_match_result" (
	"id" serial PRIMARY KEY NOT NULL,
	"coins" integer NOT NULL,
	"playerId" integer,
	"factionId" integer,
	"playerMatId" integer,
	"matchId" integer,
	"tieOrder" integer DEFAULT 0 NOT NULL,
	"rank" integer NOT NULL,
	"playerTrueskill" jsonb,
	CONSTRAINT "player_match_result_matchId_rank_unique" UNIQUE("matchId","rank"),
	CONSTRAINT "player_match_result_matchId_playerId_unique" UNIQUE("matchId","playerId"),
	CONSTRAINT "player_match_result_matchId_factionId_unique" UNIQUE("matchId","factionId"),
	CONSTRAINT "player_match_result_matchId_playerMatId_unique" UNIQUE("matchId","playerMatId")
);
--> statement-breakpoint
CREATE TABLE "tier" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"rank" integer NOT NULL,
	CONSTRAINT "tier_name_unique" UNIQUE("name"),
	CONSTRAINT "tier_rank_unique" UNIQUE("rank")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"discordId" varchar NOT NULL,
	"displayName" varchar,
	"discriminator" varchar NOT NULL,
	CONSTRAINT "user_discordId_unique" UNIQUE("discordId")
);
--> statement-breakpoint
CREATE TABLE "user_bid_games_bid_game" (
	"userId" integer NOT NULL,
	"bidGameId" integer NOT NULL,
	CONSTRAINT "user_bid_games_bid_game_userId_bidGameId_pk" PRIMARY KEY("userId","bidGameId")
);
--> statement-breakpoint
CREATE TABLE "user_trueskill" (
	"id" serial PRIMARY KEY NOT NULL,
	"mu" numeric(7, 2) DEFAULT '25'::numeric NOT NULL,
	"sigma" numeric(7, 2) DEFAULT 8.333333333333334 NOT NULL,
	"userId" integer NOT NULL,
	CONSTRAINT "user_trueskill_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "bid" ADD CONSTRAINT "bid_bidGamePlayerId_bid_game_player_id_fk" FOREIGN KEY ("bidGamePlayerId") REFERENCES "public"."bid_game_player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid" ADD CONSTRAINT "bid_bidGameComboId_bid_game_combo_id_fk" FOREIGN KEY ("bidGameComboId") REFERENCES "public"."bid_game_combo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_game" ADD CONSTRAINT "bid_game_matchId_match_id_fk" FOREIGN KEY ("matchId") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_game" ADD CONSTRAINT "bid_game_bidPresetId_bid_preset_id_fk" FOREIGN KEY ("bidPresetId") REFERENCES "public"."bid_preset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_game" ADD CONSTRAINT "bid_game_hostId_bid_game_player_id_fk" FOREIGN KEY ("hostId") REFERENCES "public"."bid_game_player"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_game_combo" ADD CONSTRAINT "bid_game_combo_bidGameId_bid_game_id_fk" FOREIGN KEY ("bidGameId") REFERENCES "public"."bid_game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_game_combo" ADD CONSTRAINT "bid_game_combo_factionId_faction_id_fk" FOREIGN KEY ("factionId") REFERENCES "public"."faction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_game_combo" ADD CONSTRAINT "bid_game_combo_playerMatId_player_mat_id_fk" FOREIGN KEY ("playerMatId") REFERENCES "public"."player_mat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_game_player" ADD CONSTRAINT "bid_game_player_bidGameId_bid_game_id_fk" FOREIGN KEY ("bidGameId") REFERENCES "public"."bid_game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_game_player" ADD CONSTRAINT "bid_game_player_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_game_player" ADD CONSTRAINT "bid_game_player_playerMatchResultId_player_match_result_id_fk" FOREIGN KEY ("playerMatchResultId") REFERENCES "public"."player_match_result"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_preset_setting" ADD CONSTRAINT "bid_preset_setting_bidPresetId_bid_preset_id_fk" FOREIGN KEY ("bidPresetId") REFERENCES "public"."bid_preset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_preset_setting" ADD CONSTRAINT "bid_preset_setting_factionId_faction_id_fk" FOREIGN KEY ("factionId") REFERENCES "public"."faction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid_preset_setting" ADD CONSTRAINT "bid_preset_setting_playerMatId_player_mat_id_fk" FOREIGN KEY ("playerMatId") REFERENCES "public"."player_mat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mat_combo_tier" ADD CONSTRAINT "mat_combo_tier_tierId_tier_id_fk" FOREIGN KEY ("tierId") REFERENCES "public"."tier"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mat_combo_tier" ADD CONSTRAINT "mat_combo_tier_factionId_faction_id_fk" FOREIGN KEY ("factionId") REFERENCES "public"."faction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mat_combo_tier" ADD CONSTRAINT "mat_combo_tier_playerMatId_player_mat_id_fk" FOREIGN KEY ("playerMatId") REFERENCES "public"."player_mat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player" ADD CONSTRAINT "player_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_result" ADD CONSTRAINT "player_match_result_playerId_player_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_result" ADD CONSTRAINT "player_match_result_factionId_faction_id_fk" FOREIGN KEY ("factionId") REFERENCES "public"."faction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_result" ADD CONSTRAINT "player_match_result_playerMatId_player_mat_id_fk" FOREIGN KEY ("playerMatId") REFERENCES "public"."player_mat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_result" ADD CONSTRAINT "player_match_result_matchId_match_id_fk" FOREIGN KEY ("matchId") REFERENCES "public"."match"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bid_games_bid_game" ADD CONSTRAINT "user_bid_games_bid_game_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_bid_games_bid_game" ADD CONSTRAINT "user_bid_games_bid_game_bidGameId_bid_game_id_fk" FOREIGN KEY ("bidGameId") REFERENCES "public"."bid_game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_trueskill" ADD CONSTRAINT "user_trueskill_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bid_game_ranked_status_idx" ON "bid_game" USING btree ("ranked","status");--> statement-breakpoint
CREATE UNIQUE INDEX "player_floating_display_name_unique" ON "player" USING btree ("displayName") WHERE "player"."steamId" IS NULL AND "player"."userId" IS NULL;--> statement-breakpoint
CREATE INDEX "user_bid_games_bid_game_idx" ON "user_bid_games_bid_game" USING btree ("bidGameId");--> statement-breakpoint
CREATE INDEX "user_bid_games_user_idx" ON "user_bid_games_bid_game" USING btree ("userId");