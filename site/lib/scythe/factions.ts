import urljoin from 'url-join';

import { PUBLIC_ASSETS_URL } from '../env';

const FACTION_ICONS_PATH = '/faction-icons';

const FACTION_EMBLEMS: { [key: string]: string } = {
  Polania: urljoin(PUBLIC_ASSETS_URL, FACTION_ICONS_PATH, 'polania.png'),
  Saxony: urljoin(PUBLIC_ASSETS_URL, FACTION_ICONS_PATH, 'saxony.png'),
  Crimean: urljoin(PUBLIC_ASSETS_URL, FACTION_ICONS_PATH, 'crimean.png'),
  Nordic: urljoin(PUBLIC_ASSETS_URL, FACTION_ICONS_PATH, 'nordic.png'),
  Rusviet: urljoin(PUBLIC_ASSETS_URL, FACTION_ICONS_PATH, 'rusviet.png'),
  Albion: urljoin(PUBLIC_ASSETS_URL, FACTION_ICONS_PATH, 'albion.png'),
  Togawa: urljoin(PUBLIC_ASSETS_URL, FACTION_ICONS_PATH, 'togawa.png')
};

export const getFactionEmblem = (factionName: string) =>
  FACTION_EMBLEMS[factionName];
