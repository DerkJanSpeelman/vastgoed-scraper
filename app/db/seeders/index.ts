import "dotenv/config";
import { sql } from "../client";
import { seed as seedProvinces }     from "./ProvincesSeeder";
import { seed as seedMunicipalities } from "./MunicipalitiesSeeder";
import { seed as seedCities }         from "./CitiesSeeder";
import { seed as seedAgencies }       from "./AgenciesSeeder";
import { seed as seedListings }       from "./ListingsSeeder";

async function runAll() {
  await seedProvinces(sql);
  await seedMunicipalities(sql);
  await seedCities(sql);
  await seedAgencies(sql);
  await seedListings(sql);
  console.log("Seed complete.");
}

runAll()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => sql.end());
