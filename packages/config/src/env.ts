import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

/**
 * Shared server-side environment schema.
 *
 * Apps create a validated env object at their boundary via `createServerEnv()`
 * so that misconfiguration fails fast at boot rather than surfacing as a cryptic
 * `undefined` deep in a request handler. Optional vars are filled in as later
 * migration phases need them (Auth.js, Discord announce).
 */
export const serverEnvSchema = {
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  // Auth.js + Discord OAuth (Phase 4)
  AUTH_SECRET: z.string().min(1).optional(),
  DISCORD_CLIENT_ID: z.string().min(1).optional(),
  DISCORD_CLIENT_SECRET: z.string().min(1).optional(),

  // Discord match-announce (optional). GUILD_IDS and VANILLA_LOG_CHANNEL_IDS
  // are comma-separated, position-paired lists — the legacy API's env names,
  // kept so the existing deployment config carries over.
  DISCORD_BOT_TOKEN: z.string().min(1).optional(),
  GUILD_IDS: z.string().min(1).optional(),
  VANILLA_LOG_CHANNEL_IDS: z.string().min(1).optional(),
  SITE_URL: z.string().url().optional(),
} as const;

export function createServerEnv(runtimeEnv: Record<string, string | undefined> = process.env) {
  return createEnv({
    server: serverEnvSchema,
    runtimeEnv,
    emptyStringAsUndefined: true,
  });
}

export type ServerEnv = ReturnType<typeof createServerEnv>;
