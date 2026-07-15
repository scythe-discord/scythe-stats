import { type Database, playerMatchResult } from '@scythe/db';
import { eq, sql } from 'drizzle-orm';

// Shared SQL building blocks for the win/stats aggregations.
//
// A player_match_result is a "win" when rank = 1. Rank is assigned at record
// time — casual matches: recorder-confirmed coin order with tie winners first;
// bid games: coins − bid — and unique(matchId, rank) guarantees exactly one
// winner per match. The legacy site instead joined on "max raw coins with
// tieOrder = 0", which double-counted tied top scores (nothing wrote tieOrder
// after the 2022 rank migration deprecated it) and credited the wrong player
// in bid games whenever the winner's bid outweighed a runner-up's coin lead.
// rank = 1 agrees with the winner shown on the match timeline.

/** Condition: this result is its match's winner. */
export function isWin() {
  return eq(playerMatchResult.rank, 1);
}

/** Subquery: the number of players (results) in each match. */
export function playerCountPerMatch(db: Database) {
  return db
    .select({
      matchId: playerMatchResult.matchId,
      playerCount: sql<number>`count(*)::int`.as('playerCount'),
    })
    .from(playerMatchResult)
    .groupBy(playerMatchResult.matchId)
    .as('playerCounts');
}
