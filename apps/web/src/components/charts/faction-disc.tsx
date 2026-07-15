import Image from 'next/image';
import { FACTION_COLORS, factionIcon, factionInitial } from '~/lib/factions';

/**
 * Faction token rendered as the real faction emblem (the original site's
 * faction-icons). Falls back to a neutral monogram disc for unknown/missing
 * factions so callers can pass a placeholder name safely.
 */
export function FactionDisc({
  faction,
  size = 32,
  ring = true,
}: {
  faction: string;
  size?: number;
  ring?: boolean;
}) {
  if (!(faction in FACTION_COLORS)) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground leading-none"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        {factionInitial(faction)}
      </span>
    );
  }
  return (
    <Image
      src={factionIcon(faction)}
      alt={faction}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-contain"
      style={ring ? { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' } : undefined}
    />
  );
}
