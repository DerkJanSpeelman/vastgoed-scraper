import postgres from "postgres";
import * as m001 from "./001_create_schema_migrations";
import * as m002 from "./002_create_provinces";
import * as m003 from "./003_create_municipalities";
import * as m004 from "./004_create_cities";
import * as m005 from "./005_create_agencies";
import * as m006 from "./006_create_listings";
import * as m007 from "./007_create_listing_images";
import * as m008 from "./008_create_listing_prices";
import * as m009 from "./009_add_agency_meta";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const sql = postgres(connectionString);

const migrations = [
  { version: "001_create_schema_migrations", ...m001 },
  { version: "002_create_provinces", ...m002 },
  { version: "003_create_municipalities", ...m003 },
  { version: "004_create_cities", ...m004 },
  { version: "005_create_agencies", ...m005 },
  { version: "006_create_listings", ...m006 },
  { version: "007_create_listing_images", ...m007 },
  { version: "008_create_listing_prices", ...m008 },
  { version: "009_add_agency_meta", ...m009 },
];

async function migrate() {
  await sql.unsafe(/* sql */`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const applied = await sql<{ version: string }[]>`
    SELECT version FROM schema_migrations ORDER BY version
  `;
  const appliedSet = new Set(applied.map((r) => r.version));

  for (const migration of migrations) {
    if (appliedSet.has(migration.version)) continue;
    console.log(`Applying migration: ${migration.version}`);
    await sql.begin(async (tx) => {
      await migration.up(tx);
      await tx`INSERT INTO schema_migrations (version) VALUES (${migration.version})`;
    });
    console.log(`Applied: ${migration.version}`);
  }

  console.log("Migrations complete.");
  await sql.end();
}

async function rollback() {
  const applied = await sql<{ version: string }[]>`
    SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1
  `;

  if (applied.length === 0) {
    console.log("Nothing to roll back.");
    await sql.end();
    return;
  }

  const last = applied[0].version;
  const migration = migrations.find((m) => m.version === last);

  if (!migration) {
    console.error(`No migration found for version: ${last}`);
    await sql.end();
    process.exit(1);
  }

  console.log(`Rolling back: ${last}`);
  await sql.begin(async (tx) => {
    await migration.down(tx);
    await tx`DELETE FROM schema_migrations WHERE version = ${last}`;
  });
  console.log(`Rolled back: ${last}`);
  await sql.end();
}

const command = process.argv[2];
if (command === "rollback") {
  rollback().catch((e) => { console.error(e); process.exit(1); });
} else {
  migrate().catch((e) => { console.error(e); process.exit(1); });
}
