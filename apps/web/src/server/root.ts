import { authRouter } from './routers/auth';
import { bidsRouter } from './routers/bids';
import { matchesRouter } from './routers/matches';
import { playersRouter } from './routers/players';
import { referenceRouter } from './routers/reference';
import { statsRouter } from './routers/stats';
import { router } from './trpc';

export const appRouter = router({
  auth: authRouter,
  reference: referenceRouter,
  matches: matchesRouter,
  players: playersRouter,
  stats: statsRouter,
  bids: bidsRouter,
});

export type AppRouter = typeof appRouter;
