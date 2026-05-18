import "dotenv/config";
import { sql } from "../client";

const seederMap: Record<string, () => Promise<{ seed: (s: typeof sql) => Promise<void> }>> = {
  Provinces:     () => import("./ProvincesSeeder"),
  Municipalities: () => import("./MunicipalitiesSeeder"),
  Cities:        () => import("./CitiesSeeder"),
  Agencies:      () => import("./AgenciesSeeder"),
  Listings:      () => import("./ListingsSeeder"),
};

async function runOne() {
  const name = process.argv[2];
  if (!name) {
    console.error("Usage: yarn seed-one <SeederName>");
    console.error("Available:", Object.keys(seederMap).join(", "));
    process.exit(1);
  }

  const loader = seederMap[name];
  if (!loader) {
    console.error(`Unknown seeder: ${name}`);
    console.error("Available:", Object.keys(seederMap).join(", "));
    process.exit(1);
  }

  const mod = await loader();
  await mod.seed(sql);
  console.log(`${name} seeder complete.`);
}

runOne()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => sql.end());
