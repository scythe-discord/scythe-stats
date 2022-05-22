import { cloneDeep } from 'lodash';
import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  OFFICIAL_FACTIONS,
  OFFICIAL_PLAYER_MATS,
} from '../../common/scythe-const';

const ANYTHING_GOES: Record<string, Record<string, boolean>> = {};
OFFICIAL_FACTIONS.forEach((factionName) => {
  ANYTHING_GOES[factionName] = {};
  OFFICIAL_PLAYER_MATS.forEach((playerMatName) => {
    ANYTHING_GOES[factionName][playerMatName] = true;
  });
});

const IFA = cloneDeep(ANYTHING_GOES);
IFA['Rusviet']['Industrial'] = false;
IFA['Crimean']['Patriotic'] = false;

const BASE = cloneDeep(ANYTHING_GOES);
Object.keys(BASE['Togawa']).forEach(
  (playerMat) => (BASE['Togawa'][playerMat] = false)
);
Object.keys(BASE['Albion']).forEach(
  (playerMat) => (BASE['Albion'][playerMat] = false)
);

export class BidPresetsSeed1653247315034 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hiTiers = await queryRunner.query(
      `SELECT f.name AS "faction", p.name AS "playerMat" FROM mat_combo_tier INNER JOIN tier ON mat_combo_tier."tierId" = tier.id INNER JOIN faction f ON mat_combo_tier."factionId" = f.id INNER JOIN player_mat p ON mat_combo_tier."playerMatId" = p.id WHERE tier.rank <= 3`
    );
    const hiTierPreset = cloneDeep(ANYTHING_GOES);
    Object.values(hiTierPreset).forEach((playerMats) => {
      Object.keys(playerMats).forEach((playerMatName) => {
        playerMats[playerMatName] = false;
      });
    });
    hiTiers.forEach(({ faction, playerMat }: any) => {
      hiTierPreset[faction][playerMat] = true;
    });

    const loTiers = await queryRunner.query(
      `SELECT f.name AS "faction", p.name AS "playerMat" FROM mat_combo_tier INNER JOIN tier ON mat_combo_tier."tierId" = tier.id INNER JOIN faction f ON mat_combo_tier."factionId" = f.id INNER JOIN player_mat p ON mat_combo_tier."playerMatId" = p.id WHERE tier.rank >= 3`
    );
    const loTierPreset = cloneDeep(ANYTHING_GOES);
    Object.values(loTierPreset).forEach((playerMats) => {
      Object.keys(playerMats).forEach((playerMatName) => {
        playerMats[playerMatName] = false;
      });
    });
    loTiers.forEach(({ faction, playerMat }: any) => {
      loTierPreset[faction][playerMat] = true;
    });

    const ALL_PRESETS = {
      IFA: {
        position: 0,
        preset: IFA,
      },
      'Base (no IFA)': {
        position: 1,
        preset: BASE,
      },
      'Hi Tier': {
        position: 2,
        preset: hiTierPreset,
      },
      'Lo Tier': {
        position: 3,
        preset: loTierPreset,
      },
      'Anything Goes': {
        position: 4,
        preset: ANYTHING_GOES,
      },
    };

    for (const [presetName, { position, preset }] of Object.entries(
      ALL_PRESETS
    )) {
      const presetRow = await queryRunner.query(
        `INSERT INTO bid_preset (name, position) VALUES ('${presetName}', ${position}) RETURNING id`
      );

      for (const [factionName, playerMats] of Object.entries(preset)) {
        for (const [playerMatName, enabled] of Object.entries(playerMats)) {
          await queryRunner.query(
            `INSERT INTO bid_preset_setting (enabled, "bidPresetId", "factionId", "playerMatId") VALUES (${
              enabled ? 'TRUE' : 'FALSE'
            }, ${
              presetRow[0]['id']
            }, (SELECT id FROM faction WHERE faction.name = '${factionName}'), (SELECT id FROM player_mat WHERE player_mat.name = '${playerMatName}'))`
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE bid_preset, bid_preset_setting`);
  }
}
