import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/root';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/** A fully-loaded bid game as returned by `bids.byId` / `bids.onUpdate`. */
export type BidGame = RouterOutputs['bids']['byId'];
export type BidGamePlayer = BidGame['players'][number];
export type BidGameCombo = BidGame['combos'][number];
