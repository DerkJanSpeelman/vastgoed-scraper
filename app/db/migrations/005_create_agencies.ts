import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        CREATE TABLE IF NOT EXISTS agencies (
            id          SERIAL      PRIMARY KEY,
            name        TEXT        NOT NULL,
            website_url TEXT,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`DROP TABLE IF EXISTS agencies`);
}
