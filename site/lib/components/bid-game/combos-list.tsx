import { useStyletron } from 'baseui';
import { Button, KIND } from 'baseui/button';
import { Input } from 'baseui/input';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { LabelMedium } from 'baseui/typography';
import {
  BidGameFragment,
  BidGameStatus,
  useBidMutation,
} from 'lib/graphql/codegen';
import { getFactionEmblem } from 'lib/scythe';
import React, { useState } from 'react';
import { Skeleton } from 'baseui/skeleton';
import ConfirmQuickBidModal, {
  QuickBidWithCombo,
} from './confirm-quick-bid-modal';
import Image from 'next/image';

type Combo = NonNullable<BidGameFragment['combos']>[number];

function sortCombos(combos: Array<Combo> | null | undefined) {
  if (!combos) {
    return combos;
  }

  const firstCombo = combos.reduce((firstSoFar, curr) => {
    if (!firstSoFar) {
      return curr;
    }

    return curr.playerMat.order < firstSoFar.playerMat.order
      ? curr
      : firstSoFar;
  }, null as Combo | null);

  if (!firstCombo) {
    return [];
  }

  const combosCopy = [...combos];

  return combosCopy.sort(
    (a, b) =>
      a.faction.position +
      (a.faction.position < firstCombo.faction.position ? 7 : 0) -
      (b.faction.position +
        (b.faction.position < firstCombo.faction.position ? 7 : 0))
  );
}

export default function CombosList({
  bidGame,
  ownPlayer,
}: {
  bidGame: BidGameFragment;
  ownPlayer: BidGameFragment['players'][number] | undefined;
}) {
  const [css, theme] = useStyletron();
  const [bids, setBids] = useState(
    bidGame.combos?.reduce((acc, curr) => {
      acc[curr.id] = (curr.bid?.coins ?? -1) + 1;
      return acc;
    }, {} as Record<number, number>) ?? {}
  );

  const [mutate] = useBidMutation();

  const [confirmQuickBidModalOpen, setConfirmQuickBidModalOpen] =
    useState(false);

  const { combos } = bidGame;
  const sortedCombos = sortCombos(combos);

  return (
    <div>
      <TableBuilder<Combo | 'TBD'>
        data={
          sortedCombos && sortedCombos.length > 0
            ? sortedCombos
            : bidGame.players.map(() => 'TBD')
        }
        overrides={{
          TableBodyCell: { style: () => ({ verticalAlign: 'middle' }) },
        }}
      >
        <TableBuilderColumn<Combo | 'TBD'> header="Faction/Player Mat">
          {(combo) => (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              })}
            >
              {combo === 'TBD' ? (
                <>
                  <Skeleton
                    width="36px"
                    height="36px"
                    overrides={{
                      Root: {
                        style: {
                          borderRadius: '50%',
                        },
                      },
                    }}
                  />
                  <Skeleton
                    height="20px"
                    width="150px"
                    overrides={{
                      Root: {
                        style: {
                          borderRadius: '8px',
                        },
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <Image
                    src={getFactionEmblem(combo.faction.name)}
                    alt={combo.faction.name}
                    width={36}
                    height={36}
                  />
                  <LabelMedium>
                    {combo.faction.name} {combo.playerMat.name}
                  </LabelMedium>
                </>
              )}
            </div>
          )}
        </TableBuilderColumn>
        {!(bidGame.quickBid && bidGame.status === BidGameStatus.Bidding) && (
          <TableBuilderColumn<Combo | 'TBD'> header="Current Bid">
            {(combo) => {
              if (combo === 'TBD') {
                return (
                  <Skeleton
                    height="20px"
                    width="150px"
                    overrides={{
                      Root: {
                        style: {
                          borderRadius: '8px',
                        },
                      },
                    }}
                  />
                );
              }
              if (!combo.bid) {
                return (
                  <LabelMedium
                    color={theme.colors.contentSecondary}
                    style={{ fontStyle: 'italic' }}
                  >
                    None
                  </LabelMedium>
                );
              }

              const player = bidGame.players.find(
                (player) => player.bid?.id === combo.bid?.id
              );

              return (
                <LabelMedium>
                  ${combo.bid.coins} by {player?.user.username}
                </LabelMedium>
              );
            }}
          </TableBuilderColumn>
        )}
        <TableBuilderColumn<Combo | 'TBD'>>
          {(combo) => {
            if (combo === 'TBD') {
              return (
                <Skeleton
                  height="20px"
                  width="150px"
                  overrides={{
                    Root: {
                      style: {
                        borderRadius: '8px',
                      },
                    },
                  }}
                />
              );
            }
            if (bidGame.status !== BidGameStatus.Bidding || !ownPlayer) {
              return null;
            }
            return (
              <div
                className={css({
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                })}
              >
                <Input
                  key={combo.bid?.id}
                  value={bids[combo.id]}
                  disabled={
                    bidGame.status !== BidGameStatus.Bidding ||
                    (!!bidGame.activePlayer &&
                      bidGame.activePlayer.id !== ownPlayer?.id) ||
                    Boolean(ownPlayer?.quickBidReady)
                  }
                  inputMode="numeric"
                  type="number"
                  max={999}
                  min={0}
                  maxLength={3}
                  overrides={{
                    Root: {
                      style: () => ({
                        width: '70px',
                      }),
                    },
                  }}
                  onChange={(e) => {
                    const num = Number(e.target.value);

                    if (!Number.isInteger(num)) {
                      return;
                    }

                    setBids((prev) => ({ ...prev, [combo.id]: num }));
                  }}
                />
                {!bidGame.quickBid && ownPlayer && (
                  <Button
                    kind={KIND.secondary}
                    onClick={() => {
                      mutate({
                        variables: {
                          comboId: combo.id,
                          coins: bids[combo.id],
                          bidGameId: bidGame.id,
                        },
                      });
                    }}
                    disabled={
                      bidGame.activePlayer?.id !== ownPlayer.id ||
                      bids[combo.id] <= (combo.bid?.coins ?? 0)
                    }
                  >
                    Bid
                  </Button>
                )}
              </div>
            );
          }}
        </TableBuilderColumn>
      </TableBuilder>
      {bidGame.quickBid &&
        bidGame.status === BidGameStatus.Bidding &&
        !ownPlayer?.quickBidReady && (
          <div className={css({ marginTop: '10px', textAlign: 'right' })}>
            <Button
              kind={KIND.secondary}
              onClick={() => {
                setConfirmQuickBidModalOpen(true);
              }}
            >
              Continue
            </Button>
          </div>
        )}
      {bidGame.quickBid && bidGame.status === BidGameStatus.Bidding && (
        <ConfirmQuickBidModal
          // re-order initial state whenever bids change
          key={JSON.stringify(bids)}
          bidGameId={bidGame.id}
          isOpen={confirmQuickBidModalOpen}
          onClose={() => {
            setConfirmQuickBidModalOpen(false);
          }}
          quickBids={Object.entries(bids)
            .map(([comboIdStr, bidCoins]) => {
              const comboId = Number(comboIdStr);
              const combo = combos?.find((c) => c.id === Number(comboId));
              if (!combo) {
                return null;
              }
              return { combo, comboId, bidCoins };
            })
            .filter((qb): qb is QuickBidWithCombo => !!qb)}
        />
      )}
    </div>
  );
}
