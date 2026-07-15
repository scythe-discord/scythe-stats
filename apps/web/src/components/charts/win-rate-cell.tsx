/** Inline win-rate cell: right-aligned number + slim heat bar. */
export function WinRateCell({
  value,
  max = 45,
  color,
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const c = color ?? 'var(--chart-2)';
  return (
    <div className="flex items-center justify-end gap-2.5">
      <span className="min-w-[52px] text-right font-semibold tabular-nums">
        {value.toFixed(2)}%
      </span>
      <div className="h-[5px] w-14 shrink-0 overflow-hidden rounded-[3px] bg-muted">
        <div className="h-full rounded-[3px]" style={{ width: `${pct}%`, background: c }} />
      </div>
    </div>
  );
}
