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
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { trpc } from '~/trpc/react';
import type { BidGame } from '~/trpc/types';

export interface RecordPlayer {
  id: number;
  name: string;
  faction: string;
  mat: string;
  bid: number;
}

/**
 * Collects the coins each player scored and the finishing order, then records
 * the match via `bids.recordResults`. Rows are ordered by rank — the recorder
 * moves players up/down to resolve ties (legacy record-match modal: "winners
 * of ties should come first"); the order must agree with the final scores
 * (coins − bid).
 */
export function RecordResultsDialog({
  bidGameId,
  players,
  onGame,
}: {
  bidGameId: number;
  players: RecordPlayer[];
  /** Apply the mutation's returned game to the view (SSE-independent update). */
  onGame?: (g: BidGame) => void;
}) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [numRounds, setNumRounds] = useState('');
  const [coins, setCoins] = useState<Record<number, string>>({});
  const [postToDiscord, setPostToDiscord] = useState(true);
  // Finishing order (player ids, winner first); rank = position + 1.
  const [rowOrder, setRowOrder] = useState<number[]>([]);

  const record = trpc.bids.recordResults.useMutation({
    onSuccess: (g) => {
      onGame?.(g);
      toast.success('Results recorded');
      utils.matches.list.invalidate();
      utils.stats.invalidate();
      utils.players.invalidate();
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const onOpenChange = (next: boolean) => {
    if (next) setRowOrder(players.map((p) => p.id));
    setOpen(next);
  };

  const rows = rowOrder
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is RecordPlayer => !!p);

  const finalOf = (p: RecordPlayer) => {
    const c = Number(coins[p.id]);
    return Number.isFinite(c) && coins[p.id] !== '' && coins[p.id] != null ? c - p.bid : null;
  };

  const move = (idx: number, dir: -1 | 1) => {
    setRowOrder((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[j]] = [next[j] as number, next[idx] as number];
      return next;
    });
  };

  // Rank order must be non-increasing in final score (ties are fine — the
  // recorder decides who placed higher).
  const finals = rows.map(finalOf);
  const allEntered = finals.every((f) => f != null);
  const inOrder = finals.every(
    (f, i) => i === 0 || f == null || finals[i - 1] == null || f <= (finals[i - 1] as number),
  );

  const sortByFinal = () => {
    setRowOrder((prev) => {
      const byId = new Map(players.map((p) => [p.id, p]));
      return [...prev].sort((a, b) => {
        const fa = finalOf(byId.get(a) as RecordPlayer) ?? 0;
        const fb = finalOf(byId.get(b) as RecordPlayer) ?? 0;
        return fb - fa;
      });
    });
  };

  const submit = () => {
    const rounds = Number(numRounds);
    if (!Number.isInteger(rounds) || rounds <= 0) {
      toast.error('Enter a valid number of rounds');
      return;
    }
    // Validate the raw strings — Number('') is 0, which would silently record
    // a cleared field as zero coins (legacy messages preserved).
    if (rows.some((p) => (coins[p.id] ?? '').trim() === '')) {
      toast.error('One or more fields is missing.');
      return;
    }
    if (rows.some((p) => !/^\d+$/.test((coins[p.id] ?? '').trim()))) {
      toast.error('Coins must be valid non-negative integers.');
      return;
    }
    if (!inOrder) {
      toast.error('Players must be sorted in rank order after bids.');
      return;
    }
    const results = rows.map((p) => ({
      bidGamePlayerId: p.id,
      coins: Number.parseInt((coins[p.id] ?? '').trim(), 10),
    }));
    record.mutate({
      bidGameId,
      numRounds: rounds,
      datePlayed: new Date().toISOString(),
      shouldPostMatchLog: postToDiscord,
      results,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Record results</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record match results</DialogTitle>
          <DialogDescription>
            Enter each player’s coins, then order the rows by finish — winner first. Ties (equal
            final scores) are resolved by your ordering.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="results-rounds">Rounds</Label>
          <Input
            id="results-rounds"
            type="number"
            min={1}
            max={50}
            inputMode="numeric"
            placeholder="e.g. 16"
            value={numRounds}
            onChange={(e) => setNumRounds(e.target.value)}
            className="w-32"
          />
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((p, i) => {
            const final = finalOf(p);
            return (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-center font-bold text-muted-foreground text-xs tabular-nums">
                  {i + 1}
                </span>
                <FactionDisc faction={p.faction} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-sm">{p.name}</div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {p.faction} {p.mat} · bid −{p.bid}
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Coins"
                  className="w-20"
                  value={coins[p.id] ?? ''}
                  onChange={(e) => setCoins((prev) => ({ ...prev, [p.id]: e.target.value }))}
                />
                <span className="w-12 text-right text-muted-foreground text-xs tabular-nums">
                  {final != null ? `= ${final}` : ''}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="size-7 p-0"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="size-7 p-0"
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {allEntered && !inOrder && (
          <p className="m-0 text-[12.5px] text-destructive">
            Players must be sorted in rank order after bids.{' '}
            <button type="button" className="underline" onClick={sortByFinal}>
              Sort by final score
            </button>
          </p>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={postToDiscord}
            onChange={(e) => setPostToDiscord(e.target.checked)}
          />
          Post match log to Discord
        </label>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={record.isPending}>
            {record.isPending ? 'Recording…' : 'Record results'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
