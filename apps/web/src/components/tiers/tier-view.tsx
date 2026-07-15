'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Bars } from '~/components/charts/bars';
import { FactionDisc } from '~/components/charts/faction-disc';
import { Panel } from '~/components/site/panel';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Skeleton } from '~/components/ui/skeleton';
import { factionColor, factionMat, NEUTRAL_BLUE, playerMatArt, tierColor } from '~/lib/factions';
import { winRate } from '~/lib/format';
import { trpc } from '~/trpc/react';

const TIER_CREDITS = ['FOMOF', 'AxlPrototype', 'JoyDivision', 'Mr. Derp', 'Reyl', 'w0j0'];
const labelCls = 'text-[11px] font-semibold uppercase tracking-[0.6px] text-muted-foreground';
const sectionTitleCls = 'text-lg font-semibold tracking-[-0.2px] m-0';

interface Selected {
  factionId: number;
  playerMatId: number;
  tierName: string;
}

/**
 * Mat illustration that shows the whole mat (no crop) and opens a full-size
 * render on click. `aspect` matches the source art so `object-contain` fills
 * the box edge-to-edge; the dialog swaps in the higher-res `-full` asset.
 */
function MatPreview({
  src,
  fullSrc,
  alt,
  aspect,
}: {
  src: string;
  fullSrc: string;
  alt: string;
  aspect: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Click to enlarge"
          className="relative block w-full cursor-zoom-in overflow-hidden rounded-[10px] border border-border bg-[color-mix(in_oklab,var(--muted)_30%,transparent)]"
          style={{ aspectRatio: aspect }}
        >
          <Image src={src} alt={alt} fill sizes="340px" className="object-contain" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[min(96vw,1100px)] p-3 sm:max-w-[min(96vw,1100px)]">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: aspect }}>
          <Image src={fullSrc} alt={alt} fill sizes="96vw" className="object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TierView() {
  const tiersQ = trpc.stats.tierList.useQuery();
  const factionsQ = trpc.reference.factions.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });
  const matsQ = trpc.reference.playerMats.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });
  const comboStatsQ = trpc.stats.comboStats.useQuery({});

  const [sel, setSel] = useState<Selected | null>(null);

  const tiers = tiersQ.data ?? [];
  const factions = factionsQ.data ?? [];
  const mats = matsQ.data ?? [];

  const factionById = useMemo(() => new Map(factions.map((f) => [f.id, f])), [factions]);

  // grid: playerMatId -> tierId -> factionId[]
  const grid = useMemo(() => {
    const g = new Map<number, Map<number, number[]>>();
    for (const t of tiers) {
      for (const c of t.combos) {
        const byTier = g.get(c.playerMatId) ?? new Map<number, number[]>();
        const list = byTier.get(t.tierId) ?? [];
        list.push(c.factionId);
        byTier.set(t.tierId, list);
        g.set(c.playerMatId, byTier);
      }
    }
    return g;
  }, [tiers]);

  // win rate lookup keyed by `${factionId}:${playerMatId}`
  const rateByCombo = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of comboStatsQ.data ?? []) {
      m.set(`${c.factionId}:${c.playerMatId}`, winRate(c.totalWins, c.totalMatches));
    }
    return m;
  }, [comboStatsQ.data]);

  // default selection: first combo of the first ranked tier that has any.
  const firstCombo = useMemo<Selected | null>(() => {
    for (const t of tiers) {
      const c = t.combos[0];
      if (c) return { factionId: c.factionId, playerMatId: c.playerMatId, tierName: t.name };
    }
    return null;
  }, [tiers]);

  const selected = sel ?? firstCombo;
  const selFaction = selected ? factionById.get(selected.factionId) : undefined;
  const selMat = selected ? mats.find((m) => m.id === selected.playerMatId) : undefined;

  if (tiersQ.isLoading || factionsQ.isLoading || matsQ.isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 pt-7 pb-10 sm:px-8">
        <Skeleton className="h-[420px] w-full rounded-[14px]" />
        <Skeleton className="h-[300px] w-full rounded-[14px]" />
      </div>
    );
  }

  const hasCombos = grid.size > 0;

  // detail charts
  const factionByMat = selFaction
    ? mats.map((m) => ({
        label: m.abbrev,
        value: rateByCombo.get(`${selFaction.id}:${m.id}`) ?? 0,
        color: NEUTRAL_BLUE,
      }))
    : [];
  const matByFaction = selMat
    ? factions.map((f) => ({
        faction: f.name,
        value: rateByCombo.get(`${f.id}:${selMat.id}`) ?? 0,
      }))
    : [];

  return (
    <div className="flex flex-col gap-6 px-4 pt-7 pb-10 sm:px-8">
      {/* heading + legend */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="m-0 font-bold text-[26px] tracking-[-0.8px] sm:text-[32px]">
            Faction × Mat Tier List
          </h1>
          <p className="mt-1.5 mb-0 text-[13.5px] text-muted-foreground">
            Community-ranked combinations
          </p>
        </div>
      </div>

      {/* matrix */}
      <Panel className="overflow-hidden p-1">
        {hasCombos ? (
          <div className="overflow-x-auto">
            <div
              className="grid min-w-[640px]"
              style={{ gridTemplateColumns: `76px repeat(${mats.length}, 1fr)` }}
            >
              <div />
              {mats.map((m) => {
                const on = selected?.playerMatId === m.id;
                return (
                  <div
                    key={m.id}
                    className="border-border border-b px-2 py-3.5 text-center font-semibold text-[13.5px]"
                    style={{ color: on ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                  >
                    {m.name}
                    {on && (
                      <div
                        className="mx-auto mt-1.5 h-0.5 w-7 rounded-sm"
                        style={{
                          background: selFaction ? factionColor(selFaction.name) : '#c6443e',
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {tiers.map((t, ri) => {
                const tc = tierColor(t.name);
                return (
                  <div key={t.tierId} className="contents">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        background: `color-mix(in oklab, ${tc} 16%, var(--card))`,
                        borderLeft: `3px solid ${tc}`,
                      }}
                    >
                      <span
                        className="font-extrabold text-[22px] tracking-[-0.5px]"
                        style={{ color: tc }}
                      >
                        {t.name}
                      </span>
                    </div>
                    {mats.map((m) => {
                      const facs = grid.get(m.id)?.get(t.tierId) ?? [];
                      return (
                        <div
                          key={m.id}
                          className="flex min-h-16 flex-wrap items-center justify-center gap-[7px] border-border border-t px-2 py-2.5"
                          style={{
                            background:
                              ri % 2
                                ? 'color-mix(in oklab, var(--muted) 26%, transparent)'
                                : 'transparent',
                          }}
                        >
                          {facs.map((fid) => {
                            const f = factionById.get(fid);
                            if (!f) return null;
                            const isSel =
                              selected?.factionId === fid && selected?.playerMatId === m.id;
                            const color = factionColor(f.name);
                            return (
                              <button
                                type="button"
                                key={fid}
                                title={`${f.name} ${m.name}`}
                                onClick={() =>
                                  setSel({ factionId: fid, playerMatId: m.id, tierName: t.name })
                                }
                                className="inline-flex cursor-pointer rounded-full transition-[transform,opacity]"
                                style={{
                                  opacity: isSel ? 1 : 0.5,
                                  boxShadow: isSel
                                    ? `0 0 0 2px var(--background), 0 0 0 4px ${color}`
                                    : 'none',
                                }}
                              >
                                <FactionDisc faction={f.name} size={36} />
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-6 py-16 text-center text-muted-foreground">
            <p className="m-0 text-sm">No tier-list data loaded yet.</p>
          </div>
        )}
      </Panel>

      {/* credits */}
      <p className="m-0 text-[12.5px] text-muted-foreground leading-relaxed">
        Created by members of our Discord community — may not reflect collected stats. Thanks to{' '}
        {TIER_CREDITS.map((c, i) => (
          <span key={c}>
            <span className="text-foreground">@{c}</span>
            {i < TIER_CREDITS.length - 1 ? ', ' : ''}
          </span>
        ))}
        .
      </p>

      {/* detail */}
      {selected && selFaction && selMat && (
        <Panel>
          <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-[340px_1fr_1fr]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <FactionDisc faction={selFaction.name} size={44} />
                <div>
                  <h2 className="m-0 font-bold text-[22px] tracking-[-0.4px]">
                    {selFaction.name} {selMat.name}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="rounded-md px-2 py-0.5 font-bold text-[11px]"
                      style={{
                        background: `color-mix(in oklab, ${tierColor(selected.tierName)} 22%, transparent)`,
                        color: tierColor(selected.tierName),
                      }}
                    >
                      {selected.tierName} TIER
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <MatPreview
                  src={factionMat(selFaction.name)}
                  fullSrc={factionMat(selFaction.name, true)}
                  alt={`${selFaction.name} faction mat`}
                  aspect="800 / 289"
                />
                <MatPreview
                  src={playerMatArt(selMat.name)}
                  fullSrc={playerMatArt(selMat.name, true)}
                  alt={`${selMat.name} player mat`}
                  aspect="800 / 315"
                />
              </div>
            </div>

            <div className="flex min-h-[280px] flex-col">
              <div className="mb-3.5">
                <h3 className={sectionTitleCls}>{selFaction.name} win rates</h3>
                <span className={`${labelCls} mt-[3px] block`}>by player mat</span>
              </div>
              <Bars
                data={factionByMat}
                accent={NEUTRAL_BLUE}
                highlight={selMat.abbrev}
                onSelect={(b) => {
                  const m = mats.find((x) => x.abbrev === b.label);
                  if (m) setSel({ ...selected, playerMatId: m.id });
                }}
                fill
              />
            </div>

            <div className="flex min-h-[280px] flex-col">
              <div className="mb-3.5">
                <h3 className={sectionTitleCls}>{selMat.name} win rates</h3>
                <span className={`${labelCls} mt-[3px] block`}>by faction</span>
              </div>
              <Bars
                data={matByFaction}
                highlight={selFaction.name}
                onSelect={(b) => {
                  const f = factions.find((x) => x.name === b.faction);
                  if (f) setSel({ ...selected, factionId: f.id });
                }}
                fill
              />
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
