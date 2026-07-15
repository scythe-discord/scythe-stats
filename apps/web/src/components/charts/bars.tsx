'use client';

import { useState } from 'react';
import { factionColor } from '~/lib/factions';
import { FactionDisc } from './faction-disc';

export interface Bar {
  /** x-axis label (used when `faction` is absent). */
  label?: string;
  /** when set, the x-axis tick renders a faction disc instead of a label. */
  faction?: string;
  value: number;
  color?: string;
}

/** Generic vertical bar chart with label- or faction-disc x ticks. */
export function Bars({
  data,
  max,
  height = 200,
  fill = false,
  accent = 'var(--chart-2)',
  highlight,
  onSelect,
}: {
  data: Bar[];
  max?: number;
  height?: number;
  /** When true, fill the parent's height (must have a definite height) instead of using `height`. */
  fill?: boolean;
  accent?: string;
  highlight?: string;
  onSelect?: (bar: Bar) => void;
}) {
  const top = max ?? Math.ceil(Math.max(1, ...data.map((d) => d.value)) / 10) * 10;
  const [hover, setHover] = useState<number | null>(null);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * top));

  return (
    <div
      className={`relative ml-[34px] flex items-end${fill ? ' min-h-0 flex-1' : ''}`}
      style={fill ? undefined : { height }}
    >
      {ticks.map((t) => (
        <div
          key={t}
          className="absolute right-0 left-0 border-border border-t"
          style={{ bottom: `${(t / top) * 100}%` }}
        >
          <span className="-translate-y-1/2 absolute left-[-32px] text-[10.5px] text-muted-foreground tabular-nums">
            {t}%
          </span>
        </div>
      ))}
      <div className="flex h-full w-full items-end gap-1.5 sm:gap-2.5">
        {data.map((d, i) => {
          const color = d.color ?? (d.faction ? factionColor(d.faction) : accent);
          const isHi = highlight != null && (d.label === highlight || d.faction === highlight);
          const active = hover === i;
          const h = Math.min(100, (d.value / top) * 100);
          return (
            <button
              type="button"
              key={d.faction ?? d.label ?? i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(d)}
              className="flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-1.5 bg-transparent"
            >
              <span
                className="hidden font-semibold text-[11px] tabular-nums sm:block"
                style={{ opacity: active || isHi ? 1 : 0.7 }}
              >
                {d.value.toFixed(d.value % 1 ? 1 : 0)}%
              </span>
              <div
                className="w-full max-w-[34px] transition-opacity"
                style={{
                  height: `${h}%`,
                  borderRadius: '4px 4px 2px 2px',
                  background: color,
                  opacity: isHi ? 1 : active ? 0.92 : 0.6,
                  boxShadow: isHi
                    ? `0 0 0 1.5px color-mix(in oklab, ${color} 55%, transparent)`
                    : 'none',
                }}
              />
              {d.faction ? (
                <FactionDisc faction={d.faction} size={20} />
              ) : (
                <span
                  className="text-[11px]"
                  style={{
                    color: isHi ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontWeight: isHi ? 600 : 400,
                  }}
                >
                  {d.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
