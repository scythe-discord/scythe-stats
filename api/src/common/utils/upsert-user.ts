import { getRepository } from 'typeorm';
import { User } from '../../db/entities';

export async function upsertUser({
  discordId,
  username,
  discriminator
}: {
  discordId: string;
  username: string;
  discriminator: string;
}) {
  const userRepo = getRepository(User);

  const result = await userRepo.upsert(
    { discordId, username, discriminator },
    { conflictPaths: ['discordId'] }
  );

  return result.identifiers[0].id as number;
}
