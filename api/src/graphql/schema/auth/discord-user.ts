import { gql } from 'apollo-server-express';
import got from 'got';

import Schema from '../codegen';

const DISCORD_ME_URL = 'https://discord.com/api/users/@me';

export const typeDef = gql`
  extend type Query {
    discordMe: DiscordUser
  }

  type DiscordUser {
    id: String!
    username: String!
    discriminator: String!
  }
`;

export const resolvers: Schema.Resolvers = {
  Query: {
    discordMe: async (_, __, context) => {
      if (context.session && context.session.discordTokenInfo) {
        try {
          const { body } = await got.get(DISCORD_ME_URL, {
            headers: {
              Authorization: `${context.session.discordTokenInfo.token_type} ${context.session.discordTokenInfo.access_token}`,
            },
          });
          const { id, username, discriminator } = JSON.parse(body) as {
            id: string;
            username: string;
            avatar: string;
            discriminator: string;
            public_flags: number;
            flags: number;
            locale: string;
            mfa_enabled: boolean;
            premium_type: number;
          };

          return {
            id,
            username,
            discriminator,
          };
        } catch (e) {
          // Token is no longer valid - invalidate stored session info
          context.res.clearCookie('connect.sid', { path: '/' });
          context.session.destroy((err: any) => {
            if (err) {
              console.error('Failed to destroy session', context.session, err);
            }
          });
        }
      }
      return null;
    },
  },
};
