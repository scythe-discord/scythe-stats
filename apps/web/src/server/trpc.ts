import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';
import { type RateLimitRule, rateLimiter } from './lib/rate-limit';

const t = initTRPC.context<Context>().create({
  // superjson preserves Dates (and Maps/Sets) across the wire.
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/** Requires an authenticated user; narrows `ctx.user` to non-undefined. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in.' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/**
 * protectedProcedure plus a per-user rate limit (see lib/rate-limit for the
 * store and the shared rules). Procedures sharing a `keyPrefix` share a
 * budget. Skipped under Vitest — the integration tests replay whole game
 * lifecycles with three users at far-above-human cadence; the limiter itself
 * is unit-tested in lib/rate-limit.test.ts.
 */
export function rateLimitedProcedure(keyPrefix: string, rule: RateLimitRule) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (process.env.VITEST) return next();
    const verdict = rateLimiter.check(`${keyPrefix}:${ctx.user.userId}`, rule);
    if (!verdict.ok) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Too many requests — try again in ${Math.ceil(verdict.retryAfterMs / 1000)}s.`,
      });
    }
    return next();
  });
}
