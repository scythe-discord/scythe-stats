import React, { useState, useMemo } from 'react';
import { useStyletron } from 'baseui';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Button, KIND, SIZE } from 'baseui/button';
import { Input } from 'baseui/input';
import { LabelMedium } from 'baseui/typography';
import Image from 'next/image';
import { getFactionEmblem } from 'lib/scythe';
import { GeneratedCombo } from './types';

interface GameBiddingTableProps {
  combos: GeneratedCombo[];
}

const GameBiddingTable: React.FC<GameBiddingTableProps> = ({ combos }) => {
  const [css, theme] = useStyletron();
  const [bids, setBids] = useState<
    Record<string, { amount: number; bidder: string }>
  >({});
  const [bidHistory, setBidHistory] = useState<string[]>([]);
  const [bidInputs, setBidInputs] = useState<
    Record<string, number | undefined>
  >({});
  const [biddingFinished, setBiddingFinished] = useState(false);
  const players = useMemo(
    () => combos.map((c) => c.playerName).sort(),
    [combos]
  );
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const currentPlayer = players[currentPlayerIndex];

  const handleBid = (combo: GeneratedCombo) => {
    const bidder = currentPlayer;
    const bidAmount = bidInputs[combo.faction.name] ?? 0;
    const comboKey = combo.faction.name;
    const currentBid = bids[comboKey];

    if (bidAmount < 0) {
      alert('Bid cannot be negative.');
      return;
    }

    // Allow bidding 0 only if there's no current bid
    if (currentBid && bidAmount === 0) {
      alert('Bid must be greater than 0 if a bid already exists.');
      return;
    }

    if (currentBid && bidAmount <= currentBid.amount) {
      alert('Your bid must be higher than the current bid.');
      return;
    }

    const updatedBids = {
      ...bids,
      [comboKey]: { amount: bidAmount, bidder },
    };

    setBids(updatedBids);
    setBidHistory((prev) => [
      ...prev,
      `${bidder} bids $${bidAmount} on ${combo.faction.name} ${combo.playerMat.name}`,
    ]);

    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);

    // Check for win condition
    const allFactionsBidded = Object.keys(updatedBids).length === combos.length;
    if (allFactionsBidded) {
      const highBidders = Object.values(updatedBids).map((b) => b.bidder);
      const uniqueHighBidders = new Set(highBidders);
      if (uniqueHighBidders.size === players.length) {
        setBiddingFinished(true);
      }
    }
  };

  return (
    <div>
      <div
        className={css({
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '20px',
        })}
      >
        <LabelMedium>Current Turn:</LabelMedium>
        <strong>{currentPlayer}</strong>
      </div>
      <TableBuilder<GeneratedCombo>
        data={combos}
        overrides={{
          TableBodyCell: {
            style: {
              verticalAlign: 'center',
            },
          },
        }}
      >
        <TableBuilderColumn<GeneratedCombo> header="Faction">
          {(row) => (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              })}
            >
              <Image
                src={getFactionEmblem(row.faction.name)}
                alt={row.faction.name}
                width={36}
                height={36}
              />
              <LabelMedium>{row.faction.name}</LabelMedium>
            </div>
          )}
        </TableBuilderColumn>

        <TableBuilderColumn<GeneratedCombo> header="Player Mat">
          {(row) => <LabelMedium>{row.playerMat.name}</LabelMedium>}
        </TableBuilderColumn>

        <TableBuilderColumn<GeneratedCombo> header="Current Bid">
          {(row) => (
            <LabelMedium>${bids[row.faction.name]?.amount ?? 0}</LabelMedium>
          )}
        </TableBuilderColumn>

        <TableBuilderColumn<GeneratedCombo> header="Highest Bidder">
          {(row) => (
            <LabelMedium>{bids[row.faction.name]?.bidder ?? 'N/A'}</LabelMedium>
          )}
        </TableBuilderColumn>

        <TableBuilderColumn<GeneratedCombo>>
          {(row) => (
            <div
              className={css({
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              })}
            >
              <Input
                type="number"
                min={0}
                value={bidInputs[row.faction.name] ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setBidInputs((prev) => ({
                    ...prev,
                    [row.faction.name]:
                      value === '' ? undefined : Number(value),
                  }));
                }}
                disabled={biddingFinished}
                overrides={{ Root: { style: { width: '70px' } } }}
              />
              <Button
                size={SIZE.compact}
                kind={KIND.secondary}
                onClick={() => handleBid(row)}
                disabled={biddingFinished}
              >
                Bid
              </Button>
            </div>
          )}
        </TableBuilderColumn>
      </TableBuilder>

      {biddingFinished && (
        <div
          className={css({
            marginTop: '20px',
            padding: '10px',
            backgroundColor: theme.colors.positive,
            color: theme.colors.contentInversePrimary,
            borderRadius: '4px',
            textAlign: 'center',
          })}
        >
          <LabelMedium color="inherit">Bidding Finished!</LabelMedium>
        </div>
      )}

      <div className={css({ marginTop: '20px' })}>
        <LabelMedium as="h3">Bid History</LabelMedium>
        <div
          className={css({
            marginTop: '10px',
            padding: '10px',
            backgroundColor: theme.colors.backgroundSecondary,
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
          })}
        >
          {bidHistory.length === 0 && (
            <LabelMedium color={theme.colors.contentSecondary}>
              No bids yet.
            </LabelMedium>
          )}
          {bidHistory
            .slice()
            .reverse()
            .map((log, index) => (
              <div key={index}>{log}</div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GameBiddingTable;
