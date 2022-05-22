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
import { OptionsT, Select, TYPE } from 'baseui/select';
import { FormControl } from 'baseui/form-control';
import { ButtonGroup, MODE } from 'baseui/button-group';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Checkbox } from 'baseui/checkbox';
import { FactionIcon } from 'lib/components';

interface Props {
  factions: GQL.FactionsQuery;
  playerMats: GQL.PlayerMatsQuery;
  bidPresets: GQL.BidPresetsQuery;
}

interface ComboTableRow {
  idx: number;
  factionId: number;
  factionName: string;
  checked: Record<string, boolean>;
}

const genTableDataForPreset = (
  { factions }: GQL.FactionsQuery,
  bidPreset: {
    __typename?: 'BidPreset';
    id: number;
    name: string;
    bidPresetSettings: Array<{
      __typename?: 'BidPresetSetting';
      id: number;
      enabled: boolean;
      faction: { __typename?: 'Faction'; id: number; name: string };
      playerMat: { __typename?: 'PlayerMat'; id: number; name: string };
    }>;
  }
): Array<ComboTableRow> => {
  const factionMatComboMappings: Record<string, Record<string, boolean>> = {};

  bidPreset.bidPresetSettings.forEach(({ enabled, faction, playerMat }) => {
    if (!factionMatComboMappings[faction.name]) {
      factionMatComboMappings[faction.name] = {};
    }

    factionMatComboMappings[faction.name][playerMat.name] = enabled;
  });

  return factions.map(({ id: factionId, name: factionName }, idx) => {
    return {
      idx,
      factionId,
      factionName,
      checked: factionMatComboMappings[factionName],
    };
  });
};

const CreateRoomModal: FC<ModalProps & Props> = ({
  factions,
  playerMats,
  bidPresets: { bidPresets },
  ...modalProps
}) => {
  const [css, theme] = useStyletron();
  const [selectedSettingInd, setSelectedSettingInd] = useState(0);

  const playerOptions: OptionsT = Array(6)
    .fill(null)
    .map((_, i) => ({ label: `${i + 2} players`, id: i + 2 }));
  const [numPlayers, setNumPlayers] = useState(playerOptions[0]);

  const onCancel = useCallback(() => {
    if (modalProps.onClose) {
      modalProps.onClose({ closeSource: 'closeButton' });
    }
  }, [modalProps.onClose]);

  const onConfirm = useCallback(async () => {
    if (modalProps.onClose) {
      modalProps.onClose({ closeSource: 'closeButton' });
    }
  }, []);

  const [tableData, setTableData] = useState(
    genTableDataForPreset(factions, bidPresets[0])
  );

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
      <ModalHeader>Create Bid Game</ModalHeader>
      <ModalBody
        className={css({
          overflow: 'auto',
          padding: '5px 0',

          [theme.mediaQuery.medium]: {
            overflow: 'visible',
          },
        })}
      >
        <FormControl label={() => 'Number of Players'}>
          <Select
            type={TYPE.select}
            options={playerOptions}
            value={[numPlayers]}
            placeholder="Faction"
            onChange={(params) => {
              if (params.option) {
                setNumPlayers(params.option);
              }
            }}
            required
            overrides={{
              ControlContainer: {
                style: {
                  width: '160px',
                },
              },
            }}
            clearable={false}
          />
        </FormControl>
        <FormControl label={() => 'Game Setting'}>
          <ButtonGroup
            mode={MODE.radio}
            selected={selectedSettingInd}
            onClick={(_event, index) => setSelectedSettingInd(index)}
            overrides={{
              Root: {
                style: {
                  gap: '10px',
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
          <TableBuilder data={tableData}>
            <TableBuilderColumn header="">
              {(row) => {
                const allChecked = Object.values(row.checked).every(
                  (v: boolean) => v
                );
                const hasChecked = Object.values(row.checked).some(
                  (v: boolean) => v
                );

                return (
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0 10px',
                    })}
                  >
                    <Checkbox
                      checked={allChecked}
                      isIndeterminate={hasChecked && !allChecked}
                      onChange={() => {
                        setTableData((oldTableData) => {
                          if (allChecked) {
                            Object.keys(row.checked).forEach(
                              (playerMat) =>
                                (oldTableData[row.idx].checked[playerMat] =
                                  false)
                            );
                          } else {
                            Object.keys(row.checked).forEach(
                              (playerMat) =>
                                (oldTableData[row.idx].checked[playerMat] =
                                  true)
                            );
                          }

                          return [...oldTableData];
                        });
                      }}
                    ></Checkbox>
                    <FactionIcon faction={row.factionName} size={24} />
                  </div>
                );
              }}
            </TableBuilderColumn>
            {playerMats.playerMats.map(({ name, abbrev }) => {
              const allChecked = tableData.every(
                ({ checked }) => checked[name]
              );
              const hasChecked = tableData.some(({ checked }) => checked[name]);
              const header = (
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px 0',
                  })}
                >
                  {abbrev}.
                  <Checkbox
                    checked={allChecked}
                    isIndeterminate={hasChecked && !allChecked}
                    onChange={() => {
                      setTableData((oldTableData) => {
                        if (allChecked) {
                          return oldTableData.map(({ checked, ...rest }) => {
                            checked[name] = false;
                            return {
                              checked,
                              ...rest,
                            };
                          });
                        }

                        return oldTableData.map(({ checked, ...rest }) => {
                          checked[name] = true;
                          return {
                            checked,
                            ...rest,
                          };
                        });
                      });
                    }}
                  />
                </div>
              );

              return (
                <TableBuilderColumn header={header}>
                  {(row) => {
                    return (
                      <div
                        className={css({
                          display: 'flex',
                          justifyContent: 'center',
                        })}
                      >
                        <Checkbox
                          checked={row.checked[name]}
                          onChange={() => {
                            setTableData((oldTableData) => {
                              oldTableData[row.idx].checked[name] =
                                !row.checked[name];
                              return [...oldTableData];
                            });
                          }}
                        />
                      </div>
                    );
                  }}
                </TableBuilderColumn>
              );
            })}
          </TableBuilder>
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
        <ModalButton kind={KIND.secondary} onClick={onConfirm}>
          Create
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

export default CreateRoomModal;
