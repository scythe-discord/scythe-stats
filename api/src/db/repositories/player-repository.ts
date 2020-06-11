import { EntityRepository, Repository } from 'typeorm';

import { Player, PlayerMatchResult } from '../entities';

@EntityRepository(Player)
export default class PlayerRepository extends Repository<Player> {
  findOrCreatePlayer = async (
    displayName: string,
    steamId: string | null = null
  ): Promise<Player> => {
    const playerFilter = steamId
      ? {
          steamId,
        }
      : {
          displayName,
        };

    const existingPlayer = await this.manager.findOne(Player, {
      where: playerFilter,
    });

    if (existingPlayer) {
      if (existingPlayer.displayName !== displayName) {
        existingPlayer.displayName = displayName;
        await this.manager.save(existingPlayer);
        await this.mergeFloatingPlayers(existingPlayer);
      }

      return existingPlayer;
    }

    const newPlayer = await this.manager.save(
      await this.manager.create(Player, {
        displayName,
        steamId,
      })
    );

    if (steamId) {
      await this.mergeFloatingPlayers(newPlayer);
    }

    return newPlayer;
  };

  mergeFloatingPlayers = async (player: Player): Promise<void> => {
    const floatingPlayer = await this.manager.findOne(Player, {
      displayName: player.displayName,
      steamId: null,
    });

    if (floatingPlayer) {
      await this.manager.update(
        PlayerMatchResult,
        { player: floatingPlayer },
        { player }
      );
      await this.manager.delete(Player, { id: floatingPlayer.id });
    }
  };
}
