'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Line chart: a faction's win rate by player count (accent line) against the
 * balanced-baseline "expected" rate (dashed). Expected defaults to 100/count,
 * matching the legacy chart's semantics.
 *
 * The Y axis adapts to the data so extreme rates (a genuine 0% at 7p, or a high
 * 2p rate) stay on-chart. `actual` entries may be null for player counts with no
 * games — those render as gaps in the line rather than fake 0% points.
 *
 * Hovering (or focusing + arrow keys) snaps a crosshair to the nearest player
 * count and shows both series' exact values (legacy recharts tooltip parity).
 */
export function WinRateLine({
  counts,
  actual,
  expected,
  accent = 'var(--chart-2)',
  height = 240,
  width: initialWidth = 560,
}: {
  counts: number[];
  actual: (number | null)[];
  expected?: number[];
  accent?: string;
  height?: number;
  /** Initial viewBox width; the chart re-measures to its container after mount. */
  width?: number;
}) {
  const pad = { l: 40, r: 16, t: 18, b: 30 };
  const exp = expected ?? counts.map((c) => 100 / c);
  const [hover, setHover] = useState<number | null>(null);

  // Size the SVG coordinate space to the container so labels render at their
  // natural pixel size instead of scaling down with the viewBox.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setMeasured(Math.max(220, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const width = measured ?? initialWidth;

  // Dynamic Y domain from all plotted values (actual + expected), padded and
  // snapped to a nice step, clamped to [0, 100].
  const vals = [...actual.filter((v): v is number => v != null), ...exp];
  const dataMin = Math.min(...vals);
  const dataMax = Math.max(...vals);
  const padAmt = Math.max(5, (dataMax - dataMin) * 0.15);
  const rawStep = (dataMax + padAmt - (dataMin - padAmt)) / 5;
  const step = [5, 10, 20, 25, 50].find((s) => s >= rawStep) ?? 50;
  const minY = Math.max(0, Math.floor((dataMin - padAmt) / step) * step);
  const maxY = Math.min(100, Math.max(minY + step, Math.ceil((dataMax + padAmt) / step) * step));

  const xAt = (i: number) => pad.l + (i / (counts.length - 1)) * (width - pad.l - pad.r);
  const yAt = (v: number) => pad.t + (1 - (v - minY) / (maxY - minY)) * (height - pad.t - pad.b);
  // Build a path that breaks into segments wherever a value is null (a gap).
  const path = (arr: (number | null)[]) => {
    let d = '';
    let pen = false;
    arr.forEach((v, i) => {
      if (v == null) {
        pen = false;
        return;
      }
      d += `${pen ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)} `;
      pen = true;
    });
    return d.trim();
  };

  const yTicks: number[] = [];
  for (let t = minY; t <= maxY + 1e-9; t += step) yTicks.push(t);

  // Snap the pointer to the nearest player count (readers aim at a count, not
  // at the 2.5px line).
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * width;
    const t = (vx - pad.l) / (width - pad.l - pad.r);
    const i = Math.round(t * (counts.length - 1));
    setHover(Math.max(0, Math.min(counts.length - 1, i)));
  };
  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const dir = e.key === 'ArrowLeft' ? -1 : 1;
      setHover((h) => Math.max(0, Math.min(counts.length - 1, (h ?? 0) + dir)));
    } else if (e.key === 'Escape') {
      setHover(null);
    }
  };

  const hoverActual = hover != null ? actual[hover] : null;
  const hoverExpected = hover != null ? exp[hover] : null;
  // Anchor the tooltip beside the crosshair, flipping to the left half near the
  // right edge so it never overflows the panel.
  const flip = hover != null && hover > (counts.length - 1) / 2;

  return (
    <div className="relative" ref={wrapRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full outline-none"
        role="img"
        aria-label="Win rate by player count"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: focus enables the keyboard-driven crosshair (arrow keys step through player counts).
        tabIndex={0}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setHover(null)}
      >
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={pad.l}
              y1={yAt(t)}
              x2={width - pad.r}
              y2={yAt(t)}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={pad.l - 8}
              y={yAt(t) + 3.5}
              textAnchor="end"
              fontSize="11"
              fill="var(--muted-foreground)"
            >
              {t}%
            </text>
          </g>
        ))}
        {counts.map((c, i) => (
          <text
            key={c}
            x={xAt(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted-foreground)"
          >
            {c}p
          </text>
        ))}
        {hover != null && (
          <line
            x1={xAt(hover)}
            y1={pad.t}
            x2={xAt(hover)}
            y2={height - pad.b}
            stroke="var(--muted-foreground)"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.8"
          />
        )}
        <path
          d={path(exp)}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.7"
        />
        <path
          d={path(actual)}
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hover != null && hoverExpected != null && (
          <circle
            cx={xAt(hover)}
            cy={yAt(hoverExpected)}
            r="3.5"
            fill="var(--card)"
            stroke="var(--muted-foreground)"
            strokeWidth="1.5"
          />
        )}
        {actual.map((v, i) =>
          v == null ? null : (
            <circle
              key={counts[i]}
              cx={xAt(i)}
              cy={yAt(v)}
              r={hover === i ? 5 : 3.5}
              fill="var(--card)"
              stroke={accent}
              strokeWidth="2"
            />
          ),
        )}
      </svg>
      {hover != null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[168px] rounded-lg border border-border bg-popover px-3 py-2.5 shadow-md"
          style={{
            left: `${(xAt(hover) / width) * 100}%`,
            transform: flip ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)',
          }}
        >
          <div className="mb-1.5 font-semibold text-[12.5px]">{counts[hover]} Players</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-0.5 w-3.5 shrink-0 rounded-sm" style={{ background: accent }} />
            <span className="text-muted-foreground">Win rate</span>
            <span className="ml-auto font-semibold tabular-nums">
              {hoverActual != null ? `${hoverActual.toFixed(2)}%` : 'no games'}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="w-3.5 shrink-0 border-muted-foreground border-t-2 border-dashed" />
            <span className="text-muted-foreground">Expected</span>
            <span className="ml-auto font-semibold tabular-nums">
              {hoverExpected != null ? `${hoverExpected.toFixed(2)}%` : '—'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
