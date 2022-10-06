import got from 'got';
import { getCustomRepository } from 'typeorm';

import { Context } from '../../graphql/context';
import UserRepository from '../../db/repositories/user-repository';

const DISCORD_ME_URL = 'https://discord.com/api/users/@me';

export const fetchDiscordMe = async (
  context: Context
): Promise<{
  id: number;
  username: string;
  discriminator: string;
  discordId: string;
} | null> => {
  if (!context || !context.session || !context.session.discordTokenInfo) {
    return null;
  }

  try {
    const { body } = await got.get(DISCORD_ME_URL, {
      headers: {
        Authorization: `${context.session.discordTokenInfo.token_type} ${context.session.discordTokenInfo.access_token}`,
      },
    });
    const {
      id: discordId,
      username,
      discriminator,
    } = JSON.parse(body) as {
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

    const userRepository = getCustomRepository(UserRepository);
    const userId = await userRepository.upsertUser({
      discordId,
      username,
      discriminator,
    });
    context.session.userId = userId;

    return {
      id: userId,
      username,
      discriminator,
      discordId,
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

  return null;
};
