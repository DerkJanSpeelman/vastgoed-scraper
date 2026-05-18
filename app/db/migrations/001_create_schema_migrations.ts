import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        DROP TABLE IF EXISTS schema_migrations
    `);
}
