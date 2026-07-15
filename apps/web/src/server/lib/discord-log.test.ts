import { describe, expect, it } from 'vitest';
import { buildMatchEmbed, type MatchLogEntry } from './discord-log';

describe('buildMatchEmbed', () => {
  it('mirrors the legacy embed: winner headline, ordinal fields, bid math', () => {
    const entries: MatchLogEntry[] = [
      {
        displayName: 'bob',
        faction: 'Rusviet',
        playerMat: 'Industrial',
        coins: 20,
        bid: 5,
        rank: 2,
      },
      {
        displayName: 'alice',
        faction: 'Crimean',
        playerMat: 'Patriotic',
        coins: 30,
        bid: 10,
        rank: 1,
      },
    ];
    const embed = buildMatchEmbed(entries, 16, 'https://belovedpacifist.com', (f) => `<:${f}:1>`);

    expect(embed.title).toBe('Match Log');
    expect(embed.description).toBe(
      'alice won as <:Crimean:1> Patriotic in 16 rounds with $20 coins!',
    );
    expect(embed.fields).toEqual([
      { name: '🥇 1st place', value: '**alice** - <:Crimean:1> Patriotic: $30 - $10 = $20' },
      { name: '🥈 2nd place', value: '**bob** - <:Rusviet:1> Industrial: $20 - $5 = $15' },
    ]);
    expect(embed.footer).toEqual({ text: 'Via https://belovedpacifist.com' });
  });

  it('omits bid math for casual matches and handles singular units', () => {
    const casual: MatchLogEntry[] = [
      {
        displayName: 'a',
        faction: 'Nordic',
        playerMat: 'Agricultural',
        coins: 1,
        bid: null,
        rank: 1,
      },
      {
        displayName: 'b',
        faction: 'Togawa',
        playerMat: 'Industrial',
        coins: 0,
        bid: null,
        rank: 2,
      },
    ];
    const embed = buildMatchEmbed(casual, 1, '', (f) => f);

    expect(embed.description).toBe('a won as Nordic Agricultural in 1 round with $1 coin!');
    expect(embed.fields[0]?.value).toBe('**a** - Nordic Agricultural: $1');
    expect(embed.footer).toBeUndefined();
    expect(embed.url).toBeUndefined();
  });

  it('uses plain ordinals past the medals', () => {
    const entries: MatchLogEntry[] = [1, 2, 3, 4, 5].map((rank) => ({
      displayName: `p${rank}`,
      faction: `F${rank}`,
      playerMat: `M${rank}`,
      coins: 50 - rank,
      bid: null,
      rank,
    }));
    const embed = buildMatchEmbed(entries, 10, '', (f) => f);
    expect(embed.fields.map((f) => f.name)).toEqual([
      '🥇 1st place',
      '🥈 2nd place',
      '🥉 3rd place',
      '4th place',
      '5th place',
    ]);
  });
});
