import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const sql = postgres(connectionString);

async function truncate() {
  await sql.unsafe(/* sql */`
    TRUNCATE listing_prices, listing_images, listings, agencies
    RESTART IDENTITY CASCADE
  `);
  console.log("Truncated: listing_prices, listing_images, listings, agencies");
  await sql.end();
}

truncate().catch((e) => { console.error(e); process.exit(1); });
