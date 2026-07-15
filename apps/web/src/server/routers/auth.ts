import { user } from '@scythe/db';
import { eq } from 'drizzle-orm';
import { publicProcedure, router } from '../trpc';

/** Auth-related queries. (Sign in/out are handled by the Auth.js route handler.) */
export const authRouter = router({
  // The current session user, or null when anonymous (legacy `me`). The JWT
  // doesn't carry the avatar hash, so read it from the user table, which is
  // refreshed on each sign-in.
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const [row] = await ctx.db
      .select({ avatarHash: user.discordAvatarHash })
      .from(user)
      .where(eq(user.id, ctx.user.userId));
    return { ...ctx.user, avatarHash: row?.avatarHash ?? null };
  }),
});
