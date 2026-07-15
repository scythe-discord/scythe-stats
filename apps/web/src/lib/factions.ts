/**
 * Faction & tier visual language for the stats UI.
 *
 * These hex values are the product's own *data-viz* palette (faction identity
 * colors, tier-band colors) — deliberately NOT design-system tokens. Per the
 * design-system convention, page chrome uses semantic Tailwind tokens
 * (`bg-card`, `text-muted-foreground`, …) while faction/tier colors drive
 * charts and chips. Keys are the real DB faction/tier names (note "Crimean").
 */

export const FACTION_COLORS: Record<string, string> = {
  Polania: '#fafafa',
  Saxony: '#6b7280',
  Crimean: '#d4a017',
  Nordic: '#3f7cb0',
  Rusviet: '#b03a2e',
  Albion: '#5f9e54',
  Togawa: '#9b6ec4',
};

export const FACTION_INITIALS: Record<string, string> = {
  Polania: 'P',
  Saxony: 'S',
  Crimean: 'C',
  Nordic: 'N',
  Rusviet: 'R',
  Albion: 'A',
  Togawa: 'T',
};

/** Tier-band colors, keyed by tier name (SS / S / A / B / C / D / F). */
export const TIER_COLORS: Record<string, string> = {
  SS: '#d8a93a',
  S: '#d97a45',
  A: '#5aa46a',
  B: '#3f7cb0',
  C: '#8a7fc0',
  D: '#7a8694',
  F: '#a64a44',
};

export const NEUTRAL_BLUE = '#5B9BD5';

const MUTED = 'var(--muted-foreground)';

export function factionColor(name: string): string {
  return FACTION_COLORS[name] ?? MUTED;
}

export function factionInitial(name: string): string {
  return FACTION_INITIALS[name] ?? name.charAt(0);
}

export function tierColor(name: string): string {
  return TIER_COLORS[name] ?? MUTED;
}

/** Public asset path for a faction icon (file slug = lowercased name). */
export function factionIcon(name: string): string {
  return `/faction-icons/${name.toLowerCase()}.png`;
}

/** Public asset path for a faction mat illustration. */
export function factionMat(name: string, full = false): string {
  return `/faction-mats/${name.toLowerCase()}${full ? '-full' : ''}.png`;
}

/** Public asset path for a player-mat illustration (slug = lowercased mat name). */
export function playerMatArt(name: string, full = false): string {
  return `/player-mats/${name.toLowerCase()}${full ? '-full' : ''}.png`;
}
