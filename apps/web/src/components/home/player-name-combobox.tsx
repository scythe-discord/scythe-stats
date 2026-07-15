'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '~/components/ui/input';
import { trpc } from '~/trpc/react';

/**
 * Player-name input with typeahead against `players.byName` (legacy record-match
 * creatable select). Picking an existing player fills the exact stored name so
 * results attach to them; the "Create" row commits the typed text as-is — the
 * player is actually created server-side when the match is recorded.
 */
export function PlayerNameCombobox({
  value,
  onChange,
  placeholder = 'Player',
}: {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Debounce what we send to the server, not what the user sees.
  useEffect(() => {
    const t = setTimeout(() => setQuery(value.trim()), 250);
    return () => clearTimeout(t);
  }, [value]);

  const searchQ = trpc.players.byName.useQuery(
    { startsWith: query, limit: 8 },
    { enabled: open && query.length > 0, placeholderData: (prev) => prev },
  );

  const trimmed = value.trim();
  const matches = trimmed.length > 0 ? (searchQ.data ?? []) : [];
  const exact = matches.some((p) => p.displayName.toLowerCase() === trimmed.toLowerCase());
  // Option list: existing players first, then a synthetic "Create" row.
  const options: Array<{ key: string; label: string; create: boolean }> = [
    ...matches.map((p) => ({ key: `p-${p.id}`, label: p.displayName, create: false })),
    ...(trimmed && !exact ? [{ key: 'create', label: trimmed, create: true }] : []),
  ];
  const show = open && trimmed.length > 0 && options.length > 0;

  useEffect(() => {
    setHighlight((h) => Math.min(h, Math.max(0, options.length - 1)));
  }, [options.length]);

  const pick = (label: string) => {
    onChange(label);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!show) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      setHighlight((h) => (h + dir + options.length) % options.length);
      listRef.current
        ?.querySelectorAll('button')
        [(highlight + dir + options.length) % options.length]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) pick(opt.label);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        role="combobox"
        aria-expanded={show}
        aria-autocomplete="list"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {show && (
        <div
          ref={listRef}
          className="absolute top-full left-0 z-50 mt-1 max-h-52 w-full min-w-40 overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-md"
        >
          {searchQ.isFetching && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 text-muted-foreground text-xs">
              <Loader2 className="size-3 animate-spin" /> Searching…
            </div>
          )}
          {options.map((opt, i) => (
            <button
              type="button"
              key={opt.key}
              className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[13px]"
              style={{ background: i === highlight ? 'var(--accent)' : 'transparent' }}
              // preventDefault keeps focus in the input so onBlur doesn't close
              // the list before the click lands.
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pick(opt.label)}
            >
              {opt.create ? (
                <>
                  <span className="text-muted-foreground">Create</span>
                  <span className="font-medium">“{opt.label}”</span>
                </>
              ) : (
                <span className="truncate">{opt.label}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
