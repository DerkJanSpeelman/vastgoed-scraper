import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("@db:");

if (!isLocal) {
  console.error("ERROR: Refusing to truncate — DATABASE_URL does not point to a local host.");
  console.error("Only run truncate against a local development database.");
  process.exit(1);
}

const sql = postgres(connectionString);

async function truncate() {
  await sql`TRUNCATE listing_prices, listing_images, listings, agencies RESTART IDENTITY CASCADE`;
  console.log("Truncated: listing_prices, listing_images, listings, agencies");
  await sql.end();
}

truncate().catch((e) => { console.error(e); process.exit(1); });
