import { PUBLIC_ASSETS_URL } from '../env';

const FACTION_EMBLEMS: { [key: string]: string } = {
  Polania: `${PUBLIC_ASSETS_URL}/faction-icons/polania.png`,
  Saxony: `${PUBLIC_ASSETS_URL}/faction-icons/saxony.png`,
  Crimean: `${PUBLIC_ASSETS_URL}/faction-icons/crimean.png`,
  Nordic: `${PUBLIC_ASSETS_URL}/faction-icons/nordic.png`,
  Rusviet: `${PUBLIC_ASSETS_URL}/faction-icons/rusviet.png`,
  Albion: `${PUBLIC_ASSETS_URL}/faction-icons/albion.png`,
  Togawa: `${PUBLIC_ASSETS_URL}/faction-icons/togawa.png`
};

export const getFactionEmblem = (factionName: string) =>
  FACTION_EMBLEMS[factionName];
