import { type Database, user, userTrueskill } from '@scythe/db';

export interface DiscordIdentity {
  discordId: string;
  username: string;
  discriminator: string;
  /** Discord avatar hash from the OAuth profile; null clears a removed avatar. */
  avatarHash?: string | null;
}

/**
 * Upsert a Discord user (keyed on discordId) and ensure they have a default
 * trueskill row, returning the internal user id. Ports the legacy
 * UserRepository.upsertUser, including its SERIALIZABLE transaction so a burst
 * of concurrent logins for a new user can't create duplicates.
 */
export async function upsertDiscordUser(db: Database, identity: DiscordIdentity): Promise<number> {
  return db.transaction(
    async (tx) => {
      const [row] = await tx
        .insert(user)
        .values({
          discordId: identity.discordId,
          username: identity.username,
          discriminator: identity.discriminator,
          discordAvatarHash: identity.avatarHash ?? null,
        })
        .onConflictDoUpdate({
          target: user.discordId,
          set: {
            username: identity.username,
            discriminator: identity.discriminator,
            discordAvatarHash: identity.avatarHash ?? null,
          },
        })
        .returning({ id: user.id });
      if (!row) throw new Error('Failed to upsert user');

      // Defaults (mu/sigma) come from the schema; only create if absent.
      await tx.insert(userTrueskill).values({ userId: row.id }).onConflictDoNothing();

      return row.id;
    },
    { isolationLevel: 'serializable' },
  );
}
