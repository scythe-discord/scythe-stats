import { IsNull } from 'typeorm';

import { Player, PlayerMatchResult } from '../entities';
import { scytheDb } from '..';

const mergeFloatingPlayers = async (player: Player): Promise<void> => {
  const floatingPlayer = await scytheDb.manager.findOneBy(Player, {
    displayName: player.displayName,
    steamId: IsNull(),
  });

  if (floatingPlayer) {
    await scytheDb.manager.update(
      PlayerMatchResult,
      { player: floatingPlayer },
      { player }
    );
    await scytheDb.manager.delete(Player, { id: floatingPlayer.id });
  }
};

const PlayerRepository = scytheDb.getRepository(Player).extend({
  findOrCreatePlayer: async (
    displayName: string,
    steamId: string | null = null,
    userId: number | null = null
  ): Promise<Player> => {
    let playerFilter: {
      displayName?: string;
      steamId?: string;
      userId?: number;
    } = { displayName };

    if (userId != null) {
      playerFilter = { userId };
    } else if (steamId) {
      playerFilter = { steamId };
    }

    const existingPlayer = await scytheDb.manager.findOne(Player, {
      where: playerFilter,
    });

    if (existingPlayer) {
      if (existingPlayer.displayName !== displayName) {
        existingPlayer.displayName = displayName;
        await scytheDb.manager.save(existingPlayer);
        await mergeFloatingPlayers(existingPlayer);
      }

      return existingPlayer;
    }

    const newPlayer = await scytheDb.manager.save(
      await scytheDb.manager.create(Player, {
        displayName,
        steamId,
        userId,
      })
    );

    if (steamId) {
      await mergeFloatingPlayers(newPlayer);
    }

    return newPlayer;
  },
});

export default PlayerRepository;
