'use client';

import { useState } from 'react';
import { factionColor } from '~/lib/factions';
import { FactionDisc } from './faction-disc';

export interface FactionBar {
  faction: string;
  rate: number;
}

/** Vertical bar chart of per-faction win rates, with a highlighted faction. */
export function FactionBars({
  data,
  highlight,
  onSelect,
  height = 220,
  max = 50,
}: {
  data: FactionBar[];
  highlight?: string;
  onSelect?: (faction: string) => void;
  height?: number;
  max?: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);

  return (
    <div className="w-full">
      <div className="relative flex items-end" style={{ height }}>
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute right-0 left-0 flex items-center border-border border-t"
            style={{ bottom: `${(t / max) * 100}%` }}
          >
            <span className="-translate-y-1/2 absolute left-[-34px] text-[11px] text-muted-foreground tabular-nums">
              {t}%
            </span>
          </div>
        ))}
        <div className="flex h-full w-full items-end gap-1.5 pl-1.5 sm:gap-3.5">
          {data.map((d) => {
            const color = factionColor(d.faction);
            const isHi = d.faction === highlight;
            const active = hover === d.faction;
            const h = (d.rate / max) * 100;
            return (
              <button
                type="button"
                key={d.faction}
                onMouseEnter={() => setHover(d.faction)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect?.(d.faction)}
                className="relative flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-1.5 bg-transparent"
              >
                <span
                  className="hidden font-semibold text-xs tabular-nums sm:block"
                  style={{
                    color: isHi ? color : 'var(--foreground)',
                    opacity: active || isHi ? 1 : 0.75,
                  }}
                >
                  {d.rate.toFixed(1)}%
                </span>
                <div
                  className="w-full max-w-[38px] transition-opacity"
                  style={{
                    height: `${h}%`,
                    borderRadius: '5px 5px 2px 2px',
                    background: color,
                    opacity: isHi ? 1 : active ? 0.95 : 0.62,
                    boxShadow: isHi
                      ? `0 0 0 1.5px color-mix(in oklab, ${color} 60%, transparent)`
                      : 'none',
                  }}
                />
                <FactionDisc faction={d.faction} size={22} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
