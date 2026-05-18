import postgres from "postgres";

export async function up(sql: postgres.TransactionSql): Promise<void> {
  await sql.unsafe(/* sql */`
    ALTER TABLE scraper_runs
      DROP CONSTRAINT scraper_runs_agency_id_fkey,
      ADD CONSTRAINT scraper_runs_agency_id_fkey
        FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
  `);
}

export async function down(sql: postgres.TransactionSql): Promise<void> {
  await sql.unsafe(/* sql */`
    ALTER TABLE scraper_runs
      DROP CONSTRAINT scraper_runs_agency_id_fkey,
      ADD CONSTRAINT scraper_runs_agency_id_fkey
        FOREIGN KEY (agency_id) REFERENCES agencies(id)
  `);
}
