/**
 * Minimal fixed-window rate limiter, kept in process memory. The production
 * deployment is a single always-on machine for now, so per-instance
 * counting is globally correct; if the app ever scales out, swap the store
 * for something shared (e.g. Redis) — call sites won't change.
 */

export interface RateLimitRule {
  /** Requests allowed per window. */
  max: number;
  windowMs: number;
  /** Once exceeded, keep rejecting for this long (default: until the window ends). */
  blockMs?: number;
}

/** Legacy @rateLimit(keyPrefix: "log-match") parity: 5 records / 30s, then a 1-hour block. */
export const RECORD_RULE: RateLimitRule = { max: 5, windowMs: 30_000, blockMs: 3_600_000 };
/** Creating new bid games. */
export const CREATE_RULE: RateLimitRule = { max: 10, windowMs: 60_000 };
/** Interactive game actions — far above human cadence, stops scripted spam. */
export const GAME_RULE: RateLimitRule = { max: 60, windowMs: 60_000 };

export type RateLimitVerdict = { ok: true } | { ok: false; retryAfterMs: number };

interface Entry {
  windowStart: number;
  count: number;
  blockedUntil: number | null;
  /** When this entry stops mattering; lets the sweep drop stale keys. */
  expiresAt: number;
}

// Keys are per-user, so cardinality stays small; the sweep is a backstop.
const SWEEP_THRESHOLD = 10_000;

export function createRateLimiter(now: () => number = Date.now) {
  const entries = new Map<string, Entry>();

  function check(key: string, rule: RateLimitRule): RateLimitVerdict {
    const t = now();
    const entry = entries.get(key);

    if (entry) {
      if (entry.blockedUntil !== null && t < entry.blockedUntil) {
        return { ok: false, retryAfterMs: entry.blockedUntil - t };
      }
      const windowOver = entry.blockedUntil !== null || t - entry.windowStart >= rule.windowMs;
      if (!windowOver) {
        if (entry.count >= rule.max) {
          const blockedUntil =
            rule.blockMs != null ? t + rule.blockMs : entry.windowStart + rule.windowMs;
          entry.blockedUntil = blockedUntil;
          entry.expiresAt = blockedUntil;
          return { ok: false, retryAfterMs: blockedUntil - t };
        }
        entry.count += 1;
        return { ok: true };
      }
      // Window (or block) elapsed — fall through and start fresh.
    }

    if (entries.size >= SWEEP_THRESHOLD) {
      for (const [k, e] of entries) {
        if (e.expiresAt <= t) entries.delete(k);
      }
    }
    entries.set(key, {
      windowStart: t,
      count: 1,
      blockedUntil: null,
      expiresAt: t + rule.windowMs,
    });
    return { ok: true };
  }

  return { check };
}

/** Shared limiter for the app's tRPC middleware (see rateLimitedProcedure in trpc.ts). */
export const rateLimiter = createRateLimiter();
