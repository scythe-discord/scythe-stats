import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useStyletron } from 'baseui';
import { Button, KIND, SIZE } from 'baseui/button';
import { Card } from 'baseui/card';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import { Checkbox, LABEL_PLACEMENT } from 'baseui/checkbox';
import {
  HeadingLarge,
  HeadingMedium,
  LabelMedium,
  HeadingSmall,
  ParagraphSmall,
} from 'baseui/typography';
import { NextComponentType } from 'next';
import { BaseContext } from 'next/dist/shared/lib/utils';
import Image from 'next/image';
import { StatefulTooltip, PLACEMENT } from 'baseui/tooltip';
import { Alert } from 'baseui/icon';
import { StyledLink } from 'baseui/link';

import client from 'lib/apollo-client';
import GQL from 'lib/graphql';
import { getFactionEmblem } from 'lib/scythe';
import ComboTable, { ComboTableRow } from 'lib/components/bid-game/combo-table';
import { shuffle } from 'lodash';
import { assignCombos } from 'apps/game-generator/domain';
import GameBiddingTable from 'apps/game-generator/game-bidding-table';

interface Props {
  factions: GQL.FactionsQuery['factions'];
  playerMats: GQL.PlayerMatsQuery['playerMats'];
  bidPresets: GQL.BidPresetsQuery['bidPresets'];
}

interface GeneratedCombo {
  faction: any;
  playerMat: any;
  playerName: string;
}

interface GameSettings {
  numPlayers: number;
  useCustomCombos: boolean;
  selectedPreset: GQL.BidPresetsQuery['bidPresets'][number] | null;
  enabledCombos: Array<{ factionId: number; playerMatId: number }>;
  playerNames: string[];
}

const DEFAULT_PLAYER_NAMES = [
  'Player 1',
  'Player 2',
  'Player 3',
  'Player 4',
  'Player 5',
  'Player 6',
  'Player 7',
];

const GameGenerator: NextComponentType<BaseContext, Props, Props> = ({
  factions,
  playerMats,
  bidPresets,
}) => {
  const [css, theme] = useStyletron();

  const [settings, setSettings] = useState<GameSettings>({
    numPlayers: 5,
    useCustomCombos: false,
    selectedPreset: bidPresets[1] || null,
    enabledCombos: [],
    playerNames: DEFAULT_PLAYER_NAMES.slice(0, 5),
  });

  const [generatedCombos, setGeneratedCombos] = useState<GeneratedCombo[]>([]);

  useEffect(() => {
    if (settings.useCustomCombos === false) {
      setSettings((prev) => ({
        ...prev,
        enabledCombos:
          settings.selectedPreset?.bidPresetSettings
            .filter((setting) => setting.enabled)
            .map((setting) => ({
              factionId: setting.faction.id,
              playerMatId: setting.playerMat.id,
            })) || [],
      }));
    }
  }, [settings.useCustomCombos, settings.selectedPreset]);

  // Generate combo table data for custom combo selection
  const comboTableData = useMemo((): ComboTableRow[] => {
    let enabledCombosSet: Set<string> = new Set(
      settings.enabledCombos.map(
        (combo) => `${combo.factionId}-${combo.playerMatId}`
      )
    );

    return factions.map((faction, idx) => {
      const checked: Record<number, boolean> = {};
      playerMats.forEach((playerMat) => {
        checked[playerMat.id] = enabledCombosSet.has(
          `${faction.id}-${playerMat.id}`
        );
      });

      return {
        idx,
        factionId: faction.id,
        factionName: faction.name,
        checked,
      };
    });
  }, [factions, playerMats, settings.enabledCombos]);

  // Get available combos based on settings
  const availableCombos = useMemo(() => {
    if (settings.useCustomCombos) {
      return settings.enabledCombos.map((combo) => ({
        faction: factions.find((f) => f.id === combo.factionId)!,
        playerMat: playerMats.find((pm) => pm.id === combo.playerMatId)!,
      }));
    }

    if (settings.selectedPreset) {
      return settings.selectedPreset.bidPresetSettings
        .filter((setting: any) => setting.enabled)
        .map((setting: any) => ({
          faction: factions.find((f) => f.id === setting.faction.id)!,
          playerMat: playerMats.find((pm) => pm.id === setting.playerMat.id)!,
        }));
    }

    // Default: all combos
    const allCombos: Array<{ faction: any; playerMat: any }> = [];
    factions.forEach((faction) => {
      playerMats.forEach((playerMat) => {
        allCombos.push({ faction, playerMat });
      });
    });
    return allCombos;
  }, [settings, factions, playerMats]);

  const updateNumPlayers = useCallback(
    (numPlayers: number) => {
      const newPlayerNames = [...settings.playerNames];
      while (newPlayerNames.length < numPlayers) {
        newPlayerNames.push(
          DEFAULT_PLAYER_NAMES[newPlayerNames.length] ||
            `Player ${newPlayerNames.length + 1}`
        );
      }
      setSettings((prev) => ({
        ...prev,
        numPlayers,
        playerNames: newPlayerNames.slice(0, numPlayers),
      }));
    },
    [settings.playerNames]
  );

  const generateGame = useCallback(() => {
    if (availableCombos.length < settings.numPlayers) {
      alert('Not enough combos available for the number of players selected.');
      return;
    }

    // Shuffle and select random combos
    const shuffledCombos = shuffle(settings.enabledCombos);
    // Assign to players
    const chosenCombos = assignCombos(settings.numPlayers, shuffledCombos, []);

    setGeneratedCombos(
      chosenCombos?.map((combo, index) => ({
        faction: factions.find((f) => f.id === combo.factionId)!,
        playerMat: playerMats.find((pm) => pm.id === combo.playerMatId)!,
        playerName: settings.playerNames[index],
      })) || []
    );
  }, [availableCombos, settings.numPlayers, settings.playerNames]);

  const handleComboTableChange = useCallback(
    (
      type: 'table' | 'row' | 'column' | 'cell',
      rowIdx?: number,
      playerMatId?: number
    ) => {
      setSettings((prev) => {
        const newEnabledCombos = [...prev.enabledCombos];
        const enabledCombosSet = new Set(
          newEnabledCombos.map(
            (combo) => `${combo.factionId}-${combo.playerMatId}`
          )
        );

        if (type === 'table') {
          // Toggle all
          const allEnabled = factions.every((faction) =>
            playerMats.every((playerMat) =>
              enabledCombosSet.has(`${faction.id}-${playerMat.id}`)
            )
          );

          if (allEnabled) {
            return { ...prev, enabledCombos: [] };
          } else {
            const allCombos: Array<{ factionId: number; playerMatId: number }> =
              [];
            factions.forEach((faction) => {
              playerMats.forEach((playerMat) => {
                allCombos.push({
                  factionId: faction.id,
                  playerMatId: playerMat.id,
                });
              });
            });
            return { ...prev, enabledCombos: allCombos };
          }
        }

        if (type === 'row' && rowIdx !== undefined) {
          const faction = factions[rowIdx];
          const allRowEnabled = playerMats.every((playerMat) =>
            enabledCombosSet.has(`${faction.id}-${playerMat.id}`)
          );

          if (allRowEnabled) {
            // Remove all combos for this faction
            return {
              ...prev,
              enabledCombos: newEnabledCombos.filter(
                (combo) => combo.factionId !== faction.id
              ),
            };
          } else {
            // Add all combos for this faction
            const factionCombos = playerMats.map((playerMat) => ({
              factionId: faction.id,
              playerMatId: playerMat.id,
            }));
            return {
              ...prev,
              enabledCombos: [
                ...newEnabledCombos.filter(
                  (combo) => combo.factionId !== faction.id
                ),
                ...factionCombos,
              ],
            };
          }
        }

        if (type === 'column' && playerMatId !== undefined) {
          const allColumnEnabled = factions.every((faction) =>
            enabledCombosSet.has(`${faction.id}-${playerMatId}`)
          );

          if (allColumnEnabled) {
            // Remove all combos for this player mat
            return {
              ...prev,
              enabledCombos: newEnabledCombos.filter(
                (combo) => combo.playerMatId !== playerMatId
              ),
            };
          } else {
            // Add all combos for this player mat
            const playerMatCombos = factions.map((faction) => ({
              factionId: faction.id,
              playerMatId,
            }));
            return {
              ...prev,
              enabledCombos: [
                ...newEnabledCombos.filter(
                  (combo) => combo.playerMatId !== playerMatId
                ),
                ...playerMatCombos,
              ],
            };
          }
        }

        if (
          type === 'cell' &&
          rowIdx !== undefined &&
          playerMatId !== undefined
        ) {
          const faction = factions[rowIdx];
          const comboKey = `${faction.id}-${playerMatId}`;

          if (enabledCombosSet.has(comboKey)) {
            return {
              ...prev,
              enabledCombos: newEnabledCombos.filter(
                (combo) =>
                  !(
                    combo.factionId === faction.id &&
                    combo.playerMatId === playerMatId
                  )
              ),
            };
          } else {
            return {
              ...prev,
              enabledCombos: [
                ...newEnabledCombos,
                { factionId: faction.id, playerMatId },
              ],
            };
          }
        }

        return prev;
      });
    },
    [factions, playerMats]
  );

  return (
    <div
      className={css({
        minHeight: '100vh',
        backgroundColor: theme.colors.backgroundPrimary,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '40px 20px',
        [theme.mediaQuery.medium]: {
          padding: '40px',
        },
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          gap: '20px',
        })}
      >
        <HeadingLarge
          overrides={{
            Block: {
              style: {
                textAlign: 'center',
                marginTop: 0,
                marginBottom: '20px',
              },
            },
          }}
        >
          Scythe Game Generator
        </HeadingLarge>

        <div
          className={css({
            display: 'flex',
            gap: '20px',
            flexDirection: 'column',
            [theme.mediaQuery.medium]: {
              flexDirection: 'row',
              alignItems: 'flex-start',
            },
          })}
        >
          {/* Settings Panel */}
          <div
            className={css({
              flex: '1 0 auto',
              [theme.mediaQuery.medium]: {
                flex: '0 1 400px',
              },
            })}
          >
            <Card>
              <HeadingMedium
                overrides={{
                  Block: {
                    style: {
                      marginTop: 0,
                      marginBottom: '20px',
                    },
                  },
                }}
              >
                Game Settings
              </HeadingMedium>

              {/* Number of Players */}
              <div className={css({ marginBottom: '20px' })}>
                <LabelMedium>Number of Players</LabelMedium>
                <Input
                  type="number"
                  min={2}
                  max={7}
                  value={settings.numPlayers}
                  onChange={(e) => updateNumPlayers(Number(e.target.value))}
                  overrides={{
                    Root: {
                      style: { marginTop: '8px' },
                    },
                  }}
                />
              </div>

              {/* Player Names */}
              <div className={css({ marginBottom: '20px' })}>
                <LabelMedium>Player Names</LabelMedium>
                {settings.playerNames.map((name, index) => (
                  <Input
                    key={index}
                    value={name}
                    onChange={(e) => {
                      const newNames = [...settings.playerNames];
                      newNames[index] = e.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        playerNames: newNames,
                      }));
                    }}
                    placeholder={`Player ${index + 1}`}
                    overrides={{
                      Root: {
                        style: { marginTop: '8px' },
                      },
                    }}
                  />
                ))}
              </div>

              {/* Combo Selection Method */}
              <div className={css({ marginBottom: '20px' })}>
                <Checkbox
                  checked={settings.useCustomCombos}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      useCustomCombos: e.target.checked,
                    }))
                  }
                  labelPlacement={LABEL_PLACEMENT.right}
                >
                  Use Custom Combo Selection
                </Checkbox>
              </div>

              {/* Preset Selection */}
              {!settings.useCustomCombos && (
                <div className={css({ marginBottom: '20px' })}>
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    })}
                  >
                    <LabelMedium>Game Preset</LabelMedium>
                    <StatefulTooltip
                      placement={PLACEMENT.top}
                      content={() => (
                        <div
                          className={css({
                            padding: '10px',
                            maxWidth: '300px',
                          })}
                        >
                          <HeadingSmall
                            overrides={{
                              Block: {
                                style: { marginTop: 0, marginBottom: '10px' },
                              },
                            }}
                          >
                            Game setting details
                          </HeadingSmall>
                          <ParagraphSmall
                            overrides={{
                              Block: {
                                style: { marginTop: 0, marginBottom: '5px' },
                              },
                            }}
                          >
                            <strong>Base</strong> includes only the five default
                            faction and mat options.
                          </ParagraphSmall>
                          <ParagraphSmall
                            overrides={{
                              Block: {
                                style: { marginTop: 0, marginBottom: '5px' },
                              },
                            }}
                          >
                            <strong>IFA</strong> adds Togawa, Albion,
                            Innovative, and Militant.
                          </ParagraphSmall>
                          <ParagraphSmall
                            overrides={{
                              Block: {
                                style: { marginTop: 0, marginBottom: '5px' },
                              },
                            }}
                          >
                            <strong>Hi-tier setting</strong> removes Albion,
                            Togawa, Agricultural, and Engineering.
                          </ParagraphSmall>
                          <ParagraphSmall
                            overrides={{
                              Block: {
                                style: { marginTop: 0, marginBottom: '5px' },
                              },
                            }}
                          >
                            <strong>Lo-tier setting</strong> removes Rusviet,
                            Crimea, Innovative, and Militant.
                          </ParagraphSmall>
                          <StyledLink href="/tiers">
                            Learn more about tiers here.
                          </StyledLink>
                        </div>
                      )}
                      returnFocus
                      autoFocus
                    >
                      <span
                        className={css({
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '18px',
                          height: '18px',
                        })}
                      >
                        <Alert size={18} />
                      </span>
                    </StatefulTooltip>
                  </div>
                  <Select
                    options={bidPresets.map((preset) => ({
                      label: preset.name,
                      id: preset.id,
                    }))}
                    value={
                      settings.selectedPreset
                        ? [
                            {
                              label: settings.selectedPreset.name,
                              id: settings.selectedPreset.id,
                            },
                          ]
                        : []
                    }
                    onChange={({ value }) => {
                      const selectedId = value[0]?.id;
                      const preset =
                        bidPresets.find((p) => p.id === selectedId) || null;
                      setSettings((prev) => ({
                        ...prev,
                        selectedPreset: preset,
                      }));
                    }}
                    overrides={{
                      Root: {
                        style: { marginTop: '8px' },
                      },
                    }}
                  />
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={generateGame}
                disabled={availableCombos.length < settings.numPlayers}
                size={SIZE.large}
                overrides={{
                  BaseButton: {
                    style: {
                      width: '100%',
                    },
                  },
                }}
              >
                Generate Random Game
              </Button>

              {availableCombos.length < settings.numPlayers && (
                <LabelMedium
                  color={theme.colors.negative}
                  overrides={{
                    Block: {
                      style: {
                        marginTop: '8px',
                        textAlign: 'center',
                      },
                    },
                  }}
                >
                  Not enough combos selected ({availableCombos.length}{' '}
                  available, {settings.numPlayers} needed)
                </LabelMedium>
              )}
            </Card>

            {/* Custom Combo Selection */}
            {settings.useCustomCombos && (
              <Card overrides={{ Root: { style: { marginTop: '20px' } } }}>
                <HeadingMedium
                  overrides={{
                    Block: {
                      style: {
                        marginTop: 0,
                        marginBottom: '20px',
                      },
                    },
                  }}
                >
                  Select Combos
                </HeadingMedium>
                <ComboTable
                  tableData={comboTableData}
                  playerMats={playerMats}
                  tableHeaderOnChange={() => handleComboTableChange('table')}
                  rowHeaderOnChange={(rowIdx) =>
                    handleComboTableChange('row', rowIdx)
                  }
                  columnHeaderOnChange={(playerMatId) =>
                    handleComboTableChange('column', undefined, playerMatId)
                  }
                  cellOnChange={(rowIdx, playerMatId) =>
                    handleComboTableChange('cell', rowIdx, playerMatId)
                  }
                />
              </Card>
            )}
          </div>

          {/* Results Panel */}
          <div
            className={css({
              flex: '1 0 auto',
              [theme.mediaQuery.medium]: {
                flex: '1 1 400px',
              },
            })}
          >
            <Card>
              <HeadingMedium
                overrides={{
                  Block: {
                    style: {
                      marginTop: 0,
                      marginBottom: '20px',
                    },
                  },
                }}
              >
                Generated Game
              </HeadingMedium>

              {generatedCombos.length ? (
                <GameBiddingTable combos={generatedCombos} />
              ) : (
                <LabelMedium
                  color={theme.colors.contentSecondary}
                  overrides={{
                    Block: {
                      style: {
                        textAlign: 'center',
                        fontStyle: 'italic',
                        padding: '40px 0',
                      },
                    },
                  }}
                >
                  Click "Generate Random Game" to create your game setup
                </LabelMedium>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const { data: factionsData } = await client.query<
    GQL.FactionsQuery,
    GQL.FactionsQueryVariables
  >({
    query: GQL.FactionsDocument,
    fetchPolicy: 'no-cache',
  });
  const { data: playerMatsData } = await client.query<GQL.PlayerMatsQuery>({
    query: GQL.PlayerMatsDocument,
    fetchPolicy: 'no-cache',
  });
  const { data: bidPresetsData } = await client.query<GQL.BidPresetsQuery>({
    query: GQL.BidPresetsDocument,
    fetchPolicy: 'no-cache',
  });

  return {
    props: {
      factions: factionsData.factions,
      playerMats: playerMatsData.playerMats,
      bidPresets: bidPresetsData.bidPresets,
      initialApolloState: client.cache.extract(),
    },
  };
};

export default GameGenerator;
