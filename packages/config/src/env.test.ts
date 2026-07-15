import { describe, expect, it, vi } from 'vitest';
import { createServerEnv } from './env';

const base = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgres://scythe:scythe@localhost:8432/scythe',
  REDIS_URL: 'redis://:scythe@localhost:8379',
};

describe('createServerEnv', () => {
  it('parses a valid environment', () => {
    const env = createServerEnv(base);
    expect(env.DATABASE_URL).toBe(base.DATABASE_URL);
    expect(env.NODE_ENV).toBe('test');
  });

  it('defaults NODE_ENV to development when absent', () => {
    const env = createServerEnv({ ...base, NODE_ENV: undefined });
    expect(env.NODE_ENV).toBe('development');
  });

  it('throws when DATABASE_URL is missing', () => {
    // @t3-oss/env logs the validation failure before throwing; silence it here.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => createServerEnv({ ...base, DATABASE_URL: undefined })).toThrow();
    spy.mockRestore();
  });

  it('throws when DATABASE_URL is not a valid url', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => createServerEnv({ ...base, DATABASE_URL: 'not-a-url' })).toThrow();
    spy.mockRestore();
  });
});
