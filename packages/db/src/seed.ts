import { fileURLToPath } from 'node:url';
import { type Database, getDb } from './client';
import * as schema from './schema';

/**
 * Core reference data, with values taken verbatim from production. Inserted in
 * id order so a fresh DB's serial ids line up with prod (1..N).
 *
 * NOTE: the per-preset enabled-combo matrix (`bid_preset_setting`, 245 rows) is
 * intentionally NOT seeded here — it's bid-feature config that isn't exercised
 * until that phase, and it's re-extractable from a prod dump when needed.
 */
const FACTIONS = [
  { name: 'Polania', position: 1 },
  { name: 'Saxony', position: 7 },
  { name: 'Crimean', position: 6 },
  { name: 'Nordic', position: 3 },
  { name: 'Rusviet', position: 4 },
  { name: 'Albion', position: 2 },
  { name: 'Togawa', position: 5 },
];

const PLAYER_MATS = [
  { name: 'Industrial', abbrev: 'Ind', order: 1 },
  { name: 'Engineering', abbrev: 'Eng', order: 2 },
  { name: 'Patriotic', abbrev: 'Pat', order: 4 },
  { name: 'Mechanical', abbrev: 'Mech', order: 6 },
  { name: 'Agricultural', abbrev: 'Agri', order: 7 },
  { name: 'Militant', abbrev: 'Mil', order: 3 },
  { name: 'Innovative', abbrev: 'Inno', order: 5 },
];

const TIERS = [
  { name: 'SS', rank: 0 },
  { name: 'S', rank: 1 },
  { name: 'A', rank: 2 },
  { name: 'B', rank: 3 },
  { name: 'C', rank: 4 },
  { name: 'D', rank: 5 },
  { name: 'F', rank: 6 },
];

// Only one preset may be the default (unique boolean); the rest are NULL, not
// false, so they don't collide on the unique constraint.
const BID_PRESETS = [
  { name: 'IFA', position: 0, default: true },
  { name: 'Base (no IFA)', position: 1 },
  { name: 'Hi Tier', position: 2 },
  { name: 'Lo Tier', position: 3 },
  { name: 'Anything Goes', position: 4 },
];

export async function seedReferenceData(db: Database): Promise<void> {
  await db.insert(schema.faction).values(FACTIONS).onConflictDoNothing();
  await db.insert(schema.playerMat).values(PLAYER_MATS).onConflictDoNothing();
  await db.insert(schema.tier).values(TIERS).onConflictDoNothing();
  await db.insert(schema.bidPreset).values(BID_PRESETS).onConflictDoNothing();
}

// Run directly via `pnpm db:seed`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = getDb();
  await seedReferenceData(db);
  console.log('✓ Seeded reference data (factions, player mats, tiers, bid presets).');
  await db.$client.end();
}
