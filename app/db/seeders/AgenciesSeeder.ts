import { Sql } from "postgres";

export async function seed(sql: Sql) {
  await sql.begin(async (tx) => {
    await tx/* sql */`
      INSERT INTO agencies (name, website_url, is_demo, data_source)
      VALUES ('Demo Makelaars', NULL, true, 'scraper')
      ON CONFLICT DO NOTHING
    `;
  });
}
