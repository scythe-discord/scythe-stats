'use client';

import { keepPreviousData } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FactionBars } from '~/components/charts/faction-bars';
import { FactionDisc } from '~/components/charts/faction-disc';
import { WinRateCell } from '~/components/charts/win-rate-cell';
import { WinRateLine } from '~/components/charts/win-rate-line';
import { RecordMatchModal } from '~/components/home/record-match-modal';
import { Panel } from '~/components/site/panel';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { factionColor, NEUTRAL_BLUE } from '~/lib/factions';
import { timeAgo, winRate } from '~/lib/format';
import { trpc } from '~/trpc/react';

const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7] as const;

// Rating up/down reuse the tier-A green / tier-F red hues from the domain palette.
const RATING_UP = '#5aa46a';
const RATING_DOWN = '#a64a44';

const labelCls = 'text-[11px] font-semibold uppercase tracking-[0.6px] text-muted-foreground';
const sectionTitleCls = 'text-lg font-semibold tracking-[-0.2px] m-0';

function StatTile({ k, v, s, accent }: { k: string; v: string; s: string; accent?: string }) {
  // Text values (mat names, player names) use a smaller size than numeric ones
  // so they wrap inside the tile instead of overflowing it.
  const isText = /[^\d,.%\s]/.test(v);
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-border bg-background px-3.5 py-4 sm:px-[18px]">
      <span className={labelCls}>{k}</span>
      <span
        className={
          isText
            ? 'font-bold text-[19px] leading-tight tracking-[-0.4px] [overflow-wrap:anywhere]'
            : 'font-bold text-[24px] leading-[1.05] tabular-nums tracking-[-1px] [overflow-wrap:anywhere] sm:text-[30px] sm:leading-none'
        }
        style={{ color: accent ?? 'var(--foreground)' }}
      >
        {v}
      </span>
      <span className="text-[12.5px] text-muted-foreground">{s}</span>
    </div>
  );
}

function TopPlayersTable({ rows }: { rows: { id: number; name: string; wins: number }[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-9">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">Total Wins</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((p, i) => (
          <TableRow key={p.id}>
            <TableCell className="font-semibold text-muted-foreground tabular-nums">
              {i + 1}
            </TableCell>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{p.wins}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-muted-foreground">
              No wins recorded yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function HomeView() {
  const [counts, setCounts] = useState<Set<number>>(new Set([3, 4]));
  const [selFaction, setSelFaction] = useState<string | null>(null);
  const [selMatchId, setSelMatchId] = useState<number | null>(null);

  const pcArr = counts.size > 0 && counts.size < PLAYER_COUNTS.length ? [...counts] : undefined;
  const statInput = pcArr ? { playerCounts: pcArr as [number, ...number[]] } : {};

  const factionsQ = trpc.reference.factions.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });
  const matsQ = trpc.reference.playerMats.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });
  const factionStatsQ = trpc.stats.factionStats.useQuery(statInput, {
    placeholderData: keepPreviousData,
  });
  const comboStatsQ = trpc.stats.comboStats.useQuery(statInput, {
    placeholderData: keepPreviousData,
  });
  const matchesQ = trpc.matches.list.useInfiniteQuery(
    { first: 10 },
    { getNextPageParam: (page) => (page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null) },
  );

  // Per-player-count faction stats feed the by-count line chart (one grouped query).
  const byCountQ = trpc.stats.factionStatsByPlayerCount.useQuery();

  const factions = factionsQ.data ?? [];
  const effFaction = selFaction ?? factions[0]?.name ?? null;
  const selFactionRow = factions.find((f) => f.name === effFaction) ?? null;
  const selFactionId = selFactionRow?.id ?? null;

  const matsById = useMemo(() => new Map((matsQ.data ?? []).map((m) => [m.id, m])), [matsQ.data]);

  const topPlayersQ = trpc.stats.topPlayers.useQuery(
    selFactionId != null
      ? {
          factionId: selFactionId,
          first: 5,
          ...(pcArr ? { playerCounts: pcArr as [number, ...number[]] } : {}),
        }
      : { factionId: 0, first: 5 },
    { enabled: selFactionId != null, placeholderData: keepPreviousData },
  );

  // All-time leaderboard across every faction (legacy top-players "of all time").
  const topAllTimeQ = trpc.players.byWins.useQuery({ first: 5 });

  // Faction win-rate bars (ordered by faction position, as returned).
  const factionWinRates = (factionStatsQ.data ?? []).map((f) => ({
    faction: f.name,
    rate: winRate(f.totalWins, f.totalMatches),
  }));

  const selStats = (factionStatsQ.data ?? []).find((f) => f.factionId === selFactionId);

  // Player-mat stats for the selected faction, sorted by win rate.
  const matStats = (comboStatsQ.data ?? [])
    .filter((c) => c.factionId === selFactionId)
    .map((c) => {
      const mat = c.playerMatId != null ? matsById.get(c.playerMatId) : undefined;
      return {
        mat: mat?.name ?? '—',
        winRate: winRate(c.totalWins, c.totalMatches),
        matches: c.totalMatches,
        coins: c.avgCoinsOnWin,
        rounds: c.avgRoundsOnWin,
        fastest: c.leastRoundsForWin,
      };
    })
    .sort((a, b) => b.winRate - a.winRate);
  const bestMat = matStats[0];

  // Line: selected faction's win rate per player count. null = no games at that
  // count (rendered as a gap), distinct from a genuine 0% win rate.
  const lineActual = PLAYER_COUNTS.map((c) => {
    const row = byCountQ.data?.find((r) => r.factionId === selFactionId && r.playerCount === c);
    return row ? winRate(row.totalWins, row.totalMatches) : null;
  });

  const matches = matchesQ.data?.pages.flatMap((p) => p.edges) ?? [];
  // Selected match defaults to the newest; keyed by match id (not list index)
  // so the selection survives refetches and newly-recorded matches.
  const selMatch = matches.find((e) => e.node.id === selMatchId)?.node ?? matches[0]?.node;
  const board = [...(selMatch?.results ?? [])].sort((a, b) => a.rank - b.rank);

  // Infinite scroll for the Recent Matches timeline: fetch the next page when
  // the sentinel at the bottom of the scroll container comes into view.
  const matchListRef = useRef<HTMLDivElement | null>(null);
  const matchSentinelRef = useRef<HTMLDivElement | null>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = matchesQ;
  useEffect(() => {
    const root = matchListRef.current;
    const sentinel = matchSentinelRef.current;
    if (!root || !sentinel || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !isFetchingNextPage) void fetchNextPage();
      },
      { root, rootMargin: '120px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // True while a player-count toggle is refetching (keepPreviousData keeps the
  // old rows on screen, so isFetching — not isLoading — signals the transition).
  const pcFetching = factionStatsQ.isFetching || comboStatsQ.isFetching || topPlayersQ.isFetching;

  const toggleCount = (c: number) => {
    if (pcFetching) return;
    setCounts((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const accent = effFaction ? factionColor(effFaction) : 'var(--chart-2)';

  if (factionsQ.isLoading || !effFaction) {
    return (
      <div className="grid grid-cols-1 gap-6 px-4 py-7 sm:px-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <Skeleton className="h-[520px] w-full rounded-[14px]" />
        <Skeleton className="h-[520px] w-full rounded-[14px]" />
      </div>
    );
  }

  const overallRate = selStats ? winRate(selStats.totalWins, selStats.totalMatches) : 0;

  return (
    <div className="grid grid-cols-1 gap-6 px-4 pt-7 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      {/* LEFT */}
      <div className="flex flex-col gap-6">
        <Panel>
          {/* faction header */}
          <div className="mb-[22px] flex flex-wrap items-center gap-4">
            <FactionDisc faction={effFaction} size={54} />
            <div className="flex-1">
              <h1 className="m-0 font-bold text-[28px] leading-none tracking-[-0.8px] sm:text-[34px]">
                {effFaction}
              </h1>
              <span className="text-[13px] text-muted-foreground">Faction overview · all-time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>Players</span>
              <div className="flex gap-1" aria-busy={pcFetching}>
                {PLAYER_COUNTS.map((c) => {
                  const on = counts.has(c);
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleCount(c)}
                      disabled={pcFetching}
                      className="inline-flex size-[30px] items-center justify-center rounded-lg font-semibold text-[13px] tabular-nums transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                      style={{
                        background: on ? 'var(--primary)' : 'transparent',
                        color: on ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                        border: on ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      {pcFetching && on ? <Loader2 className="size-3.5 animate-spin" /> : c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* stat tiles */}
          <div className="mb-[26px] grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              k="Games Recorded"
              v={(selStats?.totalMatches ?? 0).toLocaleString()}
              s="across selected player counts"
            />
            <StatTile
              k="Total Wins"
              v={(selStats?.totalWins ?? 0).toLocaleString()}
              s={`${overallRate.toFixed(1)}% overall win rate`}
            />
            <StatTile
              k="Best Player Mat"
              v={bestMat?.mat ?? '—'}
              s={bestMat ? `${bestMat.winRate.toFixed(2)}% win rate` : 'no data'}
            />
            <StatTile
              k="Top Player"
              v={topPlayersQ.data?.[0]?.player.displayName ?? '—'}
              s={
                topPlayersQ.data?.[0]
                  ? `${topPlayersQ.data[0].totalWins} wins as ${effFaction}`
                  : 'no data'
              }
            />
          </div>

          {/* faction win rates */}
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className={sectionTitleCls}>Faction win rates</h2>
            <span className="text-[12.5px] text-muted-foreground">
              click a bar to switch faction
            </span>
          </div>
          <div className="pl-[34px]">
            <FactionBars
              data={factionWinRates}
              highlight={effFaction}
              onSelect={setSelFaction}
              height={210}
            />
          </div>
        </Panel>

        {/* Player Mat Stats */}
        <Panel>
          <div className="mb-3.5 flex items-baseline justify-between">
            <h2 className={sectionTitleCls}>Player Mat Stats</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player Mat</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Matches</TableHead>
                <TableHead className="hidden text-right md:table-cell">Avg Coins</TableHead>
                <TableHead className="hidden text-right md:table-cell">Avg Rounds</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Fastest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matStats.map((m) => {
                const best = bestMat && m.mat === bestMat.mat;
                return (
                  <TableRow
                    key={m.mat}
                    style={
                      best
                        ? { background: `color-mix(in oklab, ${accent} 9%, transparent)` }
                        : undefined
                    }
                  >
                    <TableCell style={{ fontWeight: best ? 700 : 500 }}>{m.mat}</TableCell>
                    <TableCell>
                      <WinRateCell value={m.winRate} color={NEUTRAL_BLUE} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{m.matches}</TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">
                      {m.coins}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">
                      {m.rounds.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden text-right text-muted-foreground tabular-nums sm:table-cell">
                      {m.fastest != null ? `${m.fastest} rds` : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Panel>

        {/* Win rates by player count */}
        <Panel>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className={sectionTitleCls}>Win Rates by player count</h2>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-foreground">
                <span className="h-[3px] w-3.5 rounded-sm" style={{ background: accent }} />
                {effFaction}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-3.5 border-muted-foreground border-t-2 border-dashed" />
                Expected
              </span>
            </div>
          </div>
          <WinRateLine
            counts={[...PLAYER_COUNTS]}
            actual={lineActual}
            accent={accent}
            height={230}
            width={620}
          />
        </Panel>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-6">
        <Panel>
          <div className="mb-[18px] flex items-center justify-between">
            <h2 className={sectionTitleCls}>Recent Matches</h2>
            <RecordMatchModal />
          </div>
          <div
            ref={matchListRef}
            className="-mr-2 flex max-h-[440px] flex-col overflow-y-auto pr-2"
          >
            {matches.map((edge, i) => {
              const m = edge.node;
              const w = m.winner;
              const last = i === matches.length - 1;
              const fac = w?.faction?.name ?? '—';
              const c = factionColor(fac);
              const sel = m.id === selMatch?.id;
              return (
                <button
                  key={edge.cursor}
                  type="button"
                  aria-pressed={sel}
                  onClick={() => setSelMatchId(m.id)}
                  className="group flex cursor-pointer gap-3.5 text-left outline-none"
                >
                  <div className="flex w-3.5 flex-col items-center">
                    <span
                      className="mt-[13px] size-[9px] shrink-0 rounded-full"
                      style={{
                        background: c,
                        boxShadow: sel
                          ? `0 0 0 3.5px color-mix(in oklab, ${c} 50%, transparent)`
                          : `0 0 0 3px color-mix(in oklab, ${c} 22%, transparent)`,
                      }}
                    />
                    {!last && <span className="my-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="min-w-0 flex-1" style={{ paddingBottom: last ? 0 : 8 }}>
                    <div
                      className="rounded-[10px] border px-3 pt-[7px] pb-[9px] transition-colors duration-100 hover:bg-[color-mix(in_oklab,var(--accent)_55%,transparent)] group-focus-visible:ring-2 group-focus-visible:ring-ring/60"
                      style={{
                        borderColor: sel
                          ? `color-mix(in oklab, ${c} 40%, var(--border))`
                          : 'transparent',
                        // Inline background wins over the hover class, so the
                        // selected row keeps its faction tint on hover.
                        background: sel ? `color-mix(in oklab, ${c} 10%, transparent)` : undefined,
                      }}
                    >
                      <div className="mb-[5px] flex items-center gap-2">
                        <span className="text-[11.5px] text-muted-foreground">
                          {timeAgo(m.datePlayed)}
                        </span>
                        {m.bidGame && (
                          <>
                            <Badge variant="secondary" className="px-[7px] py-px text-[9px]">
                              BID
                            </Badge>
                            <Badge variant="secondary" className="px-[7px] py-px text-[9px]">
                              {m.bidGame.ranked ? 'RANKED' : 'UNRANKED'}
                            </Badge>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[13.5px]">
                        <span className="font-semibold">{w?.player?.displayName ?? 'Unknown'}</span>
                        <span className="text-muted-foreground">won as</span>
                        <FactionDisc faction={fac} size={20} />
                        <span className="font-medium">{w?.playerMat?.name ?? ''}</span>
                        <span className="text-muted-foreground">· {m.numRounds} rounds</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {matches.length === 0 && !matchesQ.isLoading && (
              <p className="text-[13px] text-muted-foreground">No matches recorded yet.</p>
            )}
            {(matchesQ.isLoading || isFetchingNextPage) && (
              <div className="flex justify-center py-3">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <div ref={matchSentinelRef} />
          </div>

          {/* selected-match scoreboard */}
          {selMatch && board.length > 0 && (
            <div className="mt-2 border-border border-t pt-3.5">
              <div className="mb-0.5 flex items-baseline justify-between">
                <span className={labelCls}>Match scoreboard</span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(selMatch.datePlayed)} · {selMatch.numRounds} rounds
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Combination</TableHead>
                    <TableHead className="text-right">Coins</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {board.map((r) => {
                    const bid = r.bidGamePlayer?.bid?.coins;
                    const ts = r.playerTrueskill;
                    const muDiff = ts ? ts.after.mu - ts.before.mu : null;
                    return (
                      <TableRow
                        key={r.id}
                        style={
                          r.rank === 1
                            ? {
                                background: `color-mix(in oklab, ${factionColor(r.faction?.name ?? '')} 8%, transparent)`,
                              }
                            : undefined
                        }
                      >
                        <TableCell className="font-medium">
                          {r.player?.displayName ?? '—'}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {/* Block flex: the leading disc would otherwise drag the
                              inline baseline down and hoist the content off-center. */}
                          <div className="flex items-center gap-2">
                            <FactionDisc faction={r.faction?.name ?? '—'} size={20} />
                            <span className="min-w-[80px]">
                              {r.faction?.name} {r.playerMat?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {/* Bid games score as coins minus the winning bid. */}
                          {bid != null ? `${r.coins} − ${bid} = ${r.coins - bid}` : r.coins}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {ts && muDiff != null ? (
                            <span
                              style={{
                                color:
                                  muDiff > 0 ? RATING_UP : muDiff < 0 ? RATING_DOWN : undefined,
                              }}
                            >
                              {ts.after.mu.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                              (
                              {muDiff.toLocaleString(undefined, {
                                maximumFractionDigits: 1,
                                signDisplay: 'exceptZero',
                              })}
                              )
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">No change</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Panel>

        {/* Top players */}
        <Panel>
          <div className="mb-3.5 flex items-baseline justify-between">
            <h2 className={sectionTitleCls}>Top Players</h2>
            <span className="text-[12.5px] text-muted-foreground">all time</span>
          </div>
          <TopPlayersTable
            rows={(topAllTimeQ.data?.edges ?? []).map(({ node }) => ({
              id: node.id,
              name: node.displayName,
              wins: node.playerWins,
            }))}
          />
          <div className="mt-5 mb-3.5 flex items-baseline justify-between">
            <h3 className={`${sectionTitleCls} text-[15px]`}>as {effFaction}</h3>
          </div>
          <TopPlayersTable
            rows={(topPlayersQ.data ?? []).map((p) => ({
              id: p.player.id,
              name: p.player.displayName,
              wins: p.totalWins,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
