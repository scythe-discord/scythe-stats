import { describe, expect, it } from 'vitest';
import { createRateLimiter, type RateLimitRule } from './rate-limit';

const RULE: RateLimitRule = { max: 3, windowMs: 1_000 };

function fakeClock(start = 0) {
  const state = { t: start };
  return { now: () => state.t, advance: (ms: number) => (state.t += ms) };
}

describe('createRateLimiter', () => {
  it('allows up to max requests per window, then rejects', () => {
    const clock = fakeClock();
    const limiter = createRateLimiter(clock.now);
    for (let i = 0; i < RULE.max; i++) {
      expect(limiter.check('k', RULE)).toEqual({ ok: true });
    }
    expect(limiter.check('k', RULE)).toEqual({ ok: false, retryAfterMs: 1_000 });
  });

  it('resets once the window elapses', () => {
    const clock = fakeClock();
    const limiter = createRateLimiter(clock.now);
    for (let i = 0; i < RULE.max; i++) limiter.check('k', RULE);
    clock.advance(RULE.windowMs);
    expect(limiter.check('k', RULE)).toEqual({ ok: true });
  });

  it('without blockMs, rejects until the window ends', () => {
    const clock = fakeClock();
    const limiter = createRateLimiter(clock.now);
    for (let i = 0; i < RULE.max; i++) limiter.check('k', RULE);
    clock.advance(400);
    expect(limiter.check('k', RULE)).toEqual({ ok: false, retryAfterMs: 600 });
    clock.advance(600);
    expect(limiter.check('k', RULE)).toEqual({ ok: true });
  });

  it('with blockMs, keeps rejecting for the block duration', () => {
    const clock = fakeClock();
    const limiter = createRateLimiter(clock.now);
    const rule: RateLimitRule = { ...RULE, blockMs: 10_000 };
    for (let i = 0; i < rule.max; i++) limiter.check('k', rule);
    expect(limiter.check('k', rule)).toEqual({ ok: false, retryAfterMs: 10_000 });
    // Past the original window but still inside the block.
    clock.advance(5_000);
    expect(limiter.check('k', rule)).toEqual({ ok: false, retryAfterMs: 5_000 });
    clock.advance(5_000);
    expect(limiter.check('k', rule)).toEqual({ ok: true });
  });

  it('tracks keys independently', () => {
    const clock = fakeClock();
    const limiter = createRateLimiter(clock.now);
    for (let i = 0; i < RULE.max; i++) limiter.check('a', RULE);
    expect(limiter.check('a', RULE).ok).toBe(false);
    expect(limiter.check('b', RULE)).toEqual({ ok: true });
  });
});
