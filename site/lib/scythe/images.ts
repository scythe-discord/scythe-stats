import urljoin from 'url-join';

import { PUBLIC_ASSETS_URL } from '../env';

const FACTION_ICONS_PATH = '/faction-icons';
const FACTION_MATS_PATH = '/faction-mats';
const PLAYER_MATS_PATH = '/player-mats';

export const getFactionEmblem = (factionName: string) =>
  urljoin(FACTION_ICONS_PATH, `${factionName.toLowerCase()}.png`);
export const getFactionMatImg = (factionName: string, fullSize?: boolean) =>
  urljoin(
    FACTION_MATS_PATH,
    `${factionName.toLowerCase()}${fullSize ? '-full' : ''}.png`
  );
export const getPlayerMatImg = (playerMatName: string, fullSize?: boolean) =>
  urljoin(
    PLAYER_MATS_PATH,
    `${playerMatName.toLowerCase()}${fullSize ? '-full' : ''}.png`
  );
