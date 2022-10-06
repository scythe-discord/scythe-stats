import { FC, useState } from 'react';
import { useStyletron } from 'baseui';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalProps,
  SIZE,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';
import { arrayMove, List } from 'baseui/dnd-list';

import {
  BidGameFragment,
  QuickBidInput,
  useQuickBidMutation,
} from 'lib/graphql/codegen';
import { getFactionEmblem } from 'lib/scythe';
import { ParagraphMedium } from 'baseui/typography';
import { KIND } from 'baseui/button';
import Image from 'next/image';

export type QuickBidWithCombo = QuickBidInput & {
  combo: NonNullable<BidGameFragment['combos']>[number];
};

interface Props {
  bidGameId: number;
  quickBids: QuickBidWithCombo[];
}

const QuickBidListItem: FC<{
  quickBid: QuickBidWithCombo;
}> = ({ quickBid }) => {
  const [css] = useStyletron();

  return (
    <div
      className={css({ display: 'flex', gap: '10px', alignItems: 'center' })}
    >
      <Image
        src={getFactionEmblem(quickBid.combo.faction.name)}
        alt={quickBid.combo.faction.name}
        width={36}
        height={36}
      />
      ${quickBid.bidCoins} on {quickBid.combo.faction.name}{' '}
      {quickBid.combo.playerMat.name}
    </div>
  );
};

const ConfirmQuickBidModal: FC<ModalProps & Props> = ({
  bidGameId,
  quickBids,
  ...modalProps
}) => {
  const [css, theme] = useStyletron();
  // sort in order of decreasing coins
  const sortedQuickBids = [...quickBids].sort(
    (a, b) => b.bidCoins - a.bidCoins
  );
  const [comboIdsOrder, setComboIdsOrder] = useState(
    sortedQuickBids.map((b) => b.comboId)
  );

  const [mutate, { loading }] = useQuickBidMutation();

  return (
    <Modal
      overrides={{
        Dialog: {
          style: {
            maxWidth: '700px',
            width: '100%',
          },
        },
      }}
      closeable
      animate
      autoFocus
      size={SIZE.auto}
      {...modalProps}
    >
      <ModalHeader>Confirm Bids</ModalHeader>
      <ModalBody
        className={css({
          overflow: 'auto',
          padding: '5px 0',

          [theme.mediaQuery.medium]: {
            overflow: 'visible',
          },
        })}
      >
        <div>
          <ParagraphMedium>
            Drag the faction/player mat combinations to specify the order in
            which to resolve ties (higher priority first), then, when you are
            ready, click Confirm.
          </ParagraphMedium>
          <ParagraphMedium>
            For example, if the minimum bid for{' '}
            {sortedQuickBids[0].combo.faction.name}{' '}
            {sortedQuickBids[0].combo.playerMat.name} is $
            {sortedQuickBids[0].bidCoins},{' '}
            {sortedQuickBids
              .slice(1)
              .map(
                ({ combo, bidCoins }, idx) =>
                  `${idx === sortedQuickBids.length - 2 ? 'and ' : ''}${
                    combo.faction.name
                  } ${combo.playerMat.name} $${bidCoins}`
              )}
            , which combination would you bid on?
          </ParagraphMedium>
        </div>
        <List
          items={quickBids
            .sort(
              (a, b) =>
                comboIdsOrder.indexOf(a.comboId) -
                comboIdsOrder.indexOf(b.comboId)
            )
            .map((qb) => (
              <QuickBidListItem key={qb.comboId} quickBid={qb} />
            ))}
          onChange={({ oldIndex, newIndex }) => {
            setComboIdsOrder((prev) => arrayMove(prev, oldIndex, newIndex));
          }}
        />
      </ModalBody>
      <ModalFooter
        className={css({
          display: 'flex',
          alignItems: 'center',
          borderTop: `1px solid ${theme.colors.primary600}`,
          justifyContent: 'flex-end',
        })}
      >
        <ModalButton
          kind={KIND.tertiary}
          onClick={() => {
            modalProps.onClose?.({ closeSource: 'closeButton' });
          }}
        >
          Cancel
        </ModalButton>
        <ModalButton
          kind={KIND.secondary}
          onClick={async () => {
            await mutate({
              variables: {
                bidGameId: bidGameId,
                quickBids: quickBids.map((qb) => ({
                  comboId: qb.comboId,
                  bidCoins: qb.bidCoins,
                  order: comboIdsOrder.indexOf(qb.comboId),
                })),
              },
            });
            modalProps.onClose?.({ closeSource: 'closeButton' });
          }}
          isLoading={loading}
        >
          Confirm
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmQuickBidModal;
