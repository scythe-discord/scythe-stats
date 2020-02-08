const FACTION_EMBLEMS: { [key: string]: string } = {
  Polania: '/factions/polania-icon.png',
  Saxony: '/factions/saxony-icon.png',
  Crimean: '/factions/crimean-icon.png',
  Nordic: '/factions/nordic-icon.png',
  Rusviet: '/factions/rusviet-icon.png',
  Albion: '/factions/albion-icon.png',
  Togawa: '/factions/togawa-icon.png'
};

export const getFactionEmblem = (factionName: string) =>
  FACTION_EMBLEMS[factionName];
