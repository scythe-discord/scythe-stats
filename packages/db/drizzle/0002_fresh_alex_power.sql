CREATE INDEX "match_date_played_idx" ON "match" USING btree ("datePlayed");--> statement-breakpoint
CREATE INDEX "player_match_result_player_id_idx" ON "player_match_result" USING btree ("playerId");--> statement-breakpoint
CREATE INDEX "player_match_result_faction_id_idx" ON "player_match_result" USING btree ("factionId");