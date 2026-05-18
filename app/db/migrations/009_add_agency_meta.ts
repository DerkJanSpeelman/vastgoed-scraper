import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        ALTER TABLE agencies
            ADD COLUMN IF NOT EXISTS is_demo      BOOLEAN NOT NULL DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS data_source  TEXT    NOT NULL DEFAULT 'scraper'
                CHECK (data_source IN ('scraper', 'mailing_list', 'both'))
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        ALTER TABLE agencies
            DROP COLUMN IF EXISTS is_demo,
            DROP COLUMN IF EXISTS data_source
    `);
}
