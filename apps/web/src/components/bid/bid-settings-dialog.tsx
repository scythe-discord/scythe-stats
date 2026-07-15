'use client';

import { useMemo, useState } from 'react';
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
import { trpc } from '~/trpc/react';
import type { BidGame } from '~/trpc/types';

interface Combo {
  factionId: number;
  playerMatId: number;
}

const comboKey = (factionId: number, playerMatId: number) => `${factionId}:${playerMatId}`;
const parseComboKey = (k: string): Combo => {
  const [f, m] = k.split(':');
  return { factionId: Number(f), playerMatId: Number(m) };
};

/** Native checkbox with indeterminate support (headers of the combo matrix). */
function Check({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <input
      type="checkbox"
      className="size-4 cursor-pointer accent-primary disabled:cursor-default"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate && !checked;
      }}
      onChange={onChange}
    />
  );
}

/**
 * The bid game's settings: which faction × player-mat combos can be dealt.
 * Ported from the legacy edit-settings modal — preset buttons apply a preset's
 * matrix, the matrix itself is freely editable (header/row/column toggles), and
 * the selected preset is *derived*: if the matrix exactly matches a preset it
 * counts as that preset, otherwise the game is "Custom" (bidPresetId null).
 * Hosts of a not-yet-started game can edit; everyone else gets a read-only view.
 */
export function BidSettingsDialog({
  bidGameId,
  canEdit,
  presetName,
  enabledCombos,
  trigger,
  onGame,
}: {
  bidGameId: number;
  canEdit: boolean;
  presetName: string | null;
  enabledCombos: Combo[];
  /** Custom trigger element (defaults to an outline button naming the preset). */
  trigger?: React.ReactNode;
  /** Apply the mutation's returned game to the view (SSE-independent update). */
  onGame?: (g: BidGame) => void;
}) {
  const [open, setOpen] = useState(false);
  // Enabled combos as "factionId:playerMatId" keys; seeded from the game when
  // the dialog opens.
  const [enabled, setEnabled] = useState<Set<string>>(new Set());

  const factionsQ = trpc.reference.factions.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });
  const matsQ = trpc.reference.playerMats.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });
  const presetsQ = trpc.reference.bidPresets.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const update = trpc.bids.updateSettings.useMutation({
    onSuccess: (g) => {
      onGame?.(g);
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const factions = factionsQ.data ?? [];
  const mats = matsQ.data ?? [];

  // Each preset's enabled-key set, for both applying and match detection.
  const presetKeySets = useMemo(
    () =>
      (presetsQ.data ?? []).map((preset) => ({
        preset,
        keys: new Set(
          preset.settings
            .filter((s) => s.enabled && s.factionId != null && s.playerMatId != null)
            .map((s) => comboKey(s.factionId as number, s.playerMatId as number)),
        ),
      })),
    [presetsQ.data],
  );

  const sameSet = (a: Set<string>, b: Set<string>) =>
    a.size === b.size && [...a].every((k) => b.has(k));
  // Presets with no settings rows (unseeded) never match and can't be applied.
  const matched = presetKeySets.find((p) => p.keys.size > 0 && sameSet(p.keys, enabled)) ?? null;

  const onOpenChange = (next: boolean) => {
    if (next) setEnabled(new Set(enabledCombos.map((c) => comboKey(c.factionId, c.playerMatId))));
    setOpen(next);
  };

  const setKeys = (keys: string[], on: boolean) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (on) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  };

  const allKeys = factions.flatMap((f) => mats.map((m) => comboKey(f.id, m.id)));
  const allChecked = allKeys.length > 0 && allKeys.every((k) => enabled.has(k));
  const anyChecked = allKeys.some((k) => enabled.has(k));

  const submit = () => {
    update.mutate({
      bidGameId,
      combos: [...enabled].map(parseComboKey),
      bidPresetId: matched?.preset.id ?? null,
    });
  };

  const loading = factionsQ.isLoading || matsQ.isLoading || presetsQ.isLoading;
  const selectionName = matched?.preset.name ?? 'Custom';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            Game setting: {presetName ?? 'Custom'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{canEdit ? 'Edit bid game settings' : 'Bid game settings'}</DialogTitle>
          <DialogDescription>
            {canEdit
              ? 'Pick a preset or toggle individual faction/player-mat combinations to decide what can be dealt when the game starts.'
              : 'The faction/player-mat combinations that can be dealt in this game.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="m-0 py-6 text-center text-muted-foreground text-sm">Loading…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {presetKeySets.map(({ preset, keys }) => (
                <Button
                  key={preset.id}
                  size="sm"
                  variant={matched?.preset.id === preset.id ? 'default' : 'outline'}
                  disabled={!canEdit || keys.size === 0}
                  title={keys.size === 0 ? 'Preset data not loaded' : undefined}
                  onClick={() => setEnabled(new Set(keys))}
                >
                  {preset.name}
                </Button>
              ))}
              <span className="ml-auto text-muted-foreground text-xs">
                {selectionName} · {enabled.size} combos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left align-bottom">
                      <Check
                        checked={allChecked}
                        indeterminate={anyChecked}
                        disabled={!canEdit}
                        label="Toggle all combos"
                        onChange={() => setKeys(allKeys, !allChecked)}
                      />
                    </th>
                    {mats.map((m) => {
                      const colKeys = factions.map((f) => comboKey(f.id, m.id));
                      const colAll = colKeys.every((k) => enabled.has(k));
                      const colAny = colKeys.some((k) => enabled.has(k));
                      return (
                        <th key={m.id} className="p-2 text-center align-bottom">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="font-semibold text-muted-foreground text-xs">
                              {m.abbrev ?? m.name}
                            </span>
                            <Check
                              checked={colAll}
                              indeterminate={colAny}
                              disabled={!canEdit}
                              label={`Toggle all ${m.name} combos`}
                              onChange={() => setKeys(colKeys, !colAll)}
                            />
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {factions.map((f) => {
                    const rowKeys = mats.map((m) => comboKey(f.id, m.id));
                    const rowAll = rowKeys.every((k) => enabled.has(k));
                    const rowAny = rowKeys.some((k) => enabled.has(k));
                    return (
                      <tr key={f.id} className="border-border border-t">
                        <td className="p-2">
                          <div className="flex items-center gap-2.5">
                            <Check
                              checked={rowAll}
                              indeterminate={rowAny}
                              disabled={!canEdit}
                              label={`Toggle all ${f.name} combos`}
                              onChange={() => setKeys(rowKeys, !rowAll)}
                            />
                            <FactionDisc faction={f.name} size={22} />
                            <span className="font-medium">{f.name}</span>
                          </div>
                        </td>
                        {mats.map((m) => {
                          const k = comboKey(f.id, m.id);
                          return (
                            <td key={m.id} className="p-2 text-center">
                              <Check
                                checked={enabled.has(k)}
                                disabled={!canEdit}
                                label={`${f.name} ${m.name}`}
                                onChange={() => setKeys([k], !enabled.has(k))}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <DialogFooter>
          {canEdit ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={update.isPending || enabled.size === 0}>
                {update.isPending ? 'Saving…' : 'Save settings'}
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
