import { bidPreset, faction, playerMat, tier } from '@scythe/db';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const byId = z.object({ id: z.number().int().positive() });

/** Static game reference data: factions, player mats, tiers, bid presets. */
export const referenceRouter = router({
  factions: publicProcedure.query(({ ctx }) =>
    ctx.db.select().from(faction).orderBy(asc(faction.position)),
  ),

  playerMats: publicProcedure.query(({ ctx }) =>
    ctx.db.select().from(playerMat).orderBy(asc(playerMat.order)),
  ),

  tiers: publicProcedure.query(({ ctx }) => ctx.db.select().from(tier).orderBy(asc(tier.rank))),

  // Includes each preset's enabled-combo matrix so the bid-game settings UI
  // can apply and recognize presets.
  bidPresets: publicProcedure.query(({ ctx }) =>
    ctx.db.query.bidPreset.findMany({
      with: { settings: true },
      orderBy: asc(bidPreset.position),
    }),
  ),

  faction: publicProcedure.input(byId).query(async ({ ctx, input }) => {
    const [row] = await ctx.db.select().from(faction).where(eq(faction.id, input.id));
    return row ?? null;
  }),

  playerMat: publicProcedure.input(byId).query(async ({ ctx, input }) => {
    const [row] = await ctx.db.select().from(playerMat).where(eq(playerMat.id, input.id));
    return row ?? null;
  }),
});
