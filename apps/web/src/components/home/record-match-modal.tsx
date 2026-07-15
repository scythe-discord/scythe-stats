'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FactionDisc } from '~/components/charts/faction-disc';
import { PlayerNameCombobox } from '~/components/home/player-name-combobox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { trpc } from '~/trpc/react';

const MAX_PLAYERS = 7;
const MIN_PLAYERS = 2;

// Fixed column track so rows never jitter as values change:
// 20 handle · 40 place · flexible name · 150 faction · 150 mat · 74 coins · 32 remove
const RM_COLS = '20px 40px minmax(160px, 1fr) 150px 150px 74px 32px';

const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

interface Row {
  uid: number;
  displayName: string;
  faction: string;
  playerMat: string;
  coins: string;
}

let nextUid = 0;
const emptyRow = (): Row => ({
  uid: nextUid++,
  displayName: '',
  faction: '',
  playerMat: '',
  coins: '',
});

// Empty coins sort last; used both for the live order check and "Sort by coins".
const coinsVal = (r: Row) => (r.coins.trim() === '' ? Number.NEGATIVE_INFINITY : Number(r.coins));

function PlaceBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-6 w-9 items-center justify-center rounded-md bg-muted font-semibold text-[12px] text-muted-foreground tabular-nums">
      {ordinal(n)}
    </span>
  );
}

export function RecordMatchModal() {
  const me = trpc.auth.me.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const utils = trpc.useUtils();
  const factionsQ = trpc.reference.factions.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });
  const matsQ = trpc.reference.playerMats.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const [open, setOpen] = useState(false);
  const [numRounds, setNumRounds] = useState('');
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()]);
  const [postToDiscord, setPostToDiscord] = useState(true);
  // uid of the row being dragged; rows reorder live as it passes over others.
  const [dragUid, setDragUid] = useState<number | null>(null);
  // Drag only starts from the grip — draggable rows would swallow text
  // selection inside the inputs otherwise.
  const [grabbedUid, setGrabbedUid] = useState<number | null>(null);
  // Set once the user tries to record while rows are out of rank order — that's
  // when the inline "placements don't match coins" banner appears.
  const [attempted, setAttempted] = useState(false);

  const log = trpc.matches.log.useMutation({
    onSuccess: () => {
      toast.success('Match recorded');
      utils.matches.list.invalidate();
      utils.stats.invalidate();
      utils.players.invalidate();
      setOpen(false);
      setNumRounds('');
      setRows([emptyRow(), emptyRow()]);
      setAttempted(false);
    },
    onError: (e) => toast.error(e.message),
  });

  if (!me.data) {
    return (
      <Button variant="outline" size="sm" onClick={() => signIn('discord')}>
        Log in to record
      </Button>
    );
  }

  const setRow = (uid: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));

  const moveRow = (from: number, to: number) =>
    setRows((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved as Row);
      return next;
    });

  const onDragEnterRow = (idx: number) => {
    if (dragUid == null) return;
    const from = rows.findIndex((r) => r.uid === dragUid);
    if (from !== -1 && from !== idx) moveRow(from, idx);
  };

  // Row order IS the finishing order (rank = index + 1); it must be
  // non-increasing in coins. Ties are fine — the recorder breaks them by
  // ordering "winners of ties first".
  const outOfOrder = rows.some((r, i) => i > 0 && coinsVal(rows[i - 1] as Row) < coinsVal(r));

  const sortByCoins = () => setRows((prev) => [...prev].sort((a, b) => coinsVal(b) - coinsVal(a)));

  const submit = () => {
    const rounds = Number(numRounds);
    if (!Number.isInteger(rounds) || rounds <= 0) {
      toast.error('Enter a valid number of rounds');
      return;
    }
    const cleaned = rows.map((r) => ({
      displayName: r.displayName.trim(),
      faction: r.faction,
      playerMat: r.playerMat,
      coins: Number(r.coins),
    }));
    if (cleaned.some((r) => !r.displayName || !r.faction || !r.playerMat)) {
      toast.error('Fill in every player’s name, faction, mat, and coins');
      return;
    }
    if (cleaned.some((r) => !Number.isInteger(r.coins) || r.coins < 0)) {
      toast.error('Coins must be non-negative whole numbers');
      return;
    }
    if (outOfOrder) {
      // Surface the inline banner rather than a toast — it offers a one-click fix.
      setAttempted(true);
      return;
    }
    // Rank comes from the row order so the recorder decides tie winners
    // (legacy: "winners of ties should come first"). Legacy also had no date
    // field — matches are always stamped "now".
    log.mutate({
      numRounds: rounds,
      datePlayed: new Date().toISOString(),
      shouldPostMatchLog: postToDiscord,
      results: cleaned.map((r, i) => ({ ...r, rank: i + 1 })),
    });
  };

  const colHead = 'text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground/75';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Record a match
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[780px]">
        <DialogHeader>
          <DialogTitle>Record a match</DialogTitle>
          <DialogDescription>Add 2–7 players in finishing order.</DialogDescription>
        </DialogHeader>

        <div className="grid w-[120px] gap-2">
          <Label htmlFor="match-rounds">Rounds played</Label>
          <Input
            id="match-rounds"
            type="number"
            min={1}
            max={50}
            inputMode="numeric"
            placeholder="e.g. 16"
            value={numRounds}
            onChange={(e) => setNumRounds(e.target.value)}
            className="tabular-nums"
          />
        </div>

        <div className="grid gap-2">
          <Label className="font-semibold text-[15px]">Players</Label>

          {/* Column labels — muted band aligned to the same fixed grid as rows. */}
          <div
            className="grid items-center gap-2 rounded-md bg-muted py-[5px]"
            style={{ gridTemplateColumns: RM_COLS }}
          >
            <span />
            <span className={colHead}>Place</span>
            <span className={colHead}>Player</span>
            <span className={colHead}>Faction</span>
            <span className={colHead}>Player mat</span>
            <span className={`${colHead} pr-2.5 text-right`}>Coins</span>
            <span />
          </div>

          {rows.map((row, i) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop container; the grip button inside is the accessible (keyboard) control.
            <div
              key={row.uid}
              className="grid items-center gap-2 transition-opacity"
              style={{ gridTemplateColumns: RM_COLS, opacity: dragUid === row.uid ? 0.45 : 1 }}
              draggable={grabbedUid === row.uid}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                setDragUid(row.uid);
              }}
              onDragEnd={() => {
                setDragUid(null);
                setGrabbedUid(null);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => onDragEnterRow(i)}
            >
              <button
                type="button"
                className="flex h-6 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
                aria-label={`Reorder player ${i + 1} (arrow keys to move)`}
                onMouseDown={() => setGrabbedUid(row.uid)}
                onMouseUp={() => setGrabbedUid(null)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveRow(i, i + (e.key === 'ArrowUp' ? -1 : 1));
                  }
                }}
              >
                <svg
                  width="12"
                  height="16"
                  viewBox="0 0 12 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="3.5" cy="3" r="1.5" />
                  <circle cx="8.5" cy="3" r="1.5" />
                  <circle cx="3.5" cy="8" r="1.5" />
                  <circle cx="8.5" cy="8" r="1.5" />
                  <circle cx="3.5" cy="13" r="1.5" />
                  <circle cx="8.5" cy="13" r="1.5" />
                </svg>
              </button>
              <PlaceBadge n={i + 1} />
              <PlayerNameCombobox
                value={row.displayName}
                onChange={(name) => setRow(row.uid, { displayName: name })}
              />
              <Select value={row.faction} onValueChange={(v) => setRow(row.uid, { faction: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Faction" />
                </SelectTrigger>
                <SelectContent>
                  {(factionsQ.data ?? []).map((f) => (
                    <SelectItem key={f.id} value={f.name}>
                      <span className="flex items-center gap-2">
                        <FactionDisc faction={f.name} size={16} />
                        {f.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={row.playerMat}
                onValueChange={(v) => setRow(row.uid, { playerMat: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Mat" />
                </SelectTrigger>
                <SelectContent>
                  {(matsQ.data ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="0"
                value={row.coins}
                onChange={(e) => setRow(row.uid, { coins: e.target.value })}
                className="text-right tabular-nums"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove player"
                className="text-muted-foreground"
                disabled={rows.length <= MIN_PLAYERS}
                onClick={() => setRows((prev) => prev.filter((r) => r.uid !== row.uid))}
              >
                ✕
              </Button>
            </div>
          ))}

          {rows.length < MAX_PLAYERS && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRows((prev) => [...prev, emptyRow()])}
              >
                + Add player
              </Button>
            </div>
          )}
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-muted-foreground text-sm">
          <input
            type="checkbox"
            className="size-[15px] accent-primary"
            checked={postToDiscord}
            onChange={(e) => setPostToDiscord(e.target.checked)}
          />
          Post match log to Discord
        </label>

        {attempted && outOfOrder && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-destructive text-sm"
            style={{
              background: 'color-mix(in oklab, var(--destructive) 12%, transparent)',
              border: '1px solid color-mix(in oklab, var(--destructive) 40%, transparent)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            >
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 5v3.5" />
              <circle cx="8" cy="11" r="0.75" fill="currentColor" stroke="none" />
            </svg>
            <span>
              Placements don’t match coin totals.{' '}
              <button type="button" className="underline" onClick={sortByCoins}>
                Sort by coins
              </button>{' '}
              or reorder the rows, then try again.
            </span>
          </div>
        )}

        <DialogFooter className="flex-row items-center justify-between gap-5 border-border border-t pt-4">
          <p className="m-0 flex-1 text-left text-muted-foreground text-sm">
            Players must be sorted in rank order, and{' '}
            <strong className="font-semibold text-foreground">
              winners of ties should come first
            </strong>
            .{' '}
            <button type="button" className="underline" onClick={sortByCoins}>
              Click here
            </button>{' '}
            to automatically sort based on coins.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={log.isPending}>
              {log.isPending ? 'Recording…' : 'Record match'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
