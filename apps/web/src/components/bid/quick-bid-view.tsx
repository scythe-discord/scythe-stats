'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FactionDisc } from '~/components/charts/faction-disc';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { trpc } from '~/trpc/react';
import type { BidGame, BidGameCombo } from '~/trpc/types';
import { COIN_COLOR, Coin, CoinStepper, PlayerToken, StrengthMeter, TierBadge } from './primitives';
import { type ComboMeta, strengthOf } from './types';

const labelCls = 'text-[10.5px] font-bold uppercase tracking-[0.8px] text-muted-foreground';

interface EnrichedCombo {
  combo: BidGameCombo;
  m: ComboMeta;
}

/**
 * Quick-bid (sealed, simultaneous) flow for a BIDDING game where `quickBid` is
 * on. Each player privately sets a max bid for every combo, then confirms a
 * preference order (initialized by decreasing bid, reorderable — the legacy
 * confirm-quick-bid modal) that becomes the resolver's tie-break `order`.
 * The server resolves once everyone is in (second-price/displacement, see
 * domain `resolveQuickBids`).
 */
export function QuickBidView({
  bidGameId,
  players,
  combos,
  myPlayer,
  pname,
  avatarOf,
  onGame,
}: {
  bidGameId: number;
  players: BidGame['players'];
  combos: EnrichedCombo[];
  myPlayer: BidGame['players'][number] | null;
  pname: (p: BidGame['players'][number]) => string;
  /** Discord CDN avatar URL, or null → initials fallback. */
  avatarOf: (p: BidGame['players'][number]) => string | null;
  /** Apply the mutation's returned game to the view (SSE-independent update). */
  onGame: (g: BidGame) => void;
}) {
  const [bids, setBids] = useState<Record<number, number>>({});
  // Tie-break preference: comboIds, highest priority first. Set when the
  // confirm dialog opens; the player may reorder before sealing.
  const [prefOrder, setPrefOrder] = useState<number[] | null>(null);
  const submitted = !!myPlayer?.quickBidReady;
  const submit = trpc.bids.quickBid.useMutation({ onError: (e) => toast.error(e.message) });

  const sealedCount = players.filter((p) => p.quickBidReady).length;

  // Preference order by current max bid (stable on ties) — seeds the confirm
  // dialog; the sheet itself renders combos in fixed table order.
  const ranked = [...combos].sort((a, b) => (bids[b.combo.id] ?? 0) - (bids[a.combo.id] ?? 0));
  const maxExposure = Math.max(0, ...combos.map((c) => bids[c.combo.id] ?? 0));

  const comboById = new Map(combos.map((c) => [c.combo.id, c]));

  const openConfirm = () => {
    // Initial priority: decreasing bid (legacy confirm-quick-bid modal).
    setPrefOrder(ranked.map((c) => c.combo.id));
  };

  const movePref = (idx: number, dir: -1 | 1) => {
    setPrefOrder((prev) => {
      if (!prev) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[j]] = [next[j] as number, next[idx] as number];
      return next;
    });
  };

  const onConfirm = () => {
    if (!prefOrder) return;
    // `order` = preference rank (0 = highest priority); one entry per combo.
    const quickBids = prefOrder.map((comboId, i) => ({
      comboId,
      bidCoins: bids[comboId] ?? 0,
      order: i,
    }));
    submit.mutate(
      { bidGameId, quickBids },
      {
        onSuccess: (g) => {
          onGame(g);
          setPrefOrder(null);
        },
      },
    );
  };

  // ── waiting / sealed (also the spectator view) ─────────────────────────────
  if (submitted || !myPlayer) {
    const all = sealedCount >= players.length;
    const ordered = [...players].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return (
      <div className="flex flex-col gap-5">
        <div className="py-2 text-center">
          <div
            className="font-bold text-[11px] uppercase tracking-[0.7px]"
            style={{ color: COIN_COLOR }}
          >
            SEALED BIDS
          </div>
          <div className="mt-1.5 font-semibold text-[20px] tracking-[-0.3px]">
            {all ? 'All sheets are in — resolving…' : 'Waiting on the table…'}
          </div>
          <div className="mt-1.5 text-[13px] text-muted-foreground">
            No one sees another player’s bids until everyone has submitted.{' '}
            <span className="tabular-nums">{sealedCount}</span> of{' '}
            <span className="tabular-nums">{players.length}</span> sealed.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {ordered.map((p) => {
            const done = p.quickBidReady;
            const you = myPlayer?.id === p.id;
            return (
              <div
                key={p.id}
                className="flex flex-col items-center gap-3 rounded-2xl border px-4 py-6"
                style={{
                  borderColor: done
                    ? `color-mix(in oklab, ${COIN_COLOR} 45%, var(--border))`
                    : 'var(--border)',
                  background: done
                    ? `color-mix(in oklab, ${COIN_COLOR} 8%, var(--card))`
                    : 'var(--card)',
                }}
              >
                <PlayerToken
                  name={pname(p)}
                  you={you}
                  size={40}
                  ring={done ? COIN_COLOR : undefined}
                  avatarUrl={avatarOf(p)}
                />
                <div className="font-semibold text-sm">{you ? 'You' : pname(p)}</div>
                <div
                  className="font-semibold text-xs"
                  style={{ color: done ? COIN_COLOR : 'var(--muted-foreground)' }}
                >
                  {done ? 'Sealed ✓' : 'Submitting…'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── bid sheet ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex gap-3.5 rounded-[14px] border px-5 py-4"
        style={{
          background: `linear-gradient(120deg, color-mix(in oklab, ${COIN_COLOR} 11%, var(--card)), var(--card) 70%)`,
          borderColor: `color-mix(in oklab, ${COIN_COLOR} 30%, var(--border))`,
        }}
      >
        <span className="text-2xl">✍️</span>
        <div>
          <div className="font-bold text-[16px]">Set your max bid for each combo</div>
          <div className="mt-1 max-w-[620px] text-[13px] text-muted-foreground">
            Your bids will remain hidden until everyone has submitted their choices. Then
            we&rsquo;ll resolve the final bids automatically on our end.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {combos.map((c) => (
          <div
            key={c.combo.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-[18px] py-3.5"
          >
            <FactionDisc faction={c.m.faction} size={40} />
            <div className="min-w-[168px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[15px]">
                  {c.m.faction} {c.m.mat}
                </span>
                {c.m.tier && <TierBadge tier={c.m.tier} size={19} />}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <StrengthMeter value={strengthOf(c.m)} tier={c.m.tier} width={64} />
                <span className="text-[11.5px] text-muted-foreground">
                  {c.m.winRate != null
                    ? `${c.m.winRate.toFixed(1)}% win rate (in ${players.length} player games)`
                    : 'win rate —'}
                </span>
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex flex-col items-end gap-1.5">
              <span className={labelCls}>Your max bid</span>
              <CoinStepper
                value={bids[c.combo.id] ?? 0}
                min={0}
                max={250}
                onChange={(v) => setBids((s) => ({ ...s, [c.combo.id]: v }))}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 rounded-[13px] border border-border bg-card px-5 py-4">
        <div className="flex-1">
          <span className={labelCls}>Most you could owe</span>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="size-[18px] shrink-0 rounded-full"
              style={{ background: COIN_COLOR }}
            />
            <span className="font-extrabold text-[22px] leading-none tabular-nums [text-box:trim-both_cap_alphabetic]">
              {maxExposure}
            </span>
            <span className="text-[12.5px] text-muted-foreground">— your highest single bid</span>
          </div>
        </div>
        <Button size="lg" onClick={openConfirm}>
          Continue
        </Button>
      </div>

      {/* Confirm step (legacy confirm-quick-bid modal): set the tie-break
          priority among your bids, then seal. */}
      <Dialog open={prefOrder !== null} onOpenChange={(open) => !open && setPrefOrder(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm bids</DialogTitle>
            <DialogDescription>
              Order the combos by priority (highest first) to decide how ties resolve — when two of
              your bids are equally strong, the one higher in this list wins out.
            </DialogDescription>
          </DialogHeader>
          {/* The legacy confirm modal's worked example, using the player's own
              bids as the hypothetical going prices. */}
          <div className="rounded-[10px] border border-border bg-muted/40 px-3.5 py-3 text-[12.5px] text-muted-foreground leading-relaxed">
            For example — if the minimum bid for{' '}
            {ranked.map((c, i) => (
              <span key={c.combo.id}>
                {i > 0 && (i === ranked.length - 1 ? ', and ' : ', ')}
                <b className="text-foreground">
                  {c.m.faction} {c.m.mat}
                </b>{' '}
                {i === 0 && 'is '}
                <Coin n={bids[c.combo.id] ?? 0} size={12} />
              </span>
            ))}
            , which combination would you bid on? Put that one first.
          </div>
          <div className="flex flex-col gap-2">
            {(prefOrder ?? []).map((comboId, i) => {
              const c = comboById.get(comboId);
              if (!c) return null;
              return (
                <div
                  key={comboId}
                  className="flex items-center gap-3 rounded-[13px] border border-border bg-card px-3.5 py-2.5"
                >
                  <span className="w-5 text-center font-bold text-muted-foreground text-xs tabular-nums">
                    {i + 1}
                  </span>
                  <FactionDisc faction={c.m.faction} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-sm">
                      {c.m.faction} {c.m.mat}
                    </div>
                  </div>
                  <Coin n={bids[comboId] ?? 0} size={16} />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="size-7 p-0"
                      onClick={() => movePref(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="size-7 p-0"
                      onClick={() => movePref(i, 1)}
                      disabled={i === (prefOrder?.length ?? 0) - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPrefOrder(null)}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={submit.isPending}>
              {submit.isPending ? 'Sealing…' : 'Seal & submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
