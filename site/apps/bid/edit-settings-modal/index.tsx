import { FC, useCallback, useState } from 'react';
import { useStyletron } from 'baseui';
import { StatefulPanel } from 'baseui/accordion';
import { Button, KIND } from 'baseui/button';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  ModalProps,
  SIZE,
} from 'baseui/modal';

import GQL from 'lib/graphql';
import { FormControl } from 'baseui/form-control';
import { ButtonGroup, MODE } from 'baseui/button-group';
import { useEditBidGameSettingsMutation } from 'lib/graphql/codegen';

import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import ComboTable, {
  ComboTableRow,
  isAllChecked,
} from 'lib/components/bid-game/combo-table';

interface Props {
  factions: GQL.FactionsQuery;
  playerMats: GQL.PlayerMatsQuery;
  bidPresets: GQL.BidPresetsQuery;
  bidGameId: number;
}

const genTableDataForPreset = (
  { factions }: GQL.FactionsQuery,
  bidPreset: GQL.BidPresetsQuery['bidPresets'][number]
): Array<ComboTableRow> => {
  const factionMatComboMappings: Record<number, Record<number, boolean>> = {};

  bidPreset.bidPresetSettings.forEach(({ enabled, faction, playerMat }) => {
    if (!factionMatComboMappings[faction.id]) {
      factionMatComboMappings[faction.id] = {};
    }

    factionMatComboMappings[faction.id][playerMat.id] = enabled;
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

const EditSettingsModal: FC<ModalProps & Props> = ({
  factions,
  playerMats,
  bidPresets: { bidPresets },
  bidGameId,
  ...modalProps
}) => {
  const [css, theme] = useStyletron();

  const [tableData, setTableData] = useState(
    genTableDataForPreset(factions, bidPresets[0])
  );

  const bidPresetIdx = bidPresets.findIndex((bp) =>
    isEqual(genTableDataForPreset(factions, bp), tableData)
  );

  const selectedBidPreset = bidPresets[bidPresetIdx];

  const [mutate, { loading }] = useEditBidGameSettingsMutation({
    variables: {
      bidGameId,
      settings: {
        bidPresetId: selectedBidPreset?.id ?? null,
        combos: tableData.reduce((acc, curr) => {
          return [
            ...acc,
            ...Object.entries(curr.checked)
              .filter(([, v]) => v)
              .map(([playerMatId]) => ({
                factionId: curr.factionId,
                playerMatId: Number(playerMatId),
              })),
          ];
        }, []),
      },
    },
  });

  const onConfirm = useCallback(async () => {
    await mutate();
    if (modalProps.onClose) {
      modalProps.onClose({ closeSource: 'closeButton' });
    }
  }, []);

  const onCancel = useCallback(() => {
    if (modalProps.onClose) {
      modalProps.onClose({ closeSource: 'closeButton' });
    }
  }, [modalProps.onClose]);

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
      <ModalHeader>Edit Bid Game Settings</ModalHeader>
      <ModalBody
        className={css({
          overflow: 'auto',
          padding: '5px 0',

          [theme.mediaQuery.medium]: {
            overflow: 'visible',
          },
        })}
      >
        <FormControl label={() => 'Game Setting'}>
          <ButtonGroup
            mode={MODE.radio}
            selected={bidPresetIdx}
            onClick={(_event, index) =>
              setTableData(genTableDataForPreset(factions, bidPresets[index]))
            }
            overrides={{
              Root: {
                style: {
                  gap: '10px',
                  flexWrap: 'wrap',
                },
              },
            }}
          >
            {bidPresets.map((p) => (
              <Button
                onClick={() => {
                  setTableData(genTableDataForPreset(factions, p));
                }}
              >
                {p.name}
              </Button>
            ))}
          </ButtonGroup>
        </FormControl>
        <StatefulPanel
          title="Advanced"
          overrides={{
            Header: {
              style: {
                backgroundColor: theme.colors.backgroundPrimary,
                paddingLeft: 0,
                paddingRight: 0,
              },
            },
            PanelContainer: {
              style: {
                marginTop: '30px',
                border: 0,
              },
            },
          }}
        >
          <ComboTable
            tableData={tableData}
            tableHeaderOnChange={() => {
              setTableData((oldTableData) => {
                const allChecked = oldTableData.every((row) =>
                  isAllChecked(row)
                );
                const newTableData = cloneDeep(oldTableData);
                newTableData.forEach((row) => {
                  Object.keys(row.checked).forEach((playerMatId) => {
                    row.checked[Number(playerMatId)] = !allChecked;
                  });
                });

                return newTableData;
              });
            }}
            rowHeaderOnChange={(idx) => {
              setTableData((oldTableData) => {
                if (idx == null) {
                  return oldTableData;
                }

                const newTableData = cloneDeep(oldTableData);
                const newRow = newTableData[idx];
                const prevAllChecked = isAllChecked(newRow);

                Object.keys(newRow.checked).forEach((playerMatId) => {
                  newTableData[newRow.idx].checked[Number(playerMatId)] =
                    !prevAllChecked;
                });

                return newTableData;
              });
            }}
            columnHeaderOnChange={(id: number) => {
              setTableData((oldTableData) => {
                const allChecked = oldTableData.every(
                  ({ checked }) => checked[id]
                );

                return oldTableData.map(({ checked, ...rest }) => {
                  checked[id] = !allChecked;
                  return {
                    checked,
                    ...rest,
                  };
                });
              });
            }}
            cellOnChange={(rowIdx, playerMatId) => {
              setTableData((oldTableData) => {
                const newTableData = cloneDeep(oldTableData);
                newTableData[rowIdx].checked[playerMatId] =
                  !newTableData[rowIdx].checked[playerMatId];
                return newTableData;
              });
            }}
            playerMats={playerMats}
          />
        </StatefulPanel>
      </ModalBody>
      <ModalFooter
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderTop: `1px solid ${theme.colors.primary600}`,
        })}
      >
        <ModalButton kind={KIND.tertiary} onClick={onCancel}>
          Cancel
        </ModalButton>
        <ModalButton
          kind={KIND.secondary}
          onClick={onConfirm}
          isLoading={loading}
        >
          Submit
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

export default EditSettingsModal;
