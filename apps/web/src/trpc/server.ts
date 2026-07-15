import 'server-only';

import { createContext } from '~/server/context';
import { appRouter } from '~/server/root';
import { createCallerFactory } from '~/server/trpc';

/**
 * Direct server-side caller for React Server Components — `await api.stats.tierList()`.
 * The caller factory resolves a fresh per-request context (which reads the
 * Auth.js session from cookies) on each call, so RSC fetches run authenticated.
 */
const createCaller = createCallerFactory(appRouter);

export const api = createCaller(createContext);
