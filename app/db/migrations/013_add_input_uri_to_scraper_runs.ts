import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        ALTER TABLE scraper_runs
            ADD COLUMN IF NOT EXISTS input_uri TEXT
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        ALTER TABLE scraper_runs
            DROP COLUMN IF EXISTS input_uri
    `);
}
