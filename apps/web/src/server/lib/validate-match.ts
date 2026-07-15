import { type MatchResultInput, MatchValidationError, validateMatch } from '@scythe/domain';
import { TRPCError } from '@trpc/server';

/**
 * validateMatch with domain failures rethrown as BAD_REQUEST: bad scores,
 * duplicate factions, etc. are user mistakes, not server faults, and shouldn't
 * surface as 500s or pollute the error logs. Messages pass through unchanged
 * (legacy parity — the client displays them).
 */
export function validateMatchInput(numRounds: number, results: MatchResultInput[]): void {
  try {
    validateMatch(numRounds, results);
  } catch (err) {
    if (err instanceof MatchValidationError) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: err.message, cause: err });
    }
    throw err;
  }
}
