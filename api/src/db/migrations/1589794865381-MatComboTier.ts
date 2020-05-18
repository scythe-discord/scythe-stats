import { MigrationInterface, QueryRunner } from 'typeorm';

// Hardcoded tier list seeding based off 04/20 tier list
// by the Scythe community Discord
const TIERS = ['SS', 'S', 'A', 'B', 'C', 'D', 'F'];

const TIER_COMBOS: {
  [key: string]: { factionName: string; playerMatName: string }[];
} = {
  SS: [
    {
      factionName: 'Crimean',
      playerMatName: 'Patriotic',
    },
    {
      factionName: 'Crimean',
      playerMatName: 'Militant',
    },
    {
      factionName: 'Crimean',
      playerMatName: 'Innovative',
    },
    {
      factionName: 'Rusviet',
      playerMatName: 'Militant',
    },
    {
      factionName: 'Rusviet',
      playerMatName: 'Innovative',
    },
  ],
  S: [
    {
      factionName: 'Rusviet',
      playerMatName: 'Industrial',
    },
    {
      factionName: 'Rusviet',
      playerMatName: 'Patriotic',
    },
    {
      factionName: 'Rusviet',
      playerMatName: 'Mechanical',
    },
    {
      factionName: 'Crimean',
      playerMatName: 'Engineering',
    },
    {
      factionName: 'Crimean',
      playerMatName: 'Mechanical',
    },
    {
      factionName: 'Polania',
      playerMatName: 'Innovative',
    },
  ],
  A: [
    {
      factionName: 'Crimean',
      playerMatName: 'Industrial',
    },
    {
      factionName: 'Crimean',
      playerMatName: 'Agricultural',
    },
    {
      factionName: 'Rusviet',
      playerMatName: 'Engineering',
    },
    {
      factionName: 'Rusviet',
      playerMatName: 'Agricultural',
    },
    {
      factionName: 'Saxony',
      playerMatName: 'Industrial',
    },
    {
      factionName: 'Saxony',
      playerMatName: 'Innovative',
    },
    {
      factionName: 'Polania',
      playerMatName: 'Mechanical',
    },
  ],
  B: [
    {
      factionName: 'Polania',
      playerMatName: 'Industrial',
    },
    {
      factionName: 'Polania',
      playerMatName: 'Patriotic',
    },
    {
      factionName: 'Polania',
      playerMatName: 'Agricultural',
    },
    {
      factionName: 'Polania',
      playerMatName: 'Militant',
    },
    {
      factionName: 'Nordic',
      playerMatName: 'Engineering',
    },
    {
      factionName: 'Nordic',
      playerMatName: 'Mechanical',
    },
    {
      factionName: 'Nordic',
      playerMatName: 'Innovative',
    },
    {
      factionName: 'Togawa',
      playerMatName: 'Engineering',
    },
    {
      factionName: 'Togawa',
      playerMatName: 'Agricultural',
    },
    {
      factionName: 'Togawa',
      playerMatName: 'Innovative',
    },
    {
      factionName: 'Saxony',
      playerMatName: 'Patriotic',
    },
    {
      factionName: 'Saxony',
      playerMatName: 'Mechanical',
    },
    {
      factionName: 'Saxony',
      playerMatName: 'Militant',
    },
    {
      factionName: 'Albion',
      playerMatName: 'Militant',
    },
  ],
  C: [
    {
      factionName: 'Polania',
      playerMatName: 'Engineering',
    },
    {
      factionName: 'Albion',
      playerMatName: 'Patriotic',
    },
    {
      factionName: 'Albion',
      playerMatName: 'Agricultural',
    },
    {
      factionName: 'Albion',
      playerMatName: 'Innovative',
    },
    {
      factionName: 'Nordic',
      playerMatName: 'Patriotic',
    },
    {
      factionName: 'Nordic',
      playerMatName: 'Agricultural',
    },
    {
      factionName: 'Nordic',
      playerMatName: 'Militant',
    },
    {
      factionName: 'Togawa',
      playerMatName: 'Patriotic',
    },
    {
      factionName: 'Togawa',
      playerMatName: 'Militant',
    },
  ],
  D: [
    {
      factionName: 'Nordic',
      playerMatName: 'Industrial',
    },
    {
      factionName: 'Albion',
      playerMatName: 'Engineering',
    },
    {
      factionName: 'Albion',
      playerMatName: 'Mechanical',
    },
    {
      factionName: 'Togawa',
      playerMatName: 'Mechanical',
    },
    {
      factionName: 'Saxony',
      playerMatName: 'Agricultural',
    },
  ],
  F: [
    {
      factionName: 'Albion',
      playerMatName: 'Industrial',
    },
    {
      factionName: 'Togawa',
      playerMatName: 'Industrial',
    },
    {
      factionName: 'Saxony',
      playerMatName: 'Engineering',
    },
  ],
};

export class MatComboTier1589794865381 implements MigrationInterface {
  name = 'MatComboTier1589794865381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tier" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "rank" integer NOT NULL, CONSTRAINT "UQ_ca31b25988ac3848aef318f9b8f" UNIQUE ("name"), CONSTRAINT "UQ_69eed04bdd0b04a20d31361d4e6" UNIQUE ("rank"), CONSTRAINT "PK_14d67ceef0dbea040e39e97e7f6" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "mat_combo_tier" ("id" SERIAL NOT NULL, "tierId" integer, "factionId" integer, "playerMatId" integer, CONSTRAINT "UQ_b47e2d6a80c42c8607e28b974a9" UNIQUE ("factionId", "playerMatId"), CONSTRAINT "PK_734c543ded8fe8338b3e5dc9097" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "mat_combo_tier" ADD CONSTRAINT "FK_c55878f0f9ee6a136e98b2d2063" FOREIGN KEY ("tierId") REFERENCES "tier"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "mat_combo_tier" ADD CONSTRAINT "FK_d714d4242429af212bdf7eb4f8a" FOREIGN KEY ("factionId") REFERENCES "faction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "mat_combo_tier" ADD CONSTRAINT "FK_e97f569dd10fd68b9ff76e3c7f3" FOREIGN KEY ("playerMatId") REFERENCES "player_mat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined
    );

    const tierValues = TIERS.map((name, order) => `('${name}', ${order})`).join(
      ','
    );

    await queryRunner.query(
      `INSERT INTO tier (name, rank) VALUES ${tierValues}`
    );

    const tiers = await queryRunner.query(`SELECT id, name FROM tier`);
    const factions = await queryRunner.query(`SELECT id, name FROM faction`);

    const playerMats = await queryRunner.query(
      `SELECT id, name FROM player_mat`
    );

    const tierToId: { [key: string]: number } = {};
    const factionToId: { [key: string]: number } = {};
    const playerMatToId: { [key: string]: number } = {};

    tiers.forEach(
      ({ id, name }: { id: number; name: string }) => (tierToId[name] = id)
    );
    factions.forEach(
      ({ id, name }: { id: number; name: string }) => (factionToId[name] = id)
    );
    playerMats.forEach(
      ({ id, name }: { id: number; name: string }) => (playerMatToId[name] = id)
    );

    const values: string[] = [];
    TIERS.map((tierName) => {
      const tierId = tierToId[tierName];
      const currTierCombos = TIER_COMBOS[tierName];
      currTierCombos.forEach(({ factionName, playerMatName }) => {
        const factionId = factionToId[factionName];
        const playerMatId = playerMatToId[playerMatName];
        values.push(`(${tierId}, ${factionId}, ${playerMatId})`);
      });
    });

    await queryRunner.query(
      `INSERT INTO mat_combo_tier ("tierId", "factionId", "playerMatId") VALUES ${values.join(
        ','
      )}`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mat_combo_tier" DROP CONSTRAINT "FK_e97f569dd10fd68b9ff76e3c7f3"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "mat_combo_tier" DROP CONSTRAINT "FK_d714d4242429af212bdf7eb4f8a"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "mat_combo_tier" DROP CONSTRAINT "FK_c55878f0f9ee6a136e98b2d2063"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "mat_combo_tier"`, undefined);
    await queryRunner.query(`DROP TABLE "tier"`, undefined);
  }
}
