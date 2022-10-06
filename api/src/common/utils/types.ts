export interface Combo {
  factionId: number;
  playerMatId: number;
}

export type Bid = Combo & { coins: number; playerId: number; date: Date };

export interface TrueskillChange {
  before: {
    sigma: number;
    mu: number;
  };
  after: {
    sigma: number;
    mu: number;
  };
}
