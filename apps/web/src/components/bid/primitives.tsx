'use client';

import { Check, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { tierColor } from '~/lib/factions';

/** Auction coin gold — the bid-game accent (kept off the DS token palette). */
export const COIN_COLOR = '#d8a93a';

/** Coin token: small gold disc + tabular number. */
export function Coin({ n, size = 14, muted }: { n: number; size?: number; muted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 leading-none">
      <span
        className="shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          background: muted
            ? 'var(--muted)'
            : `radial-gradient(circle at 35% 30%, color-mix(in oklab, ${COIN_COLOR} 70%, white) 0%, ${COIN_COLOR} 60%, color-mix(in oklab, ${COIN_COLOR} 70%, black) 100%)`,
          boxShadow: muted
            ? 'none'
            : `inset 0 0 0 1px color-mix(in oklab, ${COIN_COLOR} 60%, black)`,
        }}
      />
      <span
        className="font-semibold tabular-nums"
        style={{ color: muted ? 'var(--muted-foreground)' : 'var(--foreground)' }}
      >
        {n}
      </span>
    </span>
  );
}

/** Tier chip (SS / S / A / …), colored from the community tier palette. */
export function TierBadge({ tier, size = 22 }: { tier: string; size?: number }) {
  const c = tierColor(tier);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center font-extrabold leading-none tracking-[-0.3px] [text-box:trim-both_cap_alphabetic]"
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        fontSize: size * 0.5,
        color: c,
        background: `color-mix(in oklab, ${c} 16%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c} 45%, transparent)`,
      }}
    >
      {tier}
    </span>
  );
}

/** Player avatar: Discord profile image when available, else circular
 * initials. You = primary, others = secondary. */
export function PlayerToken({
  name,
  you = false,
  size = 28,
  ring,
  avatarUrl,
}: {
  name: string;
  you?: boolean;
  size?: number;
  ring?: string;
  avatarUrl?: string | null;
}) {
  // A broken CDN image (deleted avatar, offline) falls back to initials.
  const [imgFailed, setImgFailed] = useState(false);
  const initials =
    name
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 2)
      .toUpperCase() || '?';
  const ringShadow = ring ? `0 0 0 2px var(--background), 0 0 0 3.5px ${ring}` : 'none';
  if (avatarUrl && !imgFailed) {
    return (
      // biome-ignore lint/performance/noImgElement: remote Discord CDN avatar; next/image adds nothing with the optimizer off.
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size, boxShadow: ringShadow }}
        onError={() => setImgFailed(true)}
      />
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold leading-none tracking-[-0.2px]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: you ? 'var(--primary)' : 'var(--secondary)',
        color: you ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
        boxShadow: ringShadow,
      }}
    >
      {/* text-box-trim only applies to block containers, so it must live on a
       * child of the flex circle — on the flex container itself it's a no-op
       * and the glyphs ride ~2px above center. */}
      <span className="block [text-box:trim-both_cap_alphabetic]">{initials}</span>
    </span>
  );
}

/**
 * Copies the current page URL and confirms right on the button — the label
 * swaps to "Copied!" for a beat, so the feedback lands where the user clicked
 * instead of only in a toast.
 */
export function CopyLinkButton({ children, ...buttonProps }: React.ComponentProps<typeof Button>) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.toString());
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Couldn’t copy — grab the URL from the address bar.');
    }
  };

  return (
    <Button {...buttonProps} onClick={copy} aria-live="polite">
      {copied ? (
        <span className="inline-flex items-center gap-1.5">
          <Check className="size-3.5" /> Copied!
        </span>
      ) : (
        children
      )}
    </Button>
  );
}

/** Slim tier-colored strength bar (combo win rate scaled to the meter). */
export function StrengthMeter({
  value,
  tier,
  width = 70,
}: {
  /** 0–100 fill. */
  value: number;
  tier: string | null;
  width?: number;
}) {
  const c = tier ? tierColor(tier) : 'var(--chart-2)';
  return (
    <div className="shrink-0 overflow-hidden rounded-[3px] bg-muted" style={{ width, height: 5 }}>
      <div
        className="h-full rounded-[3px]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: c }}
      />
    </div>
  );
}

export type BidPhase = 'lobby' | 'bidding' | 'results';

/** Lobby → Bidding → Results linear stage indicator. Reflects the game's
 * state machine — done stages get a check, the current one a filled disc; it
 * is progress, not navigation. */
export function StageIndicator({ phase }: { phase: BidPhase }) {
  const stages: Array<[BidPhase, string]> = [
    ['lobby', 'Lobby'],
    ['bidding', 'Bidding'],
    ['results', 'Results'],
  ];
  const curIdx = stages.findIndex(([k]) => k === phase);
  return (
    <ol aria-label="Game stage" className="m-0 flex list-none items-center p-0">
      {stages.map(([k, label], i) => {
        const done = i < curIdx;
        const on = i === curIdx;
        return (
          <li key={k} className="flex items-center">
            {i > 0 && (
              <span
                className="mx-2.5 h-px w-[22px]"
                style={{
                  background:
                    i <= curIdx
                      ? 'color-mix(in oklab, var(--primary) 55%, var(--border))'
                      : 'var(--border)',
                }}
              />
            )}
            <span
              className="inline-flex items-center gap-[7px]"
              aria-current={on ? 'step' : undefined}
            >
              {/* text-box trims the digit to cap height so flex centers the
                  visible glyph, not the line box (which sags below baseline). */}
              <span
                className="inline-flex size-[21px] items-center justify-center rounded-full font-bold text-[10.5px] leading-none tabular-nums [text-box:trim-both_cap_alphabetic]"
                style={{
                  background: on
                    ? 'var(--primary)'
                    : done
                      ? 'color-mix(in oklab, var(--primary) 22%, transparent)'
                      : 'transparent',
                  color: on
                    ? 'var(--primary-foreground)'
                    : done
                      ? 'var(--primary)'
                      : 'var(--muted-foreground)',
                  border: on || done ? '1px solid transparent' : '1px solid var(--border)',
                }}
              >
                {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className="text-[12.5px]"
                style={{
                  fontWeight: on ? 600 : 500,
                  color: on ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}
              >
                {label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The human's bid control: − [typeable coins] +. The amount can be typed
 * directly (legacy input parity); values above `max` clamp as you type, values
 * below `min` are allowed while typing (so "1" on the way to "15" doesn't
 * jump) and clamp on blur — callers should disable their submit action while
 * `value < min`.
 */
export function CoinStepper({
  value,
  min = 0,
  max = 250,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));
  const [editing, setEditing] = useState(false);

  // Mirror external changes (+/− buttons, a different combo selected) while
  // the field isn't being typed in.
  useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const commit = () => {
    setEditing(false);
    const n = Number.parseInt(text, 10);
    if (Number.isNaN(n)) {
      setText(String(value));
      return;
    }
    const c = clamp(n);
    setText(String(c));
    onChange(c);
  };

  const btn = (dir: -1 | 1, disabled: boolean) => (
    <button
      type="button"
      disabled={disabled}
      aria-label={dir < 0 ? 'Decrease bid' : 'Increase bid'}
      onClick={() => onChange(clamp(value + dir))}
      className="inline-flex size-[30px] items-center justify-center rounded-lg border border-border bg-background disabled:opacity-40"
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      {/* SVG icons instead of −/+ glyphs: text sits on the baseline, so the
          line box (not the visible symbol) is what flex would center. */}
      {dir < 0 ? <Minus className="size-4" /> : <Plus className="size-4" />}
    </button>
  );

  return (
    <div className="inline-flex items-center gap-1.5">
      {btn(-1, value <= min)}
      {/* The field reads as a text input: bordered box, coin icon inside,
          coin-gold focus ring while typing. */}
      <label
        className="inline-flex h-[30px] w-[77px] cursor-text items-center justify-center gap-1.5 rounded-lg bg-background"
        style={{
          border: `1px solid ${editing ? COIN_COLOR : 'var(--input)'}`,
          boxShadow: editing
            ? `0 0 0 3px color-mix(in oklab, ${COIN_COLOR} 28%, transparent)`
            : 'none',
          transition: 'border-color .12s, box-shadow .12s',
        }}
      >
        <span
          className="size-[13px] shrink-0 rounded-full"
          style={{
            background: COIN_COLOR,
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${COIN_COLOR} 60%, black)`,
          }}
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label="Bid amount"
          value={text}
          onFocus={(e) => {
            setEditing(true);
            e.target.select();
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            const n = Number.parseInt(raw, 10);
            if (!Number.isNaN(n) && n > max) {
              setText(String(max));
              onChange(max);
              return;
            }
            setText(raw);
            if (!Number.isNaN(n)) onChange(n);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          className="border-none bg-transparent p-0 text-center font-bold text-[17px] leading-none tabular-nums tracking-[-0.5px] outline-none [text-box:trim-both_cap_alphabetic]"
          // Auto-size to the digits (+ caret room) so the coin+number sit as
          // one centered cluster instead of the number floating in a fixed box.
          style={{ width: `calc(${Math.max(text.length, 1)}ch + 3px)` }}
        />
      </label>
      {btn(1, value >= max)}
    </div>
  );
}
