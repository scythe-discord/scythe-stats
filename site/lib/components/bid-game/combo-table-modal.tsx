import { FC } from 'react';
import { useStyletron } from 'baseui';
import { Modal, ModalHeader, ModalBody, ModalProps, SIZE } from 'baseui/modal';

import GQL from 'lib/graphql';

import ComboTable, { ComboTableRow } from 'lib/components/bid-game/combo-table';
import { ComboSetting } from 'lib/graphql/codegen';

interface Props {
  factions: GQL.FactionsQuery;
  playerMats: GQL.PlayerMatsQuery;
  combos?: ComboSetting[];
  bidPresetName?: string;
}

const genTableDataFromCombos = (
  combos: ComboSetting[],
  { factions }: GQL.FactionsQuery,
  { playerMats }: GQL.PlayerMatsQuery
): Array<ComboTableRow> => {
  const factionMatComboMappings: Record<number, Record<number, boolean>> = {};

  factions.forEach(({ id: factionId }) => {
    factionMatComboMappings[factionId] = {};
    playerMats.forEach(({ id: playerMatId }) => {
      factionMatComboMappings[factionId][playerMatId] = false;
    });
  });

  combos.forEach(({ factionId, playerMatId }) => {
    factionMatComboMappings[factionId][playerMatId] = true;
  });

  return factions.map(({ id: factionId, name: factionName }, idx) => {
    return {
      idx,
      factionId,
      factionName,
      checked: factionMatComboMappings[factionId],
    };
  });
};

const ComboTableModal: FC<ModalProps & Props> = ({
  factions,
  playerMats,
  combos = [],
  bidPresetName = 'Custom',
  ...modalProps
}) => {
  const [css, theme] = useStyletron();

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
      <ModalHeader>{bidPresetName}</ModalHeader>
      <ModalBody
        className={css({
          overflow: 'auto',
          padding: '5px 0',

          [theme.mediaQuery.medium]: {
            overflow: 'visible',
          },
        })}
      >
        <ComboTable
          tableData={genTableDataFromCombos(combos, factions, playerMats)}
          readonly
          playerMats={playerMats}
        />
      </ModalBody>
    </Modal>
  );
};

export default ComboTableModal;
