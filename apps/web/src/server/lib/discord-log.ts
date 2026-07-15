import { createServerEnv } from '@scythe/config';

/**
 * Discord match-log announce — port of the legacy `postMatchLog`
 * (api/src/graphql/schema/matches/log-match.ts). Builds the same embed
 * (winner headline, per-place fields with the bid math for bid games) and
 * posts it to every configured guild/channel pair over the Discord REST API.
 *
 * Differences from legacy, both deliberate:
 *  - plain REST `fetch` with the bot token instead of a discord.js login per post;
 *  - a missing custom faction emoji falls back to the faction's name (legacy
 *    threw, which silently killed the whole post).
 *
 * Fire-and-forget: never blocks or fails the recording mutation. Unconfigured
 * environments (no token/channels) are a silent no-op.
 */

export interface MatchLogEntry {
  displayName: string;
  faction: string;
  playerMat: string;
  coins: number;
  /** Bid penalty for bid-game matches; null for casual matches. */
  bid: number | null;
  rank: number;
}

const DISCORD_API = 'https://discord.com/api/v10';
const EMBED_COLOR = 0x05a357; // legacy '#05A357'
const MEDALS = ['🥇', '🥈', '🥉'];

function getOrdinal(n: number): string {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n}st`;
  if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
  return `${n}th`;
}

/**
 * Build the match-log embed (legacy `generateMatchLogMessage` parity).
 * `emojiFor` maps a faction name to its rendered form — a custom guild emoji
 * (`<:name:id>`) when available, else the plain name.
 */
export function buildMatchEmbed(
  entries: MatchLogEntry[],
  numRounds: number,
  siteUrl: string,
  emojiFor: (faction: string) => string,
) {
  const ordered = [...entries].sort((a, b) => a.rank - b.rank);
  const winner = ordered[0];
  if (!winner) throw new Error('Cannot build a match log without results');

  const winnerFinal = winner.coins - (winner.bid ?? 0);
  const description =
    `${winner.displayName} won as ${emojiFor(winner.faction)} ${winner.playerMat} ` +
    `in ${numRounds} ${numRounds === 1 ? 'round' : 'rounds'} ` +
    `with $${winnerFinal} ${winnerFinal === 1 ? 'coin' : 'coins'}!`;

  const fields = ordered.map((r, i) => {
    const medal = MEDALS[i] ? `${MEDALS[i]} ` : '';
    const bidMath = r.bid != null ? ` - $${r.bid} = $${r.coins - r.bid}` : '';
    return {
      name: `${medal}${getOrdinal(i + 1)} place`,
      value: `**${r.displayName}** - ${emojiFor(r.faction)} ${r.playerMat}: $${r.coins}${bidMath}`,
    };
  });

  return {
    title: 'Match Log',
    color: EMBED_COLOR,
    description,
    url: siteUrl || undefined,
    footer: siteUrl ? { text: `Via ${siteUrl}` } : undefined,
    fields,
  };
}

// Custom emoji per guild, fetched once per process: guildId -> name -> id.
const emojiCache = new Map<string, Map<string, string>>();

async function guildEmojis(token: string, guildId: string): Promise<Map<string, string>> {
  const cached = emojiCache.get(guildId);
  if (cached) return cached;
  const map = new Map<string, string>();
  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/emojis`, {
      headers: { Authorization: `Bot ${token}` },
    });
    if (res.ok) {
      const emojis = (await res.json()) as Array<{ id: string; name: string }>;
      for (const e of emojis) map.set(e.name, e.id);
    }
  } catch {
    // Emoji lookup is cosmetic; fall through to plain faction names.
  }
  emojiCache.set(guildId, map);
  return map;
}

/**
 * Post the match log to every configured channel. Fire-and-forget — call
 * without awaiting; errors are logged, never thrown.
 */
export function postMatchLog(entries: MatchLogEntry[], numRounds: number): void {
  void (async () => {
    try {
      const env = createServerEnv();
      const token = env.DISCORD_BOT_TOKEN;
      const guildIds = env.GUILD_IDS?.split(',').map((s) => s.trim()) ?? [];
      const channelIds = env.VANILLA_LOG_CHANNEL_IDS?.split(',').map((s) => s.trim()) ?? [];
      if (!token || guildIds.length === 0 || channelIds.length === 0) return;

      for (let i = 0; i < guildIds.length; i++) {
        const guildId = guildIds[i];
        const channelId = channelIds[i];
        if (!guildId || !channelId) continue;

        const emojis = await guildEmojis(token, guildId);
        const emojiFor = (faction: string) => {
          const id = emojis.get(faction);
          return id ? `<:${faction}:${id}>` : faction;
        };
        const embed = buildMatchEmbed(entries, numRounds, env.SITE_URL ?? '', emojiFor);

        const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
          method: 'POST',
          headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: [embed] }),
        });
        if (!res.ok) {
          console.error(`Failed to post match log to channel ${channelId}: ${res.status}`);
        }
      }
    } catch (err) {
      console.error('Failed to post match log', err);
    }
  })();
}
