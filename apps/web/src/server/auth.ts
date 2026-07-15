import { createServerEnv } from '@scythe/config';
import { getDb } from '@scythe/db';
import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { upsertDiscordUser } from './auth-user';

const env = createServerEnv();

/**
 * Auth.js (NextAuth v5) with Discord. We keep the existing `user` table as the
 * source of truth instead of adopting Auth.js's adapter tables: on each sign-in
 * the `jwt` callback upserts the Discord identity into `user` (mirroring the
 * legacy upsert-on-login) and stashes the internal id in the JWT. No database
 * sessions, so Redis is not needed for auth.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      // Match the legacy scope: we only need the basic identity.
      authorization: 'https://discord.com/api/oauth2/authorize?scope=identify',
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      // `profile` is only present on initial sign-in.
      if (profile?.id) {
        const identity = {
          discordId: String(profile.id),
          username: String(profile.username ?? profile.global_name ?? ''),
          // Discord retired discriminators for most users; default to "0".
          discriminator: String(profile.discriminator ?? '0'),
          // Avatar hash for CDN profile images; null when unset (initials fallback).
          avatarHash: profile.avatar ? String(profile.avatar) : null,
        };
        token.userId = await upsertDiscordUser(getDb(), identity);
        token.discordId = identity.discordId;
        token.username = identity.username;
        token.discriminator = identity.discriminator;
      }
      return token;
    },
    session({ session, token }) {
      // The JWT is typed `Record<string, unknown>`; read back our own fields.
      const fields = token as {
        userId?: number;
        discordId?: string;
        username?: string;
        discriminator?: string;
      };
      if (fields.userId != null) {
        // Attach our fields without fighting Auth.js's callback User type; they
        // ride through at runtime and are read back (cast) in `createContext`.
        Object.assign(session.user, {
          userId: fields.userId,
          discordId: fields.discordId ?? '',
          username: fields.username ?? '',
          discriminator: fields.discriminator ?? '',
        });
      }
      return session;
    },
  },
});
