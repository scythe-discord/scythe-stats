import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities';
import UserTrueskill from '../entities/user-trueskill';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
  upsertUser = async ({
    discordId,
    username,
    discriminator,
  }: {
    discordId: string;
    username: string;
    discriminator: string;
  }) => {
    let userId: number | undefined = undefined;
    await this.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const result = await transactionalEntityManager.upsert(
          User,
          { discordId, username, discriminator },
          { conflictPaths: ['discordId'] }
        );

        userId = result.identifiers[0].id;

        try {
          await transactionalEntityManager.upsert(UserTrueskill, { userId }, [
            'userId',
          ]);
        } catch (e) {
          console.error(e);
        }
      }
    );

    if (userId == null) {
      throw new Error('Something went wrong creating a new user');
    }
    return userId;
  };
}
