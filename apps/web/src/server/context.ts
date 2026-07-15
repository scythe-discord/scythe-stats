import { type Database, getDb } from '@scythe/db';

/** The authenticated user, resolved from the Auth.js session. */
export interface SessionUser {
  /** Internal `user.id` (named `userId` to avoid clashing with Auth.js's
   *  string `user.id`). */
  userId: number;
  discordId: string;
  username: string;
  discriminator: string;
}

export interface Context {
  db: Database;
  /** The signed-in user, or undefined for anonymous requests. */
  user?: SessionUser;
  /** True when the request carries the admin basic-auth header. */
  isAdmin?: boolean;
}

/**
 * Per-request context for the production fetch handler. Resolves the Auth.js
 * session lazily so this module (and the routers) stay import-safe in tests,
 * which build their own context. Auth wiring lives in `./auth`.
 */
export async function createContext(): Promise<Context> {
  const { auth } = await import('./auth');
  const session = await auth();
  // Our fields are attached in the Auth.js `session` callback (see ./auth) but
  // aren't visible on Auth.js's User type, so read them back via a cast.
  const u = session?.user as unknown as Partial<SessionUser> | undefined;
  const user =
    u && u.userId != null
      ? {
          userId: u.userId,
          discordId: u.discordId ?? '',
          username: u.username ?? '',
          discriminator: u.discriminator ?? '',
        }
      : undefined;
  return { db: getDb(), user };
}
