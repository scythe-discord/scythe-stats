export interface Combo {
  factionId: number;
  playerMatId: number;
}

export type Bid = Combo & { coins: number; playerId: number; date: Date };
