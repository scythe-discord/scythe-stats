'use client';

import { Eye, Settings } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FactionDisc } from '~/components/charts/faction-disc';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { winRate } from '~/lib/format';
import { trpc } from '~/trpc/react';
import type { BidGame, BidGameCombo, BidGamePlayer } from '~/trpc/types';
import { BidSettingsDialog } from './bid-settings-dialog';
import {
  type BidPhase,
  COIN_COLOR,
  Coin,
  CoinStepper,
  CopyLinkButton,
  PlayerToken,
  StageIndicator,
  StrengthMeter,
  TierBadge,
} from './primitives';
import { QuickBidView } from './quick-bid-view';
import { RecordResultsDialog } from './record-results-dialog';
import { type ComboMeta, strengthOf, tableOrder } from './types';

/* Left rail = players with live turn order; right = the auction board, phased
   Lobby · Bidding · Results by the game's status. */

const MAX_PLAYERS = 7;
const labelCls = 'text-[10.5px] font-bold uppercase tracking-[0.7px] text-muted-foreground';

function ConsolePanel({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[14px] border border-border bg-card ${className}`}
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,.25), 0 8px 24px rgba(0,0,0,.12)' }}
    >
      {children}
    </div>
  );
}

/** Everything the console's subpanels need about the loaded game. */
interface Ctx {
  game: BidGame;
  bidGameId: number;
  phase: BidPhase;
  myUserId: number | null;
  myPlayer: BidGamePlayer | null;
  isHost: boolean;
  isActive: boolean;
  pname: (p: BidGamePlayer) => string;
  /** Discord CDN avatar URL, or null → initials fallback. */
  avatarOf: (p: BidGamePlayer) => string | null;
  holderOf: (combo: BidGameCombo) => BidGamePlayer | null;
  heldComboOf: (playerId: number) => BidGameCombo | null;
  minBidFor: (combo: BidGameCombo) => number;
  metaOf: (factionId: number, playerMatId: number, comboId: number | null) => ComboMeta;
  /** Apply a mutation's returned game to the view (SSE-independent update). */
  onGame: (g: BidGame) => void;
}

export function BidGameView({ bidGameId }: { bidGameId: number }) {
  const me = trpc.auth.me.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const byId = trpc.bids.byId.useQuery({ bidGameId });
  const [live, setLive] = useState<BidGame | null>(null);
  trpc.bids.onUpdate.useSubscription({ bidGameId }, { onData: (g) => setLive(g) });

  const gameData = live ?? byId.data;

  // Win rates on the board are relative to this draft's player count.
  const playerCount = gameData?.players.length ?? 0;
  const comboStatsQ = trpc.stats.comboStats.useQuery(
    { playerCounts: [playerCount] },
    { enabled: playerCount >= 2 && playerCount <= MAX_PLAYERS },
  );
  const tierListQ = trpc.stats.tierList.useQuery();
  const factionsQ = trpc.reference.factions.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });
  const matsQ = trpc.reference.playerMats.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Apply each mutation's returned game directly so the actor's own screen
  // updates even if the SSE stream is down (legacy Apollo cache-merge parity).
  const onGame = (g: BidGame) => setLive(g);

  const join = trpc.bids.join.useMutation({
    onSuccess: onGame,
    onError: (e) => toast.error(e.message),
  });
  const start = trpc.bids.start.useMutation({
    onSuccess: onGame,
    onError: (e) => toast.error(e.message),
  });
  const placeBid = trpc.bids.bid.useMutation({
    onSuccess: onGame,
    onError: (e) => toast.error(e.message),
  });
  const updateRanked = trpc.bids.updateRanked.useMutation({
    onSuccess: onGame,
    onError: (e) => toast.error(e.message),
  });
  const updateQuickBid = trpc.bids.updateQuickBid.useMutation({
    onSuccess: onGame,
    onError: (e) => toast.error(e.message),
  });

  const [selComboId, setSelComboId] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);

  // win rate keyed per (faction, mat) combo — reflect the COMBO, not the faction.
  const winRateByCombo = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of comboStatsQ.data ?? []) {
      m.set(`${c.factionId}:${c.playerMatId}`, winRate(c.totalWins, c.totalMatches));
    }
    return m;
  }, [comboStatsQ.data]);

  const tierByCombo = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of tierListQ.data ?? []) {
      for (const c of t.combos) m.set(`${c.factionId}:${c.playerMatId}`, t.name);
    }
    return m;
  }, [tierListQ.data]);

  const factionsById = useMemo(
    () => new Map((factionsQ.data ?? []).map((f) => [f.id, f])),
    [factionsQ.data],
  );
  const matsById = useMemo(() => new Map((matsQ.data ?? []).map((m) => [m.id, m])), [matsQ.data]);

  if (byId.isLoading || !gameData) {
    return (
      <div className="flex flex-col gap-5 px-8 py-8">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }
  // Narrowed binding the nested render closures can rely on.
  const game = gameData;

  const myUserId = me.data?.userId ?? null;
  const myPlayer = game.players.find((p) => p.userId === myUserId) ?? null;
  const isHost = game.host?.userId != null && game.host.userId === myUserId;
  const isActive = !!myPlayer && game.activePlayer?.id === myPlayer.id && game.status === 'BIDDING';

  const phase: BidPhase =
    game.status === 'CREATED' ? 'lobby' : game.status === 'BIDDING' ? 'bidding' : 'results';

  const pname = (p: BidGamePlayer) => p.user?.username ?? 'Player';
  // The server builds the avatar URL; raw Discord ids stay out of the payload.
  const avatarOf = (p: BidGamePlayer) => p.user?.avatarUrl ?? null;
  const holderOf = (combo: BidGameCombo) =>
    combo.bid ? (game.players.find((p) => p.id === combo.bid?.bidGamePlayerId) ?? null) : null;
  const heldComboOf = (playerId: number) =>
    game.combos.find((c) => c.bid?.bidGamePlayerId === playerId) ?? null;
  const minBidFor = (combo: BidGameCombo) => (combo.bid ? combo.bid.coins + 1 : 0);

  const metaOf = (factionId: number, playerMatId: number, comboId: number | null): ComboMeta => {
    const key = `${factionId}:${playerMatId}`;
    return {
      comboId,
      factionId,
      playerMatId,
      faction: factionsById.get(factionId)?.name ?? '—',
      mat: matsById.get(playerMatId)?.name ?? '—',
      tier: tierByCombo.get(key) ?? null,
      winRate: winRateByCombo.get(key) ?? null,
      position: factionsById.get(factionId)?.position ?? 0,
      matOrder: matsById.get(playerMatId)?.order ?? 0,
    };
  };

  const ctx: Ctx = {
    game,
    bidGameId,
    phase,
    myUserId,
    myPlayer,
    isHost,
    isActive,
    pname,
    avatarOf,
    holderOf,
    heldComboOf,
    minBidFor,
    metaOf,
    onGame,
  };

  // The dealt combos in the legacy table order.
  const liveCombos = tableOrder(
    game.combos.map((c) => ({
      combo: c,
      m: metaOf(c.factionId as number, c.playerMatId as number, c.id),
    })),
    (x) => x.m,
  );

  // Optimistic setting toggles: flip the local game immediately so the segment
  // moves on click, reconcile with the server response (hook onSuccess), and
  // roll the flag back if the mutation fails.
  const setQuick = (quickBid: boolean) => {
    const prev = game.quickBid;
    setLive({ ...game, quickBid });
    updateQuickBid.mutate(
      { bidGameId, quickBid },
      { onError: () => setLive((cur) => (cur ? { ...cur, quickBid: prev } : cur)) },
    );
  };
  const setRankedOpt = (ranked: boolean) => {
    const prev = game.ranked;
    setLive({ ...game, ranked });
    updateRanked.mutate(
      { bidGameId, ranked },
      { onError: () => setLive((cur) => (cur ? { ...cur, ranked: prev } : cur)) },
    );
  };

  const openBid = (combo: BidGameCombo) => {
    setSelComboId(combo.id);
    setAmount(minBidFor(combo));
  };
  const submitBid = () => {
    if (selComboId == null) return;
    placeBid.mutate({ bidGameId, comboId: selComboId, coins: amount });
    setSelComboId(null);
  };

  return (
    <div className="px-5 pt-6 pb-10 lg:px-8">
      {/* ── header ── */}
      <div className="mb-[22px] flex flex-wrap items-center gap-4">
        <div>
          <h1 className="m-0 font-bold text-[26px] tracking-[-0.6px]">Bid Game</h1>
          <div className="mt-1.5 text-[13px] text-muted-foreground">
            {new Date(game.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </div>
        </div>
        <div className="flex-1" />
        <StageIndicator phase={phase} />
      </div>

      {/* ── body ── */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <PlayerRail
          ctx={ctx}
          loggedIn={!!me.data}
          onJoin={() => join.mutate({ bidGameId })}
          joinPending={join.isPending}
          onSetQuick={setQuick}
          quickPending={updateQuickBid.isPending}
          onSetRanked={setRankedOpt}
          rankedPending={updateRanked.isPending}
        />
        <div>
          {phase === 'lobby' && (
            <LobbyPanel
              ctx={ctx}
              onStart={() => start.mutate({ bidGameId })}
              startPending={start.isPending}
            />
          )}
          {phase === 'bidding' &&
            (game.quickBid ? (
              <QuickBidView
                bidGameId={game.id}
                players={game.players}
                combos={liveCombos}
                myPlayer={myPlayer}
                pname={pname}
                avatarOf={avatarOf}
                onGame={onGame}
              />
            ) : (
              <BiddingPanel
                ctx={ctx}
                combos={liveCombos}
                selComboId={selComboId}
                amount={amount}
                setAmount={setAmount}
                onOpenBid={openBid}
                onCancelBid={() => setSelComboId(null)}
                onSubmitBid={submitBid}
                bidPending={placeBid.isPending}
              />
            ))}
          {phase === 'results' && <ResultsPanel ctx={ctx} />}
        </div>
      </div>
    </div>
  );
}

/* ── left rail ─────────────────────────────────────────────────────────── */

function PlayerRail({
  ctx,
  loggedIn,
  onJoin,
  joinPending,
  onSetQuick,
  quickPending,
  onSetRanked,
  rankedPending,
}: {
  ctx: Ctx;
  loggedIn: boolean;
  onJoin: () => void;
  joinPending: boolean;
  onSetQuick: (quickBid: boolean) => void;
  quickPending: boolean;
  onSetRanked: (ranked: boolean) => void;
  rankedPending: boolean;
}) {
  const { game, myPlayer } = ctx;
  const players = [...game.players].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const joinable = !myPlayer && game.status === 'CREATED';
  const full = game.players.length >= MAX_PLAYERS;

  return (
    <ConsolePanel className="p-[22px] lg:sticky lg:top-5">
      <div className={labelCls}>Players · {game.players.length}</div>
      <div className="mt-1.5">
        {players.map((p, i) => (
          <PlayerRow key={p.id} ctx={ctx} p={p} last={i === players.length - 1} />
        ))}
      </div>
      {joinable &&
        (loggedIn ? (
          full ? (
            <p className="mt-4 mb-0 text-[12.5px] text-muted-foreground">
              Sorry, this bid game is full.
            </p>
          ) : (
            <Button className="mt-4 w-full" onClick={onJoin} disabled={joinPending}>
              Join game
            </Button>
          )
        ) : (
          <Button
            className="mt-4 w-full text-white"
            style={{ background: '#5865F2' }}
            onClick={() => signIn('discord')}
          >
            Log in with Discord to join
          </Button>
        ))}
      <CopyLinkButton variant="outline" size="sm" className="mt-2.5 w-full">
        ＋ Invite link
      </CopyLinkButton>
      <MatchSettings
        ctx={ctx}
        onSetQuick={onSetQuick}
        quickPending={quickPending}
        onSetRanked={onSetRanked}
        rankedPending={rankedPending}
      />
    </ConsolePanel>
  );
}

/** One match-settings row: label left, both options as a segmented radio group
 * right — the current value is the raised segment, so the control reads as a
 * toggle rather than a stateful button. */
function SettingsSeg({
  name,
  value,
  options,
  disabled,
  title,
  onChange,
}: {
  name: string;
  value: string;
  options: [string, string];
  disabled: boolean;
  title?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5" title={title}>
      <span className="font-bold text-[10.5px] text-muted-foreground uppercase tracking-[0.5px]">
        {name}
      </span>
      <div className="inline-flex gap-[2px] rounded-[9px] border border-border bg-muted p-[3px]">
        {options.map((o) => {
          const on = o === value;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => !on && onChange(o)}
              className={`rounded-[7px] px-[11px] py-1 text-xs transition-[background,color,opacity] ${on ? 'font-semibold' : 'font-medium'}`}
              style={{
                background: on ? 'var(--background)' : 'transparent',
                color: on ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: on ? '0 1px 2px rgba(0,0,0,.35)' : 'none',
                opacity: disabled && !on ? 0.45 : 1,
                cursor: disabled ? 'default' : 'pointer',
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Persistent match-settings block at the foot of the player rail: bid mode
 * and scoring as segmented toggles, host-editable while the game is in the
 * lobby, locked once bidding starts. */
function MatchSettings({
  ctx,
  onSetQuick,
  quickPending,
  onSetRanked,
  rankedPending,
}: {
  ctx: Ctx;
  onSetQuick: (quickBid: boolean) => void;
  quickPending: boolean;
  onSetRanked: (ranked: boolean) => void;
  rankedPending: boolean;
}) {
  const { game, phase, isHost, onGame } = ctx;
  const locked = phase !== 'lobby';
  const canEdit = isHost && game.status === 'CREATED';
  const presetName = game.bidPreset?.name ?? 'Custom';
  return (
    <div className="mt-[18px] border-border border-t pt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className={labelCls}>Match settings</span>
        {locked && (
          <span className="inline-flex items-center gap-[5px] font-semibold text-[11px] text-muted-foreground">
            <svg width="10" height="11" viewBox="0 0 10 11" fill="none" aria-hidden="true">
              <rect x="1" y="4.5" width="8" height="5.5" rx="1.2" fill="currentColor" />
              <path
                d="M2.8 4.5V3.2a2.2 2.2 0 1 1 4.4 0v1.3"
                stroke="currentColor"
                strokeWidth="1.3"
                fill="none"
              />
            </svg>
            Locked
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {/* Combo pool collapsed to its setting name; the dialog holds the detail. */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="font-bold text-[10.5px] text-muted-foreground uppercase tracking-[0.5px]">
            Enabled Combos
          </span>
          <BidSettingsDialog
            bidGameId={game.id}
            canEdit={canEdit}
            presetName={game.bidPreset?.name ?? null}
            enabledCombos={game.enabledCombos ?? []}
            onGame={onGame}
            trigger={
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-[7px] rounded-lg border border-border bg-muted px-[11px] py-1 font-semibold text-foreground text-xs transition-colors hover:border-ring"
              >
                {presetName}
                {/* Gear = you can edit; eye = the dialog opens read-only. */}
                {canEdit ? (
                  <Settings
                    className="size-[11px] shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : (
                  <Eye className="size-[11px] shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
            }
          />
        </div>
        <SettingsSeg
          name="Bidding"
          value={game.quickBid ? 'Quick-bid' : 'Turn-based'}
          options={['Turn-based', 'Quick-bid']}
          disabled={locked || !isHost || quickPending}
          title="Quick-bid: everyone submits one sealed bid sheet at once"
          onChange={(v) => onSetQuick(v === 'Quick-bid')}
        />
        <SettingsSeg
          name="Scoring"
          value={game.ranked ? 'Ranked' : 'Unranked'}
          options={['Unranked', 'Ranked']}
          disabled={locked || !isHost || rankedPending}
          title="Ranked games update player ratings"
          onChange={(v) => onSetRanked(v === 'Ranked')}
        />
      </div>
      {!locked && (
        <div className="mt-2.5 text-[11px] text-muted-foreground">
          Host only · locked once bidding starts
        </div>
      )}
    </div>
  );
}

function PlayerRow({ ctx, p, last }: { ctx: Ctx; p: BidGamePlayer; last: boolean }) {
  const { game, phase, pname, avatarOf, heldComboOf, metaOf, myUserId } = ctx;
  const held = heldComboOf(p.id);
  const heldMeta = held
    ? metaOf(held.factionId as number, held.playerMatId as number, held.id)
    : null;
  const isTurn = phase === 'bidding' && !game.quickBid && game.activePlayer?.id === p.id;
  const you = myUserId != null && p.userId === myUserId;
  const isHostSeat = p.id === game.host?.id;
  const result = game.match?.results.find((r) => r.id === p.playerMatchResultId) ?? null;
  const final = result ? result.coins - (held?.bid?.coins ?? 0) : null;

  const status = () => {
    if (phase === 'lobby') return isHostSeat ? 'Host · ready to start' : 'Joined · ready';
    if (isTurn) {
      return (
        <span className="font-semibold" style={{ color: COIN_COLOR }}>
          Bidding now…
        </span>
      );
    }
    if (phase === 'bidding' && game.quickBid) {
      return p.quickBidReady ? (
        <span className="font-semibold" style={{ color: COIN_COLOR }}>
          Sealed ✓
        </span>
      ) : (
        'Filling their sheet…'
      );
    }
    if (heldMeta) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <FactionDisc faction={heldMeta.faction} size={15} />
          {phase === 'results' ? `${heldMeta.faction} ${heldMeta.mat}` : heldMeta.mat}
        </span>
      );
    }
    return phase === 'bidding' ? 'Waiting to bid' : '—';
  };

  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
    >
      <span
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-[7px] font-bold text-xs leading-none tabular-nums [text-box:trim-both_cap_alphabetic]"
        style={{
          background: isTurn ? COIN_COLOR : 'var(--muted)',
          color: isTurn ? '#1a1a1a' : 'var(--muted-foreground)',
        }}
      >
        {phase === 'lobby' ? '·' : (p.order ?? '·')}
      </span>
      <PlayerToken
        name={pname(p)}
        you={you}
        size={30}
        ring={isTurn ? COIN_COLOR : undefined}
        avatarUrl={avatarOf(p)}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-[7px]">
          <span className="truncate font-semibold text-sm">{pname(p)}</span>
          {you && (
            <Badge variant="secondary" className="text-[9px]">
              YOU
            </Badge>
          )}
          {isHostSeat && (
            <Badge variant="outline" className="text-[9px]">
              HOST
            </Badge>
          )}
        </div>
        <div className="mt-0.5 text-muted-foreground text-xs">{status()}</div>
      </div>
      {final != null ? (
        <span className="font-bold text-[15px] tabular-nums">{final}</span>
      ) : held?.bid && phase !== 'lobby' ? (
        <Coin n={held.bid.coins} />
      ) : phase === 'bidding' && !isTurn ? (
        <span className="size-2 rounded-full bg-muted" />
      ) : null}
    </div>
  );
}

/* ── lobby ─────────────────────────────────────────────────────────────── */

function LobbyPanel({
  ctx,
  onStart,
  startPending,
}: {
  ctx: Ctx;
  onStart: () => void;
  startPending: boolean;
}) {
  const { game, isHost, pname, onGame } = ctx;
  const poolCount = (game.enabledCombos ?? []).length;
  return (
    <ConsolePanel className="p-6">
      <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-semibold text-[17px] tracking-[-0.2px]">The pool</h2>
        <span className="text-[12.5px] text-muted-foreground">
          {poolCount} combos enabled · {game.players.length} players
        </span>
      </div>

      {/* One seat per player; the dealt combos stay unknown until the host
          starts (the legacy lobby's TBD placeholder rows). */}
      <div className="flex flex-col gap-2.5">
        {game.players.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-[13px] rounded-xl border border-border bg-background p-[15px]"
          >
            <Skeleton className="size-[38px] shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-44 max-w-full rounded" />
              <Skeleton className="h-2.5 w-28 rounded" />
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">Dealt at start</span>
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-[12.5px] text-muted-foreground">
          {poolCount === 0
            ? isHost
              ? 'No combinations enabled yet — set up the pool before starting.'
              : 'No combinations enabled yet. The host sets them before starting.'
            : `Each player is dealt one of the ${poolCount} enabled combinations at start.`}
        </span>
        <BidSettingsDialog
          bidGameId={game.id}
          canEdit={isHost && game.status === 'CREATED'}
          presetName={game.bidPreset?.name ?? null}
          enabledCombos={game.enabledCombos ?? []}
          onGame={onGame}
          trigger={
            <Button variant="outline" size="sm">
              {isHost && game.status === 'CREATED' ? 'Edit pool' : 'View pool'}
            </Button>
          }
        />
      </div>

      <div
        className="mt-5 flex flex-wrap items-center gap-3.5 rounded-xl border px-[18px] py-3.5"
        style={{
          background: 'color-mix(in oklab, var(--primary) 12%, var(--card))',
          borderColor: 'color-mix(in oklab, var(--primary) 30%, var(--border))',
        }}
      >
        <div className="min-w-[200px] flex-1">
          <div className="font-semibold text-sm">
            {isHost ? 'Ready when you are' : 'Get ready!'}
          </div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">
            {isHost
              ? 'Share the link, tune the settings, and start once everyone has joined.'
              : `Waiting for more players to join, or for ${game.host ? pname(game.host) : 'the host'} to start…`}
          </div>
        </div>
        {isHost && (
          <Button
            onClick={onStart}
            disabled={startPending || game.players.length < 2 || poolCount === 0}
          >
            Start bidding
          </Button>
        )}
      </div>
    </ConsolePanel>
  );
}

/* ── bidding board ─────────────────────────────────────────────────────── */

function BiddingPanel({
  ctx,
  combos,
  selComboId,
  amount,
  setAmount,
  onOpenBid,
  onCancelBid,
  onSubmitBid,
  bidPending,
}: {
  ctx: Ctx;
  combos: Array<{ combo: BidGameCombo; m: ComboMeta }>;
  selComboId: number | null;
  amount: number;
  setAmount: (n: number) => void;
  onOpenBid: (combo: BidGameCombo) => void;
  onCancelBid: () => void;
  onSubmitBid: () => void;
  bidPending: boolean;
}) {
  const { game, isActive, myPlayer, pname, avatarOf, heldComboOf, metaOf } = ctx;
  const active = game.activePlayer;
  const youHeld = myPlayer ? heldComboOf(myPlayer.id) : null;
  const youHeldMeta = youHeld
    ? metaOf(youHeld.factionId as number, youHeld.playerMatId as number, youHeld.id)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <style>{'@keyframes bid-pulse{0%,100%{opacity:.25}50%{opacity:.9}}'}</style>

      {/* turn banner */}
      <div
        className="flex items-center gap-4 rounded-[14px] border px-5 py-4"
        style={{
          borderColor: isActive ? COIN_COLOR : 'var(--border)',
          background: isActive
            ? `color-mix(in oklab, ${COIN_COLOR} 9%, var(--card))`
            : 'var(--card)',
        }}
      >
        {isActive ? (
          <>
            <PlayerToken
              name={myPlayer ? pname(myPlayer) : 'You'}
              you
              size={40}
              ring={COIN_COLOR}
              avatarUrl={myPlayer ? avatarOf(myPlayer) : null}
            />
            <div className="flex-1">
              <div className="font-bold text-[15px]">Your turn — place a bid</div>
              <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                Claim a free combo or outbid to take one. What you bid becomes your end-of-game
                penalty.
              </div>
            </div>
          </>
        ) : (
          <>
            {active && (
              <PlayerToken
                name={pname(active)}
                size={40}
                ring={COIN_COLOR}
                avatarUrl={avatarOf(active)}
              />
            )}
            <div className="flex-1">
              <div className="font-semibold text-[15px]">
                <span style={{ color: COIN_COLOR }}>{active ? pname(active) : 'Someone'}</span> is
                bidding…
              </div>
              <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                Turn {game.bidHistory.length + 1} · waiting on their move.
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full bg-muted-foreground"
                  style={{ animation: `bid-pulse 1.1s ${i * 0.18}s infinite` }}
                />
              ))}
            </span>
          </>
        )}
      </div>

      {/* your standing */}
      {youHeld?.bid && youHeldMeta && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-[13px] text-muted-foreground">
          You currently hold <FactionDisc faction={youHeldMeta.faction} size={18} />
          <span className="font-semibold text-foreground">
            {youHeldMeta.faction} {youHeldMeta.mat}
          </span>{' '}
          · you’d owe <Coin n={youHeld.bid.coins} />
        </div>
      )}

      {/* combo board */}
      <div className="flex flex-col gap-2.5">
        {combos.map(({ combo, m }) => (
          <ComboRow
            key={combo.id}
            ctx={ctx}
            combo={combo}
            m={m}
            selecting={selComboId === combo.id}
            amount={amount}
            setAmount={setAmount}
            onOpen={() => onOpenBid(combo)}
            onCancel={onCancelBid}
            onSubmit={onSubmitBid}
            bidPending={bidPending}
          />
        ))}
      </div>

      <ActivityLog ctx={ctx} />
    </div>
  );
}

function ComboRow({
  ctx,
  combo,
  m,
  selecting,
  amount,
  setAmount,
  onOpen,
  onCancel,
  onSubmit,
  bidPending,
}: {
  ctx: Ctx;
  combo: BidGameCombo;
  m: ComboMeta;
  selecting: boolean;
  amount: number;
  setAmount: (n: number) => void;
  onOpen: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  bidPending: boolean;
}) {
  const { game, isActive, myUserId, pname, avatarOf, holderOf, minBidFor } = ctx;
  const holder = holderOf(combo);
  const youHold = !!holder && myUserId != null && holder.userId === myUserId;
  const minBid = minBidFor(combo);

  return (
    <div
      className="flex flex-col rounded-xl border px-[18px] py-4 transition-colors"
      style={{
        borderColor: selecting
          ? COIN_COLOR
          : youHold
            ? 'color-mix(in oklab, var(--primary) 45%, var(--border))'
            : 'var(--border)',
        background: selecting
          ? `color-mix(in oklab, ${COIN_COLOR} 7%, var(--card))`
          : 'var(--card)',
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        <FactionDisc faction={m.faction} size={40} />
        <div className="min-w-[168px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[15px]">
              {m.faction} {m.mat}
            </span>
            {m.tier && <TierBadge tier={m.tier} size={20} />}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <StrengthMeter value={strengthOf(m)} tier={m.tier} width={64} />
            <span className="text-[11.5px] text-muted-foreground">
              {m.winRate != null
                ? `${m.winRate.toFixed(1)}% win rate (in ${game.players.length} player games)`
                : 'win rate —'}
            </span>
          </div>
        </div>
        <div className="flex-1" />
        {/* current bid */}
        <div className="min-w-[132px] text-right">
          <div className={labelCls}>Current bid</div>
          {combo.bid ? (
            <div className="mt-1 flex items-center justify-end gap-2">
              <Coin n={combo.bid.coins} />
              <span className="inline-flex items-center gap-[5px]">
                <PlayerToken
                  name={holder ? pname(holder) : '?'}
                  you={youHold}
                  size={20}
                  avatarUrl={holder ? avatarOf(holder) : null}
                />
                <span
                  className="text-[12.5px]"
                  style={{
                    color: youHold ? 'var(--primary)' : 'var(--muted-foreground)',
                    fontWeight: youHold ? 600 : 500,
                  }}
                >
                  {youHold ? 'you' : holder ? pname(holder) : '—'}
                </span>
              </span>
            </div>
          ) : (
            <div className="mt-[5px] text-[12.5px] text-muted-foreground">No bids · free</div>
          )}
        </div>
        {/* action — fixed column; bidding expands below, so nothing shifts */}
        <div className="flex min-w-[148px] justify-end">
          {youHold ? (
            <Badge variant="secondary" className="text-[10px]">
              You hold this
            </Badge>
          ) : !isActive ? (
            <span className="text-muted-foreground text-xs">—</span>
          ) : selecting ? (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          ) : (
            <Button size="sm" variant={combo.bid ? 'outline' : 'default'} onClick={onOpen}>
              {combo.bid ? `Outbid · ${minBid}+` : 'Bid'}
            </Button>
          )}
        </div>
      </div>
      {/* bid composer — opens beneath the row */}
      {selecting && (
        <div
          className="mt-3.5 flex flex-wrap items-center justify-end gap-3.5 pt-3.5"
          style={{
            borderTop: `1px solid color-mix(in oklab, ${COIN_COLOR} 30%, var(--border))`,
          }}
        >
          <span className={labelCls}>Your bid</span>
          {/* Typeable amount; 999 cap matches the legacy input. Below-min is
              possible mid-typing (or after a racing outbid), so gate submit. */}
          <CoinStepper value={amount} min={minBid} max={999} onChange={setAmount} />
          <Button size="sm" onClick={onSubmit} disabled={bidPending || amount < minBid}>
            {combo.bid ? 'Outbid' : 'Bid'} · {amount}
          </Button>
        </div>
      )}
    </div>
  );
}

function ActivityLog({ ctx }: { ctx: Ctx }) {
  const { game, pname, avatarOf, metaOf, myUserId } = ctx;
  const byPlayerId = new Map(game.players.map((p) => [p.id, p]));
  const nameOf = (id: number) => {
    const p = byPlayerId.get(id);
    return p ? pname(p) : '?';
  };
  const avatarOfId = (id: number) => {
    const p = byPlayerId.get(id);
    return p ? avatarOf(p) : null;
  };
  const isYou = (id: number) => {
    const p = byPlayerId.get(id);
    return myUserId != null && p?.userId === myUserId;
  };
  // Newest first; an entry outbid whoever last bid on the same combo.
  const entries = game.bidHistory
    .map((h, i) => {
      const prev = game.bidHistory
        .slice(0, i)
        .reverse()
        .find((e) => e.factionId === h.factionId && e.playerMatId === h.playerMatId);
      return { ...h, i, victimId: prev?.playerId ?? null };
    })
    .reverse()
    .slice(0, 6);

  return (
    <ConsolePanel className="px-5 py-4">
      <div className={`${labelCls} mb-2.5`}>Activity</div>
      {entries.length === 0 ? (
        <div className="text-[12.5px] text-muted-foreground">
          No bids yet — {game.activePlayer ? pname(game.activePlayer) : 'the first player'} opens.
        </div>
      ) : (
        <div className="flex flex-col gap-[9px]">
          {entries.map((e) => {
            const m = metaOf(e.factionId, e.playerMatId, null);
            return (
              <div key={e.i} className="flex flex-wrap items-center gap-2 text-[12.5px]">
                <PlayerToken
                  name={nameOf(e.playerId)}
                  you={isYou(e.playerId)}
                  size={18}
                  avatarUrl={avatarOfId(e.playerId)}
                />
                <span className="font-semibold">
                  {isYou(e.playerId) ? 'You' : nameOf(e.playerId)}
                </span>
                <span className="text-muted-foreground">{e.coins === 0 ? 'claimed' : 'bid'}</span>
                {e.coins > 0 && <Coin n={e.coins} size={12} />}
                <span className="text-muted-foreground">on</span>
                <FactionDisc faction={m.faction} size={15} />
                <span>{m.mat}</span>
                {e.victimId != null && (
                  <span className="text-[11.5px]" style={{ color: COIN_COLOR }}>
                    · outbid {isYou(e.victimId) ? 'you' : nameOf(e.victimId)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ConsolePanel>
  );
}

/* ── results ───────────────────────────────────────────────────────────── */

function ResultsPanel({ ctx }: { ctx: Ctx }) {
  const { game, pname, avatarOf, heldComboOf, metaOf, myUserId, myPlayer } = ctx;
  const recorded = game.status === 'GAME_RECORDED' && !!game.match;
  const expired = game.status === 'EXPIRED';

  // Seats in turn order, each with its held combo and bid penalty.
  const seats = [...game.players]
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((p) => {
      const held = heldComboOf(p.id);
      return {
        player: p,
        held,
        m: held ? metaOf(held.factionId as number, held.playerMatId as number, held.id) : null,
        bid: held?.bid?.coins ?? 0,
      };
    });

  const results = recorded ? [...(game.match?.results ?? [])].sort((a, b) => a.rank - b.rank) : [];
  const seatOfResult = (resultId: number) =>
    seats.find((s) => s.player.playerMatchResultId === resultId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <ConsolePanel className="overflow-hidden p-1">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-3 sm:pl-[18px]">Player</TableHead>
                <TableHead>Combination</TableHead>
                <TableHead className="text-right">{recorded ? 'Coins' : 'Bid'}</TableHead>
                <TableHead className="pr-3 sm:pr-[18px] text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recorded
                ? results.map((r) => {
                    const seat = seatOfResult(r.id);
                    const bid = seat?.bid ?? 0;
                    const you = seat?.player.userId != null && seat.player.userId === myUserId;
                    const delta = r.playerTrueskill
                      ? r.playerTrueskill.after.mu - r.playerTrueskill.before.mu
                      : null;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="pl-3 sm:pl-[18px] font-medium">
                          {/* Block flex, not inline-flex: a disc/avatar as the first
                              flex item drags the span's baseline to its bottom edge
                              and hoists the cell content above center. */}
                          <div className="flex items-center gap-[9px]">
                            <span className="w-3.5 text-muted-foreground tabular-nums">
                              {r.rank}
                            </span>
                            <PlayerToken
                              name={r.player?.displayName ?? '?'}
                              you={you}
                              size={22}
                              avatarUrl={seat ? avatarOf(seat.player) : null}
                            />
                            {r.player?.displayName ?? '—'}
                            {you && (
                              <Badge variant="secondary" className="text-[9px]">
                                YOU
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="flex items-center gap-[9px]">
                            <FactionDisc faction={r.faction?.name ?? '—'} size={22} />
                            <span className="min-w-[80px] font-medium">
                              {r.faction?.name} {r.playerMat?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className="hidden text-muted-foreground sm:inline">
                            {r.coins} − {bid} ={' '}
                          </span>
                          <span className="font-bold">{r.coins - bid}</span>
                        </TableCell>
                        <TableCell className="pr-3 sm:pr-[18px] text-right">
                          {delta == null ? (
                            <span className="text-muted-foreground text-xs">No change</span>
                          ) : (
                            <span
                              className="font-semibold text-xs tabular-nums"
                              style={{
                                color: delta >= 0 ? 'var(--primary)' : 'var(--muted-foreground)',
                              }}
                            >
                              {delta >= 0 ? '+' : ''}
                              {delta.toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                : seats.map((s, i) => {
                    const you = s.player.userId != null && s.player.userId === myUserId;
                    return (
                      <TableRow key={s.player.id}>
                        <TableCell className="pl-3 sm:pl-[18px] font-medium">
                          <div className="flex items-center gap-[9px]">
                            <span className="w-3.5 text-muted-foreground tabular-nums">
                              {i + 1}
                            </span>
                            <PlayerToken
                              name={pname(s.player)}
                              you={you}
                              size={22}
                              avatarUrl={avatarOf(s.player)}
                            />
                            {pname(s.player)}
                            {you && (
                              <Badge variant="secondary" className="text-[9px]">
                                YOU
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {s.m ? (
                            <div className="flex items-center gap-[9px]">
                              <FactionDisc faction={s.m.faction} size={22} />
                              <span className="min-w-[80px] font-medium">
                                {s.m.faction} {s.m.mat}
                              </span>
                              {s.m.tier && <TierBadge tier={s.m.tier} size={18} />}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Coin n={s.bid} />
                          </div>
                        </TableCell>
                        <TableCell className="pr-3 sm:pr-[18px] text-right">
                          <span className="text-muted-foreground text-xs">—</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </ConsolePanel>

      {/* status banner */}
      {expired ? (
        <div
          className="rounded-[14px] border px-5 py-4"
          style={{
            borderColor: 'color-mix(in oklab, var(--destructive) 45%, var(--border))',
            background: 'color-mix(in oklab, var(--destructive) 10%, var(--card))',
          }}
        >
          <div className="font-bold text-[15px]">This game has expired.</div>
          <p className="mt-1 mb-0 text-[12.5px] text-muted-foreground">
            A player in this game has recorded another bid game. In order to preserve the integrity
            of rankings, the results of this game can no longer be recorded.
          </p>
        </div>
      ) : (
        <div
          className="flex flex-wrap items-center gap-3.5 rounded-[14px] border px-5 py-4"
          style={{
            background: 'color-mix(in oklab, var(--primary) 13%, var(--card))',
            borderColor: 'color-mix(in oklab, var(--primary) 30%, var(--border))',
          }}
        >
          <span
            className="inline-flex size-[34px] items-center justify-center rounded-[9px] text-[17px]"
            style={{
              background: 'color-mix(in oklab, var(--primary) 22%, transparent)',
              color: 'var(--primary)',
            }}
          >
            ✓
          </span>
          <div className="min-w-[200px] flex-1">
            <div className="font-semibold text-[14.5px]">
              {recorded
                ? 'Game complete and recorded.'
                : 'Bidding finished — every combo is claimed'}
            </div>
            {!recorded && (
              <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                Play the match, then record results against this game.
              </div>
            )}
          </div>
          {!recorded && myPlayer && (
            <RecordResultsDialog
              bidGameId={game.id}
              onGame={ctx.onGame}
              players={seats
                .filter((s) => s.held && s.m)
                .map((s) => ({
                  id: s.player.id,
                  name: pname(s.player),
                  faction: s.m?.faction ?? '',
                  mat: s.m?.mat ?? '',
                  bid: s.bid,
                }))}
            />
          )}
        </div>
      )}
    </div>
  );
}
